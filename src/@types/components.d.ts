import Options from "@/components/options";
import { Overlay } from "@/components/overlay";
import Popup from "@/components/popup";
import { Sidepanel } from "@/components/side-panel";

declare global {
  interface HTMLElementTagNameMap {
    'mmp-overlay': Overlay;
    'mmp-side-panel': Sidepanel;
    'mmp-popup': Popup;
    'mmp-options': Options;
  }
}