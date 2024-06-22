import { sessionContext, SessionState } from "@/socket/session-context";
import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as script from "./letrinha-script";
import { letrinhaEvents } from "./letrinha-events";
import { SocketMessages, socketMessages } from "party/utils/messages";
import { classMap } from "lit/directives/class-map.js";

@customElement('mmp-letrinha-overlay')
export class LetrinhaOverlay extends LitElement {
  @consume({ context: sessionContext, subscribe: true })
  @state()
  private sessionState!: SessionState;

  @state()
  private playerState: Record<string, script.LetrinhaGameState> = {}
  
  connectedCallback(): void {
    super.connectedCallback();

    // script.run();

    // const initialPlayerState = script.getInitialState(this.sessionState.players)
    // this.playerState = initialPlayerState;

    // const isHost = this.sessionState.self?.isHost;

    // if (isHost) {
    //   this.sessionState.sendMessage({
    //     type: socketMessages.PLAYER_STATE_HYDRATE,
    //     payload: {
    //       playerState: initialPlayerState
    //     }
    //   })
    // }

    // window.addEventListener(letrinhaEvents.NEW_GUESS as any, (event: CustomEvent) => {
    //   console.log('New guess', event.detail.gameState)
    //   this.sessionState.sendMessage({
    //     type: socketMessages.PLAYER_STATE_UPDATE,
    //     payload: {
    //       gameState: event.detail.gameState
    //     }
    //   })
    // })

    // this.sessionState.addListener(socketMessages.PLAYER_STATE_UPDATED, (event: SocketMessages) => {
    //   console.log('Player state updated', event.payload)
    //   const { playerState } = event.payload;

    //   this.playerState = playerState;
    // })
  }

  render() {
    return html`
      <mmp-draggable-box>
        <div slot="header">
          <span>Letrinha</span>
        </div>
        <div slot="body">
          ${this.sessionState.players.map(player => {
            const state = this.playerState[player.connectionId] || {
              currentAttempt: 1,
              maxAttempts: 6,
              lastValues: [0,1,1,2,0]
            };
            return html`
              <div>
                <p>${player.name} - ${state.currentAttempt}/${state.maxAttempts}</p>
                <div class="tile-wrapper">
                  ${state.lastValues?.map((value: script.Guess) => html`
                    <div class=${classMap({
                      wrong: value === script.Guess.WRONG,
                      partial: value === script.Guess.PARTIAL,
                      exact: value === script.Guess.EXACT,
                      tile: true
                    })}></div>
                  `)}
                </div>
              </div>
            `
          })}
        </div>
      </mmp-draggable-box>
    `
  }

  static styles = css`
    .tile-wrapper {
      display: flex;
      gap: 2px;
    }
    
    .tile {
      width: 16px;
      height: 16px;
    }

    .wrong {
      background: red;
    }

    .partial {
      background: yellow;
    }

    .exact {
      background: green;
    }

    p {
      margin: 0;
    }
  `
}