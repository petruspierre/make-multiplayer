import Options from "@/components/options";
import Popup from "@/components/popup";
import { Sidepanel } from "@/components/side-panel";
import { LetrinhaOverlay } from "@/games/letrinha/letrinha-overlay";

declare global {
  interface HTMLElementTagNameMap {
    'mmp-letrinha-overlay': LetrinhaOverlay;
    'mmp-side-panel': Sidepanel;
    'mmp-popup': Popup;
    'mmp-options': Options;
  }
}