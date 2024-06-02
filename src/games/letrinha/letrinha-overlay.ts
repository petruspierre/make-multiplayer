import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement('mmp-letrinha-overlay')
export class LetrinhaOverlay extends LitElement {
  connectedCallback(): void {
    super.connectedCallback();
  }

  render() {
    return html`
      <div class="container">
        <div class="content">
          <div>
            <span>Multiplayer:</span>
            <span>Enabled</span>
          </div>
          <p>0 players connected</p>
          <p>Attempts remaining: 7</p>
        </div>
      </div>
    `
  }

  static styles = css`
    .container {
      position: sticky;
      bottom: 8px;
      left: 8px;
      width: 100px;
      z-index: 100;
      color: white;
    }

    .content {
      display: flex;
      flex-direction: column;
      background: rgba(255,255,255,0.2);
      border-radius: 16px;
      padding: 6px;
    }

    p {
      margin: 0;
    }
  `
}