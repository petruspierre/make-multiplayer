import { css, html, LitElement } from "lit";
import { customElement, query, state } from "lit/decorators.js";

@customElement('mmp-draggable-box')
export class DraggableBox extends LitElement {
  @query('.box-header')
  header!: HTMLElement;

  @query('.box')
  box!: HTMLElement;

  @state()
  lastX = 0;

  @state()
  lastY = 0;

  async connectedCallback() {
    super.connectedCallback();

    await this.updateComplete;

    const boxRect = this.box.getBoundingClientRect();
    this.lastX = boxRect.left;
    this.lastY = boxRect.top;

    this.header.addEventListener('mousedown', this.dragStart.bind(this));
    this.header.addEventListener('mouseup', this.dragEnd.bind(this));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.header.removeEventListener('mousedown', this.dragStart.bind(this));
    this.header.removeEventListener('mouseup', this.dragEnd.bind(this));
  }

  dragStart(event: MouseEvent) {
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    this.header.classList.add('dragging');
    this.box.classList.add('dragging');
    this.header.addEventListener('mousemove', this.dragMove.bind(this));
  }
  
  dragEnd() {
    this.header.classList.remove('dragging');
    this.box.classList.remove('dragging');
    this.header.removeEventListener('mousemove', this.dragMove.bind(this));
  }
  
  dragMove(event: MouseEvent) {
    if (!this.header.classList.contains('dragging')) return;

    const elRect = this.box.getBoundingClientRect();
    const newLeft = elRect.left + event.clientX - this.lastX;
    const newTop = elRect.top + event.clientY - this.lastY;

    this.lastX = event.clientX;
    this.lastY = event.clientY;

    this.box.style.setProperty('left', `${newLeft}px`);
    this.box.style.setProperty('top', `${newTop}px`);
    window.getSelection()!.removeAllRanges();
  }

  render() {
    return html`
      <div class="box">
        <div class="box-header">
          <slot name="header">Drag</slot>
        </div>
        <div class="box-body">
          <slot name="body">Draggable box</slot>
        </div>
      </div>
    `
  }

  static styles = css`
    .box {
      position: absolute;
      top: 8px;
      left: 8px;
      background-color: #fff;
      border: 1px solid var(--mmp-color-primary, dodgerblue);
      border-radius: 16px;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .box-header {
      color: var(--mmp-color-primary, dodgerblue);
      border-bottom: 1px solid var(--mmp-color-primary, dodgerblue);
      padding: 10px 15px;

      display: flex;
      justify-content: center;
    }

    .box-body {
      padding: 15px;
    }

    .dragging {
      cursor: move !important;
    }

    .box.dragging {
      opacity: 0.8;
    }
  `
}