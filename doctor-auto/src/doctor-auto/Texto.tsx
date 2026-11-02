// Texto con el estilo Doctor Auto: subtítulos cinéticos en Poppins SemiBold,
// títulos en Anton, y palabras clave sobre una cápsula roja con texto blanco.
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { esResaltada, type Linea } from "../estructura8/datos";
import { ANTON, DEGRADADO, POPPINS, PESO_POPPINS } from "./constantes";

const esEmoji = (s: string) => /\p{Extended_Pictographic}/u.test(s);
const borde = (grosor: number): React.CSSProperties => ({
  WebkitTextStroke: `${grosor}px #000`,
  paintOrder: "stroke fill",
});

// Cápsula roja para una palabra clave (Anton, blanco, sin borde).
type Union = "sola" | "inicio" | "medio" | "fin";
const RADIO: Record<Union, string> = { sola: "999px", inicio: "999px 0 0 999px", medio: "0", fin: "0 999px 999px 0" };
const Capsula: React.FC<{ texto: string; golpe: number; union?: Union }> = ({ texto, golpe, union = "sola" }) => (
  <span
    style={{
      display: "inline-block",
      fontFamily: ANTON,
      fontWeight: 400,
      color: "#fff",
      background: DEGRADADO,
      borderRadius: RADIO[union],
      padding: `0.02em ${union === "sola" || union === "fin" ? "0.32em" : "0.14em"} 0.06em ${union === "sola" || union === "inicio" ? "0.32em" : "0.14em"}`,
      margin: `0 ${union === "sola" || union === "fin" ? "0.12em" : "0"} 0 ${union === "sola" || union === "inicio" ? "0.12em" : "0"}`,
      lineHeight: 1.15,
      letterSpacing: "0.01em",
      transform: `scale(${golpe})`,
      boxShadow: "0 6px 0 rgba(0,0,0,0.45)",
    }}
  >
    {texto}
  </span>
);

// Una palabra que entra con un resorte corto al momento de decirse.
const PalabraCinetica: React.FC<{
  texto: string;
  resaltada: boolean;
  inicioFrame: number;
  grosor: number;
  union: Union;
}> = ({ texto, resaltada, inicioFrame, grosor, union }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - inicioFrame;
  const entrada = spring({ frame: local, fps, config: { damping: 14, stiffness: 260 }, durationInFrames: 7 });
  // Golpe de zoom: arranca un poco más grande y regresa a su tamaño.
  const golpe = resaltada ? 1 + 0.22 * (1 - spring({ frame: local, fps, config: { damping: 9, stiffness: 220 }, durationInFrames: 10 })) : 1;
  const visible = local >= 0;
  return (
    <span
      style={{
        display: "inline-block",
        opacity: visible ? entrada : 0,
        transform: `translateY(${(1 - entrada) * 26}px) scale(${0.7 + 0.3 * entrada})`,
        margin: resaltada ? 0 : "0 0.14em",
      }}
    >
      {resaltada ? <Capsula texto={texto} golpe={golpe} union={union} /> : <span style={esEmoji(texto) ? {} : borde(grosor)}>{texto}</span>}
    </span>
  );
};

export const SubtitulosDA: React.FC<{
  lineas: Linea[];
  desde: number;
  hasta: number;
  arriba: number;
  alto: number;
  tamano: number;
  izquierda: number;
  derecha: number;
  sostenerFinal: boolean;
}> = ({ lineas, desde, hasta, arriba, alto, tamano, izquierda, derecha, sostenerFinal }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t < desde || t >= hasta) return null;
  const i = lineas.findIndex(
    (l, k) =>
      t >= l.inicio &&
      t < Math.min(lineas[k + 1]?.inicio ?? Infinity, sostenerFinal && k === lineas.length - 1 ? Infinity : l.fin + 0.9),
  );
  if (i < 0) return null;
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
        fontFamily: POPPINS,
        fontWeight: PESO_POPPINS,
        fontSize: tamano,
        lineHeight: 1.22,
        color: "#fff",
      }}
    >
      <div>
        {lineas[i].palabras.map((w, k, ws) => {
          const antes = k > 0 && ws[k - 1].resaltada;
          const despues = k < ws.length - 1 && ws[k + 1].resaltada;
          const union: Union = !w.resaltada ? "sola" : antes && despues ? "medio" : antes ? "fin" : despues ? "inicio" : "sola";
          return (
            <PalabraCinetica key={k} texto={w.texto} resaltada={w.resaltada} inicioFrame={Math.round(w.inicio * fps)} grosor={tamano * 0.16} union={union} />
          );
        })}
      </div>
    </div>
  );
};

// Título en Anton (blanco con borde negro); las palabras de "resaltar" van en cápsula.
export const TituloDA: React.FC<{ texto: string; resaltar: string[]; tamano: number; golpe: number }> = ({
  texto,
  resaltar,
  tamano,
  golpe,
}) => (
  <div style={{ fontFamily: ANTON, fontSize: tamano, lineHeight: 1.12, textAlign: "center", color: "#fff", textTransform: "uppercase" }}>
    {texto.split(/\s+/).map((w, i) =>
      esResaltada(w, resaltar) ? (
        <Capsula key={i} texto={w} golpe={golpe} />
      ) : (
        <span key={i} style={{ display: "inline-block", margin: "0 0.12em", ...(esEmoji(w) ? {} : borde(tamano * 0.1)) }}>
          {w}
        </span>
      ),
    )}
  </div>
);
