import { chromeMessages } from '@/core/chromeMessages'
import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import './ui/typography';

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
        <div class="header">
          <mmp-typography variant="body1">
            Make Multiplayer
          </mmp-typography>
        </div>

        ${this.loading ? html`<p>Carregando...</p>` : ''}

        ${this.sessionCode ? html`
          <div>
            <span>Sessão: ${this.sessionCode}</span>
          </div>
        ` : html`
          <div>
            <div class="join">
              <input
                type="text"
                placeholder="Código"
                required
                @input=${(e: InputEvent) => this.sessionInput = (e.target as HTMLInputElement).value} 
              />
              <button @click=${this.joinSession} ?disabled=${this.loading || this.sessionInput.length < 6}>ENTRAR</button>
            </div>

            <div class="create">
              <mmp-typography variant="caption">ou</mmp-typography>
              <button @click=${this.createNewSession} ?disabled=${this.loading}>CRIAR SESSÃO</button>
            </div>
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
    main {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem;
      margin: 0 auto;
      width: 300px;
    }

    button {
      background-color: #3a6ea5;
      border: none;
      padding: 0.5rem 1rem;
      margin-left: 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
      font-family: var(--mmp-font-primary, sans-serif);
      color: white;
      font-weight: 600;
      border-radius: 4px;
    }

    button:hover {
      background-color: #004e98;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    input {
      padding: 0.5rem;
      border: 1px solid #3a6ea5;
      border-radius: 4px;
      font-family: var(--mmp-font-primary, sans-serif);
    }

    .header {
      margin-bottom: 1rem;
    }

    .join {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }

    .create {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `
}

export default Popup