import { generateShortId } from '@/utils/generate-short-id'
import { html, css, LitElement, PropertyValues } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('mmp-popup')
export class Popup extends LitElement {
  constructor() {
    super()
  }

  // protected updated(changedProperties: PropertyValues) {
  //   if (changedProperties.has('count')) {
  //     chrome.storage.sync.set({ count: changedProperties.get('count') })
  //     chrome.runtime.sendMessage({ type: 'COUNT', count: this.count })
  //   }
  // }

  private createNewRoom = async () => {
    const id = generateShortId()
    console.log(`Creating new room ${id}`)
    await fetch(`http://localhost:1999/party/make-multiplayer-party`, {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  private joinRoom = () => {
    console.log('Joining room')
  }

  render() {
    return html`
      <main>
        <button 
          @click=${this.createNewRoom}
        >Create room</button>

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