import { sessionContext, SessionState } from "@/socket/session-context";
import { consume } from "@lit/context";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import * as script from "./conexo-script";
import { conexoEvents } from "./conexo-events";
import { SocketMessages, socketMessages } from "party/utils/messages";

@customElement('mmp-conexo-overlay')
export class conexoOverlay extends LitElement {
  @consume({ context: sessionContext, subscribe: true })
  @state()
  private sessionState!: SessionState;

  @state()
  private playerState: Record<string, script.ConexoGameState> = {}
  
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

    window.addEventListener(conexoEvents.UPDATE_STATE as any, (event: CustomEvent) => {
      console.log('State updated', event.detail.gameState)
      const newState: script.ConexoGameState = event.detail.gameState;

      this.sessionState.sendMessage({
        type: socketMessages.PLAYER_STATE_UPDATE,
        payload: {
          gameState: newState
        }
      })
    })

    this.sessionState.addListener(socketMessages.PLAYER_STATE_UPDATED, (event: SocketMessages) => {
      console.log('Player state updated', event.payload)
      const { playerState } = event.payload as { playerState: Record<string, script.ConexoGameState> };

      const finishedPlayers = this.sessionState.players
        .filter(player => playerState[player.connectionId].endedAt);
      
      if (isHost && finishedPlayers.length === this.sessionState.players.length) {
        this.sessionState.sendMessage({
          type: socketMessages.END_SESSION,
          payload: null
        })
      }

      this.playerState = playerState;
    })
  }

  render() {
    return html`
      <mmp-draggable-box>
        <div slot="header">
          <mmp-typography variant="h3">conexo</mmp-typography>
        </div>
        <div slot="body">
          <div class="players-container">
            ${this.sessionState.players.map(player => {
              const state = this.playerState[player.connectionId]

              return html`
                <div class="player-wrapper">
                  <div class="player-info">
                    <mmp-typography weight=600 variant="body1">${player.name}</mmp-typography>
                    <div class="tile-wrapper">
                      ${Array(4).fill(0).map((_, index) => {
                        const group = state.groups[index];
                        return html`
                          <div class="tile" style=${group ? `background: ${group}` : ''}></div>
                        `
                      })}
                    </div>
                  </div>
                  <div class="player-stats">
                    <mmp-typography variant="body1">${state.currentAttempt} TENTATIVA${state.currentAttempt !== 1 ? 'S' : ''}</mmp-typography>
                    <mmp-typography variant="body1">${state.hintsTaken} DICA${state.hintsTaken !== 1 ? 'S' : ''}</mmp-typography>
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
    mmp-typography {
      color: black;
    }

    .players-container {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .player-wrapper {
      display: flex;
      justify-content: space-between;
      gap: 16px;
    }

    .player-wrapper:not(:last-child) {
      padding-bottom: 8px;
      border-bottom: 1px solid #D9D9D9;
    }

    .player-info {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .player-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .player-info mmp-typography {
      font-weight: 800;
    }

    .player-wrapper .player-info .player-position {
      font-size: 2rem;
    }

    .tile-wrapper {
      display: flex;
      gap: 2px;
      margin-bottom: 4px;
    }
    
    .tile {
      width: 16px;
      height: 16px;
      background: #D9D9D9;
    }

    p {
      margin: 0;
    }
  `
}