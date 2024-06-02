import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {classMap} from 'lit/directives/class-map.js';
import PartySocket from "partysocket";

export enum OverlayStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

@customElement('mmp-overlay')
export class Overlay extends LitElement {
  @property()
  status: OverlayStatus = OverlayStatus.CONNECTING

  @state()
  private room: string = ''

  @state()
  private socket: PartySocket | null = null

  connectedCallback(): void {
    super.connectedCallback();
  }

  private createNewRoom = async () => {
    try {
      const response = await fetch(`http://localhost:1999/party/make-multiplayer-party`, {
        method: "POST",
      });

      if (response.ok) {
        const { id } = await response.json();
        this.room = id

        this.socket = new PartySocket({
          host: 'localhost:1999',
          room: id,
        })

        this.socket.onmessage = (message) => {
          console.log('Message received:', message)
        }
      }
    } catch {
      this.status = OverlayStatus.ERROR
    }
  }

  private joinRoom = async () => {
    try {
      this.socket = new PartySocket({
        host: 'localhost:1999',
        room: 'ABC123',
      })
    } catch {
      this.status = OverlayStatus.ERROR
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="content">
          <div class=${classMap({
            'status-indicator': true,
            'connected': this.status === 'connected',
            'connecting': this.status === 'connecting',
            'error': this.status === 'error'
          })}></div>

          ${this.room
            ? html`
              <p>
                Room: ${this.room}
              </p>
          ` :
            this.status === OverlayStatus.CONNECTED
            ? html`
              <div class="connected-container">
                <button @click=${this.joinRoom}>JOIN</button>
                <button @click=${this.createNewRoom}>CREATE</button>
              </div>
            `: html`
              <p>
                ${this.status}
              </p>
            `}
        </div>
      </div>
    `
  }

  static styles = css`
    .container {
      position: sticky;
      bottom: 8px;
      left: 8px;
      width: 15rem;
      height: 5rem;
      z-index: 100;
      background: #F1F1F1;
      border-radius: 120px;
    }

    .content {
      color: #222222;
      display: flex;
      position: relative;
      align-items: center;
      justify-content: center;

      padding: 6px;
      flex: 1;
    }

    .status-indicator {
      width: 1.5rem;
      height: 1.5rem;
      border-radius: 50%;
      background: white;
      position: absolute;
      top: 1.75rem;
      left: 1.5rem;
    }

    .connected {
      background: green;
    }

    .connecting {
      background: yellow;
    }

    .error {
      background: red;
    }

    .connected-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1;
    }

    p {
      text-transform: uppercase;
      margin: 0;
    }
  `
}