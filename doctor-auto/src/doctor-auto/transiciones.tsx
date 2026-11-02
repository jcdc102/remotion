// Transiciones entre bloques (pack de movimiento): rotan slide, wipe, flip y
// zoom-through, nunca la misma dos veces seguidas. Cada una lleva su whoosh.
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";
import { AbsoluteFill, interpolate } from "remotion";

type SinProps = Record<string, unknown>;

// Zoom-through: la escena que sale se acerca y se desvanece; la que entra
// llega desde atrás. Sin destellos blancos.
const ZoomThrough: React.FC<TransitionPresentationComponentProps<SinProps>> = ({
  children,
  presentationDirection,
  presentationProgress,
}) => {
  const p = presentationProgress;
  const estilo: React.CSSProperties =
    presentationDirection === "exiting"
      ? { transform: `scale(${interpolate(p, [0, 1], [1, 1.6])})`, opacity: 1 - p }
      : { transform: `scale(${interpolate(p, [0, 1], [0.55, 1])})`, opacity: p };
  return <AbsoluteFill style={estilo}>{children}</AbsoluteFill>;
};
const zoomThrough = (): TransitionPresentation<SinProps> => ({ component: ZoomThrough, props: {} });

export type TipoTransicion = "slide" | "wipe" | "flip" | "zoom";
export const ROTACION: TipoTransicion[] = ["slide", "wipe", "flip", "zoom"];
export const SONIDO_TRANSICION: Record<TipoTransicion, string> = {
  slide: "mk-whoosh-slide",
  wipe: "mk-swipe",
  flip: "whoosh-b",
  zoom: "mk-whoosh-zoom",
};

type Presentacion = TransitionPresentation<Record<string, unknown>>;
export const presentacion = (tipo: TipoTransicion, k: number): Presentacion => {
  if (tipo === "slide") return slide({ direction: k % 2 === 0 ? "from-right" : "from-left" }) as Presentacion;
  if (tipo === "wipe") return wipe({ direction: k % 2 === 0 ? "from-left" : "from-top-left" }) as Presentacion;
  if (tipo === "flip") return flip({ direction: "from-right", perspective: 1400 }) as Presentacion;
  return zoomThrough();
};
