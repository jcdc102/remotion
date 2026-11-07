import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { C } from "./comun";

// Técnicas de edición de Julio (ver CLAUDE.md, «Indicaciones de edición»).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.65, 0, 0.35, 1);

// 5. Revela el texto desde una máscara: cada palabra sube desde detrás de una línea invisible.
// 1. Sincroniza: pasa en `tiempos` el fotograma (relativo a la escena) en que la voz dice cada palabra;
//    si es null, las palabras entran escalonadas desde `desde`.
export const TextoMascara: React.FC<{
  texto: string;
  desde: number;
  tiempos: number[] | null;
  tam: number;
  fuente: string;
  peso: number;
  color: string;
  resaltar: string[] | null;
}> = ({ texto, desde, tiempos, tam, fuente, peso, color, resaltar }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `${tam * 0.06}px ${tam * 0.26}px` }}>
      {texto.split(" ").map((p, i) => {
        const t0 = tiempos?.[i] ?? desde + i * 3;
        const t = interpolate(frame, [t0, t0 + 14], [0, 1], { ...clamp, easing: suave });
        const limpia = p.replace(/[.,:;¿?¡!«»]/g, "");
        const clave = resaltar?.includes(limpia) ?? false;
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", paddingBottom: tam * 0.12, marginBottom: -tam * 0.12 }}>
            <span
              style={{
                display: "inline-block",
                fontFamily: fuente,
                fontWeight: peso,
                fontSize: tam,
                lineHeight: 1.12,
                color: clave ? C.naranja : color,
                transform: `translateY(${(1 - t) * 110}%)`,
              }}
            >
              {p}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// 2. Haz que la cámara siga lo importante + 4. Encadena los movimientos.
// Puntos clave: en el fotograma `f`, la cámara mira al punto (x, y) del lienzo con zoom `s`.
// Entre puntos la cámara nunca se detiene en seco: cada tramo termina donde empieza el siguiente.
export type PuntoCamara = { f: number; x: number; y: number; s: number };
export const Camara: React.FC<{ puntos: PuntoCamara[]; children: React.ReactNode }> = ({ puntos, children }) => {
  const frame = useCurrentFrame();
  const fs = puntos.map((p) => p.f);
  const x = interpolate(frame, fs, puntos.map((p) => p.x), { ...clamp, easing: suave });
  const y = interpolate(frame, fs, puntos.map((p) => p.y), { ...clamp, easing: suave });
  const s = interpolate(frame, fs, puntos.map((p) => p.s), { ...clamp, easing: suave });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <AbsoluteFill style={{ transformOrigin: "0 0", transform: `translate(${540 - x * s}px, ${960 - y * s}px) scale(${s})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};

// 3. Transforma un objeto para introducir la siguiente escena: una caja que cambia de posición,
// tamaño, forma y color de A a B (por ejemplo, un pin del mapa que se vuelve la tarjeta de la escena siguiente).
export type Caja = { x: number; y: number; w: number; h: number; radio: number; color: string };
export const Transformar: React.FC<{ de: Caja; a: Caja; desde: number; dur: number; children: React.ReactNode | null }> = ({ de, a, desde, dur, children }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [desde, desde + dur], [0, 1], { ...clamp, easing: suave });
  const m = (k: "x" | "y" | "w" | "h" | "radio") => de[k] + (a[k] - de[k]) * t;
  return (
    <div
      style={{
        position: "absolute",
        left: m("x"),
        top: m("y"),
        width: m("w"),
        height: m("h"),
        borderRadius: m("radio"),
        background: t < 0.5 ? de.color : a.color,
        overflow: "hidden",
      }}
    >
      <div style={{ opacity: interpolate(t, [0.6, 1], [0, 1], clamp), width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
};
