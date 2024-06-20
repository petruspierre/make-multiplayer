import { html, LitElement } from "lit";
import { createContext, provide } from "@lit/context";
import { customElement, property } from "lit/decorators.js";
import PartySocket from "partysocket";

export const sessionContext = createContext<SessionState>(Symbol.for("game-context"))

export type SessionState = {
  code: string | null
  socket: PartySocket | null
}

@customElement('mmp-session-provider')
export class SessionProvider extends LitElement {
  @provide({ context: sessionContext })
  @property({ type: Object })
  public state: SessionState = {
    code: null,
    socket: null
  }

  render() {
    return html`<slot></slot>`
  }
}