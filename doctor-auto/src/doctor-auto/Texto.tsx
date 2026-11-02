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
const Capsula: React.FC<{ texto: string; golpe: number; dibujo: number; union?: Union }> = ({ texto, golpe, dibujo, union = "sola" }) => (
  <span
    style={{
      position: "relative",
      display: "inline-block",
      fontFamily: ANTON,
      fontWeight: 400,
      color: "#fff",
      padding: `0.02em ${union === "sola" || union === "fin" ? "0.32em" : "0.14em"} 0.06em ${union === "sola" || union === "inicio" ? "0.32em" : "0.14em"}`,
      margin: `0 ${union === "sola" || union === "fin" ? "0.12em" : "0"} 0 ${union === "sola" || union === "inicio" ? "0.12em" : "0"}`,
      lineHeight: 1.15,
      letterSpacing: "0.01em",
      transform: `scale(${golpe})`,
    }}
  >
    {/* Fondo rojo que se dibuja de izquierda a derecha (dibujo: 0 → 1 en 6 fotogramas). */}
    <span
      style={{
        position: "absolute",
        inset: 0,
        background: DEGRADADO,
        borderRadius: RADIO[union],
        boxShadow: "0 6px 0 rgba(0,0,0,0.45)",
        clipPath: `inset(0 ${(1 - dibujo) * 100}% 0 0 round 999px)`,
      }}
    />
    <span style={{ position: "relative" }}>{texto}</span>
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
  // Resorte corto (pack de movimiento): damping 12, stiffness 200.
  const entrada = spring({ frame: local, fps, config: { damping: 12, stiffness: 200 } });
  // Golpe de zoom de la palabra resaltada: 1 → 1.15 → 1.
  const golpe = resaltada ? 1 + 0.15 * Math.sin(Math.min(1, Math.max(0, local / 8)) * Math.PI) : 1;
  const dibujo = Math.min(1, Math.max(0, local / 6));
  const visible = local >= 0;
  return (
    <span
      style={{
        display: "inline-block",
        opacity: visible ? Math.min(1, entrada * 1.4) : 0,
        transform: `translateY(${(1 - entrada) * 20}px) scale(${0.8 + 0.2 * entrada})`,
        margin: resaltada ? 0 : "0 0.14em",
      }}
    >
      {resaltada ? <Capsula texto={texto} golpe={golpe} dibujo={dibujo} union={union} /> : <span style={esEmoji(texto) ? {} : borde(grosor)}>{texto}</span>}
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

// Título en Anton (blanco con borde negro): las letras entran una por una con
// 2 fotogramas de retraso y un leve temblor al caer. Las palabras de "resaltar" van en cápsula.
export const TituloDA: React.FC<{ texto: string; resaltar: string[]; tamano: number; golpe: number }> = ({
  texto,
  resaltar,
  tamano,
  golpe,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let indice = 0;
  const letra = (ch: string) => {
    const k = indice++;
    const local = frame - k * 2;
    const caida = spring({ frame: local, fps, config: { damping: 12, stiffness: 200 } });
    const temblor = local > 4 && local < 12 ? Math.sin(local * 2.4) * 2.5 * (1 - (local - 4) / 8) : 0;
    return (
      <span
        key={k}
        style={{
          display: "inline-block",
          opacity: local < 0 ? 0 : Math.min(1, caida * 1.5),
          transform: `translateY(${(1 - caida) * -40}px) rotate(${temblor}deg)`,
        }}
      >
        {ch}
      </span>
    );
  };
  return (
    <div style={{ fontFamily: ANTON, fontSize: tamano, lineHeight: 1.12, textAlign: "center", color: "#fff", textTransform: "uppercase" }}>
      {texto.split(/\s+/).map((w, i) => {
        const letras = [...w].map(letra);
        return esResaltada(w, resaltar) ? (
          <Capsula key={i} texto={w} golpe={golpe} dibujo={1} />
        ) : (
          <span key={i} style={{ display: "inline-block", margin: "0 0.12em", ...(esEmoji(w) ? {} : borde(tamano * 0.1)) }}>
            {letras}
          </span>
        );
      })}
    </div>
  );
};
