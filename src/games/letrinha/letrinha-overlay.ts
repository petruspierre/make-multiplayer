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

    script.run();

    const initialPlayerState = script.getInitialState(this.sessionState.players)
    this.playerState = initialPlayerState;

    const isHost = this.sessionState.self?.isHost;

    if (isHost) {
      this.sessionState.sendMessage({
        type: socketMessages.PLAYER_STATE_HYDRATE,
        payload: {
          playerState: initialPlayerState
        }
      })
    }

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
      <mmp-draggable-box>
        <div slot="header">
          <mmp-typography variant="h3">Letrinha</mmp-typography>
        </div>
        <div slot="body">
          <div class="players-container">
            ${this.sessionState.players.map(player => {
              const state = this.playerState[player.connectionId] || {
                currentAttempt: 1,
                maxAttempts: 7,
                lastValues: []
              };

              return html`
                <div class="player-wrapper">
                  <div class="player-info">
                    <mmp-typography variant="body1">${player.name}</mmp-typography>

                    <!-- <mmp-typography class="player-position">2°</mmp-typography> -->
                  </div>
                  <div class="player-stats">
                    <mmp-typography variant="body1">${state.currentAttempt}/${state.maxAttempts} TENTATIVAS</mmp-typography>

                    <div class="tile-wrapper">
                      ${!state.lastValues || state.lastValues.length === 0 ?
                        Array(state.maxAttempts - 1)
                          .fill(0)
                          .map(() => html`<div class="tile">-</div>`)
                        : ''}

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
                </div>
              `
            })}
          </div>
        </div>
      </mmp-draggable-box>
    `
  }

  static styles = css`
    .players-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .player-wrapper {
      display: flex;
      justify-content: space-between;
      gap: 8px;
    }

    .player-wrapper:not(:last-child) {
      padding-bottom: 8px;
      border-bottom: 1px solid #D9D9D9;
    }

    .player-info {}

    .player-stats {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .player-wrapper .player-info .player-position {
      font-size: 2rem;
    }

    .tile-wrapper {
      display: flex;
      gap: 2px;
    }
    
    .tile {
      width: 16px;
      height: 16px;
    }

    .wrong {
      background: #D9D9D9;
    }

    .partial {
      background: rgb(244, 173, 35);
    }

    .exact {
      background: rgb(39, 177, 94);
    }

    p {
      margin: 0;
    }
  `
}