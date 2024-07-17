import { css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { html, literal } from "lit/static-html.js";

type Variants = 'h1' | 'h2' | 'h3' | 'body1' | 'body2' | 'caption'

@customElement('mmp-typography')
export class Typography extends LitElement {
  @property({ type: String })
  variant: Variants = 'body1'

  variantToTag = {
    h1: literal`h1`,
    h2: literal`h2`,
    h3: literal`h3`,
    body1: literal`p`,
    body2: literal`p`,
    caption: literal`span`
  }

  @property({ attribute: true, type: Number })
  weight: number | null = null

  getTag() {
    return this.variantToTag[this.variant] || literal`span`
  }

  render() {
    return html`
      <${this.getTag()} class="${this.variant}" style=${this.weight !== null ? `font-weight: ${this.weight}` : ""}>
        <slot></slot>
      </${this.getTag()}>
    `
  }

  static styles = css`
    h1, h2, h3, p {
      margin: 0;
    }
  
    h1, h2, h3 {
      font-family: var(--mmp-font-primary, sans-serif);
    }

    p, span {
      font-family: var(--mmp-font-primary, sans-serif);
    }

    .h1 {
      font-size: 2rem;
      font-weight: 700;
    }

    .h2 {
      font-size: 1.75rem;
      font-weight: 600;
    }

    .h3 {
      font-size: 1.5rem;
      font-weight: 600;
    }

    .body1 {
      font-size: 1rem;
      font-weight: 400;
    }

    .body2 {
      font-size: 0.875rem;
      font-weight: 400;
    }

    .caption {
      font-size: 0.75rem;
      font-weight: 400;
    }
  `
}