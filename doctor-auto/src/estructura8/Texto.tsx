// Texto grueso blanco con borde negro; las palabras de "resaltar" van en
// amarillo y más grandes. Los emojis se dibujan sin borde.
import { esResaltada } from "./datos";

export const FUENTE = "Lilita One";
const esEmoji = (s: string) => /\p{Extended_Pictographic}/u.test(s);

export const estiloBorde = (grosor: number): React.CSSProperties => ({
  WebkitTextStroke: `${grosor}px #000`,
  paintOrder: "stroke fill",
});

export const Palabra: React.FC<{
  texto: string;
  resaltada: boolean;
  activa: boolean;
  dicha: boolean;
  color: string;
  colorResaltado: string;
  grosor: number;
}> = ({ texto, resaltada, activa, dicha, color, colorResaltado, grosor }) => (
  <span
    style={{
      display: "inline-block",
      margin: "0 0.2em",
      color: resaltada ? colorResaltado : color,
      fontSize: resaltada ? "1.22em" : "1em",
      transform: `scale(${activa ? 1.12 : 1}) translateY(${activa ? -4 : 0}px)`,
      opacity: dicha ? 1 : 0.6,
      ...(esEmoji(texto) ? {} : estiloBorde(grosor)),
      textShadow: activa ? `0 0 24px ${colorResaltado}` : "0 6px 0 rgba(0,0,0,0.55)",
    }}
  >
    {texto}
  </span>
);

export const TextoPantalla: React.FC<{
  texto: string;
  resaltar: string[];
  color: string;
  colorResaltado: string;
  tamano: number;
}> = ({ texto, resaltar, color, colorResaltado, tamano }) => (
  <div style={{ fontFamily: FUENTE, fontSize: tamano, lineHeight: 1.12, textAlign: "center" }}>
    {texto.split(/\s+/).map((w, i) => (
      <Palabra key={i} texto={w} resaltada={esResaltada(w, resaltar)} activa={false} dicha color={color} colorResaltado={colorResaltado} grosor={tamano * 0.16} />
    ))}
  </div>
);
