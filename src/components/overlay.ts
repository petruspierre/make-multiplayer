import { getSocketForSession } from "@/socket/client";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {classMap} from 'lit/directives/class-map.js';

export enum OverlayStatus {
  NOT_CONNECTED = 'not_connected',
  CONNECTED = 'connected',
  IN_PROGRESS = 'in_progress',
  FINISHED = 'finished'
}

@customElement('mmp-overlay')
export class Overlay extends LitElement {
  @property()
  status: OverlayStatus = OverlayStatus.NOT_CONNECTED;

  connectedCallback(): void {
    super.connectedCallback();
  }

  render() {
    if (this.status === OverlayStatus.NOT_CONNECTED) {
      return html`
        <div></div>
      `
    }

    return html`
      <div class="background">
        <div class="content"></div>
      </div>
    `
  }

  static styles = css`
    .background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1000;
    }
  `
}