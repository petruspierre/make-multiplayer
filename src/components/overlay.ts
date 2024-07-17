import { sessionContext, SessionState, SessionStatus } from "@/socket/session-context";
import { consume } from "@lit/context";
import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { socketMessages } from "party/utils/messages";

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

  @property()
  showGameOverlay: () => void = () => { };
  
  @property()
  hideGameOverlay: () => void = () => {};

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);

    if (_changedProperties.has('sessionState')) {
      const previousStatus = _changedProperties.get('sessionState')?.status
      this.handleSessionStatusChange(previousStatus)
    }
  }

  private handleSessionStatusChange(previousStatus: SessionStatus) {
    const currentStatus = this.sessionState.status

    if (previousStatus === SessionStatus.NOT_CONNECTED && currentStatus === SessionStatus.CONNECTED) {
      this.status = OverlayStatus.NOT_STARTED

      this.sessionState.addListener(socketMessages.SESSION_STARTED, () => {
        this.status = OverlayStatus.IN_PROGRESS
        this.showGameOverlay()
      })

      this.sessionState.addListener(socketMessages.SESSION_ENDED, () => {
        this.status = OverlayStatus.FINISHED
        this.hideGameOverlay()
      })
    }

    if (currentStatus === SessionStatus.ERROR || currentStatus === SessionStatus.NOT_CONNECTED) {
      this.status = OverlayStatus.NOT_CONNECTED
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
        <mmp-typography variant="h2">Obtendo dados da sessão...</mmp-typography>
      `
    }

    return html`
      <div class="body-content">
        ${this.players.length === 1 ? html`
          <mmp-typography variant="h2">Aguardando mais jogadores...</mmp-typography>
        ` : this.isHost ? html`
          <mmp-typography variant="h2">Inicie quando estiver pronto</mmp-typography>
        ` : html`
          <mmp-typography variant="h2">Aguardando início da sessão...</mmp-typography>
        `}

        <div class="info">
          <mmp-typography variant="body1">${this.players.length} conectado${this.players.length !== 1 ? 's' : ''}.</mmp-typography>
        </div>

        <div class="actions">
          <button @click=${() => this.sessionState.leaveSession()}>Sair da sessão</button>

          ${this.isHost ? html`
            <button ?disabled=${this.players.length < 2} @click=${this.startSession}>Iniciar sessão</button>
          ` : ''}
        </div>
      </div>
    `
  }

  private startSession() {
    this.sessionState.sendMessage({
      type: socketMessages.START_SESSION,
      payload: null
    })
  }

  finishedTemplate() {
    return html`
      <div class="body-content">
        <mmp-typography variant="h2">Fim de jogo!</mmp-typography>

        <div class="info">
          <mmp-typography variant="body1">${this.players.length} conectado${this.players.length !== 1 ? 's' : ''}.</mmp-typography>
        </div>

        <div class="actions">
          <button @click=${() => this.sessionState.leaveSession()}>Sair da sessão</button>
        </div>
      </div>
    `
  }

  render() {
    if (this.status === OverlayStatus.NOT_CONNECTED || this.status === OverlayStatus.IN_PROGRESS) {
      return html``
    }

    return html`
      <div class="background">
        <div class="content">
          <div class="header">
            <mmp-typography variant="h3">SESSÃO ${this.sessionState.code}</mmp-typography>
          </div>

          <div class="body">
            ${this.status === OverlayStatus.NOT_STARTED ? this.notStartedTemplate() : ''}
            ${this.status === OverlayStatus.FINISHED ? this.finishedTemplate() : ''}
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

    .body-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .info {
      margin: 2rem 0;
    }

    button {
      border: 0;
      padding: 0.5rem 1rem;
      font-family: var(--mmp-font-primary, sans-serif);
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .actions button {
      background-color: white;
      color: var(--mmp-color-primary);
    }

    .actions button + button {
      background-color: var(--mmp-color-primary);
      color: white;
    }
  `
}