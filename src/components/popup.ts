import { chromeMessages } from '@/core/chromeMessages'
import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

import '../index.css';
import './ui/typography';
import { supportedGames } from '@/games';
import { SessionStatus } from '@/socket/session-context';

type PopupStatus = 'error' | 'loaded' | 'connected' | 'loading' | 'menu'

@customElement('mmp-popup')
export class Popup extends LitElement {
  @state()
  private sessionCode: string = ''

  @state()
  private sessionInput: string = ''

  @state()
  private status: PopupStatus = 'loading'

  private pingInterval: NodeJS.Timeout | null = null

  connectedCallback() {
    super.connectedCallback();

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      const url = tab.url || ''

      if (!supportedGames.map(game => game.url).includes(url)) {
        console.log('Tab not supported')
        this.status = 'menu'
        return
      }

      this.pingSessionState(tab.id!)

      if (this.status === 'loading') {
        this.status = 'loaded'
      }

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
      console.log(data)
      if(!data) return

      const parsedData = JSON.parse(data) as {
        code: string | null;
        sessionStatus: SessionStatus | null
      }
      const { code, sessionStatus } = parsedData

      if (sessionStatus === SessionStatus.ERROR) {
        this.status = 'error'
        return
      }

      if (code) {
        this.sessionCode = code
        this.status = 'connected'
        clearInterval(this.pingInterval!)
      }
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

        ${this.status === 'loading' ? html`<p>Carregando...</p>` : ''}

        ${this.status === 'connected' ? html`
          <div>
            <span>Sessão: ${this.sessionCode}</span>
          </div>
        ` : ''}

        ${this.status === 'loaded' ? html`
          <div>
            <div class="join">
              <input
                type="text"
                placeholder="Código"
                required
                @input=${(e: InputEvent) => this.sessionInput = (e.target as HTMLInputElement).value} 
              />
              <button @click=${this.joinSession} ?disabled=${this.sessionInput.length < 6}>ENTRAR</button>
            </div>

            <div class="create">
              <mmp-typography variant="caption">ou</mmp-typography>
              <button @click=${this.createNewSession}>CRIAR SESSÃO</button>
            </div>
          </div>
        ` : ''}

        ${this.status === 'menu' ? html`
          <div class="menu">
            <mmp-typography variant="body1">Inicie um jogo suportado para começar!</mmp-typography>
          </div>
        ` : ''}
      </main>
    `
  }

  private createNewSession = async () => {
    this.status = 'loading'

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        this.status = 'error'
        return
      }

      chrome.tabs.sendMessage(tab.id!, {
        type: chromeMessages.CREATE_SESSION,
      })
    } catch(err) {
      this.status = 'error'
    }
  }

  private joinSession = async () => {
    this.status = 'loading'

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        this.status = 'error'
        return
      }

      chrome.tabs.sendMessage(tab.id!, {
        type: chromeMessages.JOIN_SESSION,
        payload: {
          code: this.sessionInput
        }
      })
    } catch(err) {
      this.status = 'error'
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

    .menu {
      display: flex;
      text-align: center;
      justify-content: center;
    }
  `
}

export default Popup