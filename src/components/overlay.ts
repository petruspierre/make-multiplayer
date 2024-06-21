import { sessionContext, SessionState, SessionStatus } from "@/socket/session-context";
import { consume } from "@lit/context";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export enum OverlayStatus {
  NOT_CONNECTED = 'not_connected',
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

@customElement('mmp-overlay')
export class Overlay extends LitElement {
  @property()
  status: OverlayStatus = OverlayStatus.NOT_CONNECTED;

  @consume({ context: sessionContext, subscribe: true })
  @state()
  sessionState!: SessionState;

  connectedCallback(): void {
    super.connectedCallback();

    console.log('Overlay connected')
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    if (_changedProperties.has('sessionState')) {
      console.log('Session status updated to ', this.sessionState.status)
      if (this.sessionState.status === SessionStatus.CONNECTED) {
        this.status = OverlayStatus.NOT_STARTED
      }
    }
  }

  get players() {
    return this.sessionState.players
  }

  get isHost() {
    return this.sessionState.self?.isHost
  }

  notStartedTemplate() {
    if (this.players.length < 1) {
      return html`
        <p class="title">Obtendo dados da sessão...</p>
      `
    }

    return html`
      <div>
        ${this.players.length === 1 ? html`
          <p class="title">Aguardando mais jogadores...</p>
        ` : this.isHost ? html`
          <p class="title">Inicie quando estiver pronto</p>
        ` : html`
          <p class="title">Aguardando início da sessão...</p>
        `}
        <span>${this.players.length} conectados.</span>

        <div class="actions">
          <button>Sair da sessão</button>

          ${this.isHost ? html`
            <button ?disabled=${this.players.length < 2}>Iniciar sessão</button>
          ` : ''}
        </div>
      </div>
    `
  }

  render() {
    if (this.status === OverlayStatus.NOT_CONNECTED) {
      return html``
    }

    return html`
      <div class="background">
        <div class="content">
          <div class="header">
            <span>SESSÃO ${this.sessionState.code}</span>
          </div>
          <div class="body">
            ${this.status === OverlayStatus.NOT_STARTED ? this.notStartedTemplate() : ''}
          </div>
        </div>
      </div>
    `
  }

  static styles = css`
    .background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(2px);
      z-index: 1000;
    }
    
    .content {
      display: flex;
      height: 100%;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      color: white;
      max-width: 400px;
      margin: 0 auto;
    }

    .body {
      display: flex;
      flex: 1;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    .body .title {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      font-weight: bold;
    }
  `
}