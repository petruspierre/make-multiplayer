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

    console.log('Overlay updated', _changedProperties)

    if (_changedProperties.has('sessionState')) {
      if (this.sessionState.status === SessionStatus.CONNECTED) {
        this.status = OverlayStatus.NOT_STARTED
      }
    }
  }

  render() {
    return html`
      <div class="background">
        <div class="content">
          <div>${this.sessionState.status}</div>
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
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }
  `
}