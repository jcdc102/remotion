// Subtítulos de 3 a 7 palabras por línea, con resaltado palabra por palabra.
// Zona: entre el 50% y el 60% de la altura (nunca en el 15% superior ni el 25% inferior).
import { useCurrentFrame, useVideoConfig, spring } from "remotion";
import { piezas, type Linea } from "./datos";
import { FUENTE, Palabra } from "./Texto";

const lineas: Linea[] = piezas.flatMap((p) => p.lineas);

export const Subtitulos: React.FC<{ hasta: number }> = ({ hasta }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t >= hasta) return null;
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
        left: 70,
        right: 70,
        top: 950,
        height: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: FUENTE,
        fontSize: 80,
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
            grosor={13}
          />
        ))}
      </div>
    </div>
  );
};
