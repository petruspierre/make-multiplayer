import { html, LitElement, PropertyValues } from "lit";
import { createContext, provide } from "@lit/context";
import { customElement, property } from "lit/decorators.js";
import PartySocket from "partysocket";
import { ChromeMessage, chromeMessages } from "@/core/chromeMessages";
import { getSocketForSession } from "./client";
import { produce } from "immer";

export const sessionContext = createContext<SessionState>(Symbol.for("game-context"))

export enum SessionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

export type SessionState = {
  code: string | null
  socket: PartySocket | null
  status: SessionStatus
}

@customElement('mmp-session-provider')
export class SessionProvider extends LitElement {
  @provide({ context: sessionContext })
  @property({ type: Object })
  public state!: SessionState

  protected updated(_changedProperties: PropertyValues): void {
		super.updated(_changedProperties);
		console.log('SessionProvider updated', _changedProperties, this.state);
	}

  connectedCallback(): void {
    super.connectedCallback()

    this.state = {
      code: null,
      socket: null,
      status: SessionStatus.CONNECTING
    }

    console.log('Session provider connected')
    
    chrome.runtime.onMessage.addListener((message: ChromeMessage, sender, sendResponse) => {
      const { type, payload } = message
      switch (type) {
        case chromeMessages.CREATE_SESSION:
          this.createNewSession()
          break
        case chromeMessages.JOIN_SESSION:
          this.joinSession()
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

        const socket = getSocketForSession(code)

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

  private joinSession = async () => {
    try {
      const socket = getSocketForSession('ABC123')

      this.state = {
        ...this.state,
        code: 'ABC123',
        socket,
        status: SessionStatus.CONNECTED
      }
    } catch {
      this.state = {
        ...this.state,
        status: SessionStatus.ERROR
      }
    }
  }

  render() {
    return html`
      <div>${this.state.status}</div>
      <slot></slot>
    `
  }
}