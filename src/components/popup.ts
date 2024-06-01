import { html, css, LitElement, PropertyValues } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('mmp-popup')
export class Popup extends LitElement {
  @state() count = 0

  private link = 'https://github.com/guocaoyi/create-chrome-ext'

  constructor() {
    super()
    chrome.storage.sync.get(['count'], (result) => {
      this.count = result.count || 0
    })
  }

  minus = () => this.count > 0 && this.count--

  add = () => (this.count += 1)

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has('count')) {
      chrome.storage.sync.set({ count: changedProperties.get('count') })
      chrome.runtime.sendMessage({ type: 'COUNT', count: this.count })
    }
  }

  render() {
    return html`
      <main>
        <button>Create room</button>

        <input type="text" placeholder="Room code">
        <button>Join room</button>
      </main>
    `
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

    h3 {
      color: #324fff;
      text-transform: uppercase;
      font-size: 1.5rem;
      font-weight: 200;
      line-height: 1.2rem;
      margin: 2rem auto;
    }

    .calc {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 2rem;
    }

    .calc button {
      font-size: 1rem;
      padding: 0.5rem 1rem;
      border: 1px solid #324fff;
      border-radius: 0.25rem;
      background-color: transparent;
      color: #324fff;
      cursor: pointer;
      outline: none;

      width: 3rem;
      margin: 0 a;
    }

    .calc label {
      font-size: 1.5rem;
      margin: 0 1rem;
    }

    a {
      font-size: 0.5rem;
      margin: 0.5rem;
      color: #cccccc;
      text-decoration: none;
    }
  `
}

export default Popup