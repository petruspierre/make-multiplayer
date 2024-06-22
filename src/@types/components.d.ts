import Options from "@/components/options";
import { Overlay } from "@/components/overlay";
import Popup from "@/components/popup";
import { Sidepanel } from "@/components/side-panel";
import { LetrinhaOverlay } from "@/games/letrinha/letrinha-overlay";
import { SessionProvider } from "@/socket/session-context";

declare global {
  interface HTMLElementTagNameMap {
    'mmp-overlay': Overlay;
    'mmp-letrinha-overlay': LetrinhaOverlay;
    'mmp-side-panel': Sidepanel;
    'mmp-popup': Popup;
    'mmp-options': Options;
    'mmp-session-provider': SessionProvider;
    'mmp-draggable-box': DraggableBox;
  }
}