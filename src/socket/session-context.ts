import { html, LitElement, PropertyValues } from "lit";
import { createContext, provide } from "@lit/context";
import { customElement, property, state } from "lit/decorators.js";
import PartySocket from "partysocket";
import { ChromeMessage, chromeMessages } from "@/core/chromeMessages";
import { getSocketForSession } from "./client";
import { produce } from "immer";

export const sessionContext = createContext<SessionState>(Symbol.for("game-context"))

export enum SessionStatus {
  NOT_CONNECTED = 'not_connected',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export type SessionState = {
  code: string | null
  socket: PartySocket | null
  status: SessionStatus,
  addListener: (event: string, listener: (event: any) => void) => void
}

@customElement('mmp-session-provider')
export class SessionProvider extends LitElement {
  @provide({ context: sessionContext })
  @property({ type: Object })
  public state!: SessionState

  @state()
  private listeners: Map<string, ((event: any) => void)[]> = new Map()

  connectedCallback(): void {
    super.connectedCallback()

    this.state = {
      code: null,
      socket: null,
      status: SessionStatus.NOT_CONNECTED,
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

  private addListener = (event: string, listener: (event: any) => void) => {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    this.listeners.get(event)?.push(listener)
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
      console.log('Message from server ', event.data)
    }

    return socket
  }

  render() {
    return html`
      <div>${this.state.status}</div>
      <slot></slot>
    `
  }
}