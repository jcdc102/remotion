// Subtítulos de 3 a 7 palabras por línea, con resaltado palabra por palabra.
// La posición la decide cada tema (siempre entre el 30% y el 60% de la altura).
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import type { Linea } from "./datos";
import { FUENTE, Palabra } from "./Texto";

export const Subtitulos: React.FC<{
  lineas: Linea[];
  desde: number;
  hasta: number;
  colorResaltado: string;
  arriba: number;
  alto: number;
  tamano: number;
  izquierda: number;
  derecha: number;
}> = ({ lineas, desde, hasta, colorResaltado, arriba, alto, tamano, izquierda, derecha }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < desde || t >= hasta) return null;
  const i = lineas.findIndex(
    (l, k) => t >= l.inicio && t < Math.min(lineas[k + 1]?.inicio ?? Infinity, l.fin + 0.9),
  );
  if (i < 0) return null;
  const linea = lineas[i];
  const entrada = spring({ frame: frame - Math.round(linea.inicio * fps), fps, config: { damping: 14 }, durationInFrames: 8 });
  return (
    <div
      style={{
        position: "absolute",
        left: izquierda,
        right: derecha,
        top: arriba,
        height: alto,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: FUENTE,
        fontSize: tamano,
        lineHeight: 1.1,
        transform: `scale(${0.85 + 0.15 * entrada})`,
      }}
    >
      <div>
        {linea.palabras.map((w, k) => (
          <Palabra
            key={k}
            texto={w.texto}
            resaltada={w.resaltada}
            activa={t >= w.inicio && t < w.fin}
            dicha={t >= w.inicio}
            color="#ffffff"
            colorResaltado={colorResaltado}
            grosor={13}
          />
        ))}
      </div>
    </div>
  );
};
