import { getSocketForSession } from '@/socket/client'
import { html, css, LitElement, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import PartySocket from 'partysocket'

export enum OverlayStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}

@customElement('mmp-popup')
export class Popup extends LitElement {
  @property()
  status: OverlayStatus = OverlayStatus.CONNECTING

  @state()
  private session: string = ''

  @state()
  private socket: PartySocket | null = null
  // protected updated(changedProperties: PropertyValues) {
  //   if (changedProperties.has('count')) {
  //     chrome.storage.sync.set({ count: changedProperties.get('count') })
  //     chrome.runtime.sendMessage({ type: 'COUNT', count: this.count })
  //   }
  // }

  @state()
  private counter: number = 0

  render() {
    return html`
      <main>
        Make Multiplayer

        <div>
          <button @click=${this.joinSession}>JOIN</button>
          <button @click=${this.createNewSession}>CREATE</button>
        </div>

        <div>
          <span>Session: ${this.session}</span>
          <span>Status: ${this.status}</span>
        </div>

        <div>
          <span>Counter: ${this.counter}</span>
          <button @click=${() => this.counter++}>Increment</button>
        </div>
      </main>
    `
  }

  private createNewSession = async () => {
    try {
      const response = await fetch(`http://localhost:1999/party/make-multiplayer-party`, {
        method: "POST",
      });

      if (response.ok) {
        const { code } = await response.json();
        this.session = code

        this.socket = getSocketForSession(code)

        this.socket.onmessage = (message) => {
          console.log('Message received:', message)
        }

        chrome.runtime.sendMessage({ type: 'SESSION', session: code })
      }
    } catch {
      this.status = OverlayStatus.ERROR
    }
  }

  private joinSession = async () => {
    try {
      this.socket = getSocketForSession('ABC123')

      this.session = 'ABC123'

      this.socket.onmessage = (message) => {
        console.log('Message received:', message)
      }
    } catch {
      this.status = OverlayStatus.ERROR
    }
  }

  // private openOptions = () => {
  //   chrome.runtime.openOptionsPage();
  // }


  static styles = css`
    @media (prefers-color-scheme: light) {
      a:hover {
        color: #324fff;
      }
    }

    main {
      text-align: center;
      padding: 1em;
      margin: 0 auto;
    }
  `
}

export default Popup