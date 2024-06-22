import { sessionContext, SessionState } from "@/socket/session-context";
import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as script from "./letrinha-script";
import { letrinhaEvents } from "./letrinha-events";
import { SocketMessages, socketMessages } from "party/utils/messages";

@customElement('mmp-letrinha-overlay')
export class LetrinhaOverlay extends LitElement {
  @consume({ context: sessionContext, subscribe: true })
  @state()
  private sessionState!: SessionState;

  @state()
  private playerState: Record<string, script.LetrinhaGameState> = {}
  
  connectedCallback(): void {
    super.connectedCallback();

    script.run();

    window.addEventListener(letrinhaEvents.NEW_GUESS as any, (event: CustomEvent) => {
      console.log('New guess', event.detail.gameState)
      this.sessionState.sendMessage({
        type: socketMessages.PLAYER_STATE_UPDATE,
        payload: {
          gameState: event.detail.gameState
        }
      })
    })

    this.sessionState.addListener(socketMessages.PLAYER_STATE_UPDATED, (event: SocketMessages) => {
      console.log('Player state updated', event.payload)
      const { playerState } = event.payload;

      this.playerState = playerState;
    })
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
            ${this.sessionState.players.map(player => {
              const state = this.playerState[player.connectionId] || {};
              return html`
                <p>${player.name} - ${state.currentAttempt}/${state.maxAttempts}</p>
              `
            })}
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