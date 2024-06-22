import { html, LitElement, PropertyValues } from "lit";
import { createContext, provide } from "@lit/context";
import { customElement, property, state } from "lit/decorators.js";
import PartySocket from "partysocket";
import { ChromeMessage, chromeMessages } from "@/core/chromeMessages";
import { getSocketForSession } from "./client";
import { produce } from "immer";
import { Player, socketMessages, SocketMessages } from '../../party/utils/messages'

export const sessionContext = createContext<SessionState>(Symbol.for("game-context"))

export enum SessionStatus {
  NOT_CONNECTED = 'not_connected',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export type SessionState = {
  code: string | null
  socket: PartySocket | null
  status: SessionStatus
  players: Player[]
  self?: Player
  leaveSession: () => void
  sendMessage: (message: SocketMessages) => void
  addListener: (event: string, callback: (event: SocketMessages) => void) => void
}

@customElement('mmp-session-provider')
export class SessionProvider extends LitElement {
  @provide({ context: sessionContext })
  @property({ type: Object })
  public state!: SessionState

  @state()
  private listeners: Map<string, (event: SocketMessages) => void> = new Map()

  connectedCallback(): void {
    super.connectedCallback()

    this.state = {
      code: null,
      socket: null,
      status: SessionStatus.NOT_CONNECTED,
      players: [],
      sendMessage: this.sendMessage.bind(this),
      leaveSession: this.leaveSession.bind(this),
      addListener: this.addListener.bind(this)
    }
    
    chrome.runtime.onMessage.addListener((message: ChromeMessage, _, sendResponse) => {
      const { type, payload } = message
      switch (type) {
        case chromeMessages.CREATE_SESSION:
          this.createNewSession()
          break
        case chromeMessages.JOIN_SESSION:
          this.joinSession(payload.code)
          break
        case chromeMessages.FETCH_SESSION:
          sendResponse(this.state.code)
          break
      }
    })
  }

  private createNewSession = async () => {
    try {
      const response = await fetch(`http://localhost:1999/party/make-multiplayer-party`, {
        method: "POST",
      });

      if (response.ok) {
        const { code } = await response.json();

        const socket = await this.connectToSession(code)

        this.state = produce(this.state, draft => {
          draft.code = code
          draft.socket = socket
          draft.status = SessionStatus.CONNECTED
        })
      }
    } catch {
      this.state = produce(this.state, draft => {
        draft.status = SessionStatus.ERROR
      })
    }
  }

  private joinSession = async (code: string) => {
    if(!code) return

    try {
      const socket = await this.connectToSession(code)

      this.state = produce(this.state, draft => {
        draft.code = code
        draft.socket = socket
        draft.status = SessionStatus.CONNECTED
      })
    } catch {
      this.state = produce(this.state, draft => {
        draft.status = SessionStatus.ERROR
      })
    }
  }

  private connectToSession = async (code: string) => {
    const socket = getSocketForSession(code)

    socket.onmessage = (event) => {
      const message: SocketMessages = JSON.parse(event.data)
      console.log('Received socket message', message)

      console.log(this.listeners.keys())
      this.listeners.forEach((callback, key) => {
        if (message.type === key) {
          console.log('Caught listener for event', message.type)
          callback(message)
        }
      })

      switch (message.type) {
        case socketMessages.PLAYER_DISCONNECTED:
        case socketMessages.PLAYER_CONNECTED:
        case socketMessages.LOAD_PLAYERS:
          const { players } = message.payload;

          this.state = produce(this.state, draft => {
            draft.self = players.find((player: any) => player.connectionId === socket.id)
            draft.players = players
          })
          break
      }
    }

    return socket
  }

  addListener = (event: string, callback: (event: SocketMessages) => void) => {
    this.listeners.set(event, callback)
  }

  leaveSession = () => {
    this.state.socket?.close()
    this.state = produce(this.state, draft => {
      draft.code = null
      draft.socket = null
      draft.status = SessionStatus.NOT_CONNECTED
      draft.players = []
      draft.leaveSession = this.leaveSession.bind(this)
    })
  }

  sendMessage = (message: SocketMessages) => {
    console.log('Sending message', message)
    this.state.socket?.send(JSON.stringify(message))
  }

  render() {
    return html`
      <slot></slot>
    `
  }
}