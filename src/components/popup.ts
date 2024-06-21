import { chromeMessages } from '@/core/chromeMessages'
import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('mmp-popup')
export class Popup extends LitElement {
  @state()
  private sessionCode: string = ''

  @state()
  private sessionInput: string = ''

  @state()
  private loading: boolean = false

  private pingInterval: NodeJS.Timeout | null = null

  connectedCallback() {
    super.connectedCallback();

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      this.pingSessionState(tab.id!)

      this.pingInterval = setInterval(this.pingSessionState.bind(this), 1000, tab.id!)
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.pingInterval) {
      clearInterval(this.pingInterval)
    }
  }

  pingSessionState = (tabId: number) => {
    chrome.tabs.sendMessage(tabId, {
      type: chromeMessages.FETCH_SESSION,
    }, (data: string) => {
      this.sessionCode = data
      this.loading = false
    })
  }

  render() {
    return html`
      <main>
        Make Multiplayer

        ${this.loading ? html`<p>Loading...</p>` : ''}

        ${this.sessionCode ? html`
          <div>
            <span>Session: ${this.sessionCode}</span>
          </div>
        ` : html`
          <div>
            <div>
              <input
                type="text"
                placeholder="Session Code"
                required
                @input=${(e: InputEvent) => this.sessionInput = (e.target as HTMLInputElement).value} 
              />
              <button @click=${this.joinSession} ?disabled=${this.loading || this.sessionInput.length === 0}>JOIN</button>
            </div>
            <button @click=${this.createNewSession} ?disabled=${this.loading}>CREATE</button>
          </div>
        `}
      </main>
    `
  }

  private createNewSession = async () => {
    this.loading = true

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        this.loading = false
        return
      }

      chrome.tabs.sendMessage(tab.id!, {
        type: chromeMessages.CREATE_SESSION,
      })
    } catch(err) {
      this.loading = false
    }
  }

  private joinSession = async () => {
    this.loading = true

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        this.loading = false
        return
      }

      chrome.tabs.sendMessage(tab.id!, {
        type: chromeMessages.JOIN_SESSION,
        payload: {
          code: this.sessionInput
        }
      })
    } catch(err) {
      this.loading = false
    }
  }

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