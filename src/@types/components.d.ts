import Options from "@/components/options";
import { Overlay } from "@/components/overlay";
import Popup from "@/components/popup";
import { Typography } from "@/components/ui/typography";
import { LetrinhaOverlay } from "@/games/letrinha/letrinha-overlay";
import { SessionProvider } from "@/socket/session-context";

declare global {
  interface HTMLElementTagNameMap {
    'mmp-overlay': Overlay;
    'mmp-letrinha-overlay': LetrinhaOverlay;
    'mmp-popup': Popup;
    'mmp-options': Options;
    'mmp-session-provider': SessionProvider;
    'mmp-draggable-box': DraggableBox;
    'mmp-typography': Typography;
  }
}