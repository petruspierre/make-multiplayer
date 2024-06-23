import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('mmp-options')
export class Options extends LitElement {
  @state()
  countSync = 0

  render() {
    return html`
      <main>
        <h3>Configurações</h3>
        <a href="https://github.com/petruspierre/make-multiplayer" target="_blank"> Código fonte </a>
      </main>
    `
  }

  static styles = css`
    body {
      min-width: 20rem;
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

    a {
      font-size: 0.5rem;
      margin: 0.5rem;
      color: #cccccc;
      text-decoration: none;
    }
  `
}

export default Options
