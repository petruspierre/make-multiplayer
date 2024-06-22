import { sessionContext, SessionState } from "@/socket/session-context";
import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement('mmp-letrinha-overlay')
export class LetrinhaOverlay extends LitElement {
  @consume({ context: sessionContext, subscribe: true })
  @state()
  private sessionState!: SessionState;

  connectedCallback(): void {
    super.connectedCallback();
  }

  render() {
    return html`
      <div class="container">
        <div class="content">
          <div class="header">
            <span>Letrinha</span>
            <button>Sair</button>
          </div>
          <div class="body">
            ${this.sessionState.players.map(player => html`
              <p>${player.name}</p>
            `)}
          </div>
        </div>
      </div>
    `
  }

  static styles = css`
    .container {
      position: sticky;
      bottom: 8px;
      left: 8px;
      width: 100px;
      z-index: 100;
      color: white;
    }

    .content {
      display: flex;
      flex-direction: column;
      background: rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 6px;
    }

    p {
      margin: 0;
    }
  `
}