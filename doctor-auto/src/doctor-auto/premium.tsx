// Motor de estilo premium (CLAUDE.md, «ESTILO PREMIUM»), común a todos los videos:
// - crearCamara: cámara virtual que sigue lo importante. Pasa exactamente por cada
//   punto clave con curva cúbica monótona, sin detenerse en los puntos intermedios
//   (los movimientos quedan encadenados).
// - Morfo: un objeto de una escena se transforma en el de la siguiente.
// - TituloMascara / FranjaMascara / BarraRevela: texto revelado desde una máscara.
// - AcabadoPremium: viñeta, grano fino, gradación cálida y destello de luz.
import { AbsoluteFill, random, spring } from "remotion";
import { esResaltada } from "../estructura8/datos";
import { ANTON, DEGRADADO, POPPINS, PESO_POPPINS } from "./constantes";

const FPS = 30;
export const FOCO = { x: 540, y: 560 }; // punto de la pantalla al que la cámara lleva su objetivo

// ---------- Cámara ----------
export type Toma = { x: number; y: number; z: number };
export type Clave = [number, number, number, number]; // [tiempo s, x, y, zoom]

// Interpolación cúbica monótona (Fritsch–Carlson): sin rebasar los puntos clave.
const monotona = (ts: number[], vs: number[]) => {
  const n = ts.length;
  const d = ts.slice(0, -1).map((_, i) => (vs[i + 1] - vs[i]) / Math.max(1e-6, ts[i + 1] - ts[i]));
  const m = ts.map((_, i) => (i === 0 || i === n - 1 ? 0 : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const k = 3 / Math.sqrt(s);
      m[i] = k * a * d[i];
      m[i + 1] = k * b * d[i];
    }
  }
  return (t: number) => {
    if (t <= ts[0]) return vs[0];
    if (t >= ts[n - 1]) return vs[n - 1];
    let i = 0;
    while (t > ts[i + 1]) i++;
    const h = ts[i + 1] - ts[i];
    const u = (t - ts[i]) / h;
    const h00 = 2 * u ** 3 - 3 * u ** 2 + 1;
    const h10 = u ** 3 - 2 * u ** 2 + u;
    const h01 = -2 * u ** 3 + 3 * u ** 2;
    const h11 = u ** 3 - u ** 2;
    return h00 * vs[i] + h10 * h * m[i] + h01 * vs[i + 1] + h11 * h * m[i + 1];
  };
};

export const crearCamara = (claves: Clave[]) => {
  const orden = [...claves].sort((a, b) => a[0] - b[0]);
  const ts = orden.map((k) => k[0]);
  const fx = monotona(ts, orden.map((k) => k[1]));
  const fy = monotona(ts, orden.map((k) => k[2]));
  // El zoom se interpola en escala logarítmica para que acercarse se sienta parejo.
  const fz = monotona(ts, orden.map((k) => Math.log(k[3])));
  return (t: number): Toma => ({ x: fx(t), y: fy(t), z: Math.exp(fz(t)) });
};

// Leve movimiento de cámara en mano para que ninguna toma quede quieta.
export const pulsoMano = (t: number) => ({
  dx: Math.sin(t * 0.9) * 4 + Math.sin(t * 2.3) * 1.5,
  dy: Math.cos(t * 0.7) * 3 + Math.sin(t * 1.9) * 1.2,
  giro: Math.sin(t * 0.5) * 0.25,
});

// Estilo CSS de una capa vista por la cámara (coordenadas de escena 1080×1920).
export const estiloCamara = (c: Toma, t: number, mano = true): React.CSSProperties => {
  const p = mano ? pulsoMano(t) : { dx: 0, dy: 0, giro: 0 };
  return {
    position: "absolute",
    left: 0,
    top: 0,
    width: 1080,
    height: 1920,
    transformOrigin: "0 0",
    transform: `translate(${FOCO.x - c.x * c.z + p.dx}px, ${FOCO.y - c.y * c.z + p.dy}px) scale(${c.z}) rotate(${p.giro}deg)`,
  };
};

// Punto de la escena → pantalla, con la cámara c.
export const aPantalla = (c: Toma, x: number, y: number) => ({ x: FOCO.x + (x - c.x) * c.z, y: FOCO.y + (y - c.y) * c.z });

// ---------- Morfo: un objeto se transforma en otro ----------
export type Forma = { cx: number; cy: number; w: number; h: number; rx: number; relleno: [number, number, number, number]; borde: [number, number, number, number]; grosor: number };
const mezclar = (a: number, b: number, p: number) => a + (b - a) * p;
const color = (c: number[]) => `rgba(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])},${c[3]})`;
export const suave = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);

// Dibuja la forma intermedia entre "de" y "a" (p: 0 → 1). Ligero estirón en el centro del viaje.
export const Morfo: React.FC<{ de: Forma; a: Forma; p: number; opacidad: number }> = ({ de, a, p, opacidad }) => {
  if (opacidad <= 0) return null;
  const e = suave(Math.max(0, Math.min(1, p)));
  const estiron = 1 + 0.08 * Math.sin(Math.PI * e);
  const f = {
    cx: mezclar(de.cx, a.cx, e),
    cy: mezclar(de.cy, a.cy, e),
    w: mezclar(de.w, a.w, e) * estiron,
    h: mezclar(de.h, a.h, e) / estiron,
    rx: mezclar(de.rx, a.rx, e),
    grosor: mezclar(de.grosor, a.grosor, e),
  };
  const relleno = de.relleno.map((v, i) => mezclar(v, a.relleno[i], e));
  const borde = de.borde.map((v, i) => mezclar(v, a.borde[i], e));
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: opacidad, overflow: "visible" }}>
      <defs>
        <filter id="brillo-morfo" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect
        x={f.cx - f.w / 2}
        y={f.cy - f.h / 2}
        width={f.w}
        height={f.h}
        rx={Math.min(f.rx, f.w / 2, f.h / 2)}
        fill={color(relleno)}
        stroke={color(borde)}
        strokeWidth={f.grosor}
        filter="url(#brillo-morfo)"
      />
      {/* destello que recorre la forma durante la transformación */}
      <rect
        x={f.cx - f.w / 2}
        y={f.cy - f.h / 2}
        width={f.w}
        height={f.h}
        rx={Math.min(f.rx, f.w / 2, f.h / 2)}
        fill="none"
        stroke="#fff"
        strokeOpacity={0.55 * Math.sin(Math.PI * e)}
        strokeWidth={4}
      />
    </svg>
  );
};

// ---------- Texto revelado desde máscara ----------
const resorte = (t: number, t0: number, damping = 14, stiffness = 170) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness } });

// Título: cada palabra sube desde detrás de una línea invisible (máscara), con 2
// fotogramas entre palabras; al salir, sube y desaparece por la misma máscara.
// Las palabras clave llevan la cápsula roja que se dibuja de izquierda a derecha.
export const TituloMascara: React.FC<{ texto: string; resaltar: string[]; t: number; t0: number; t1: number; tamano: number }> = ({
  texto,
  resaltar,
  t,
  t0,
  t1,
  tamano,
}) => {
  if (t < t0 || t > t1 + 0.4) return null;
  const palabras = texto.split(/\s+/);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: tamano * 0.22, rowGap: tamano * 0.04, fontFamily: ANTON, fontSize: tamano, lineHeight: 1.08, color: "#fff", textTransform: "uppercase" }}>
      {palabras.map((w, i) => {
        const entra = resorte(t, t0 + i * (2 / FPS));
        const sale = resorte(t, t1 + i * (1 / FPS), 18, 220);
        const clave = esResaltada(w, resaltar);
        const dibujo = Math.max(0, Math.min(1, (t - t0 - i * (2 / FPS) - 0.12) / 0.2));
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: "0.22em 0.06em 0.08em", marginTop: "-0.18em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - entra) * 110 - sale * 110}%)` }}>
              {clave ? (
                <span style={{ position: "relative", display: "inline-block", padding: "0 0.22em" }}>
                  <span style={{ position: "absolute", inset: "0.02em 0", background: DEGRADADO, borderRadius: "0.18em", clipPath: `inset(0 ${(1 - dibujo) * 100}% 0 0)`, boxShadow: "0 8px 24px rgba(204,35,40,0.45)" }} />
                  <span style={{ position: "relative" }}>{w}</span>
                </span>
              ) : (
                <span style={{ textShadow: "0 6px 24px rgba(0,0,0,0.65), 0 2px 0 rgba(0,0,0,0.5)" }}>{w}</span>
              )}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// Franja de aviso: la banda roja se descubre de izquierda a derecha y el texto sube
// desde su máscara; al final, la banda se va hacia la derecha.
export const FranjaMascara: React.FC<{ texto: string; t: number; t0: number; t1: number; arriba: number }> = ({ texto, t, t0, t1, arriba }) => {
  if (t < t0 || t > t1) return null;
  const abre = suave(Math.min(1, (t - t0) / 0.27));
  const cierra = suave(Math.max(0, Math.min(1, (t - (t1 - 0.25)) / 0.25)));
  const sube = resorte(t, t0 + 0.12);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: arriba,
        minHeight: 104,
        background: DEGRADADO,
        clipPath: `inset(0 ${(1 - abre) * 100}% 0 ${cierra * 100}%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ overflow: "hidden", maxWidth: 780, marginRight: 140, padding: "14px 0" }}>
        <div style={{ transform: `translateY(${(1 - sube) * 110}%)`, textAlign: "center", fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: 38, lineHeight: 1.22, color: "#fff" }}>{texto}</div>
      </div>
    </div>
  );
};

// Barra que revela: una barra roja cubre el área de izquierda a derecha y, al
// retirarse hacia la derecha, deja el contenido descubierto.
export const BarraRevela: React.FC<{ t: number; t0: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ t, t0, children, style }) => {
  const l = t - t0;
  if (l < 0) return null;
  const cubre = suave(Math.min(1, l / 0.18));
  const retira = suave(Math.max(0, Math.min(1, (l - 0.2) / 0.2)));
  return (
    <div style={{ position: "relative", display: "inline-block", ...style }}>
      <div style={{ opacity: l >= 0.18 ? 1 : 0 }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, background: DEGRADADO, transformOrigin: retira > 0 ? "right" : "left", transform: `scaleX(${retira > 0 ? 1 - retira : cubre})` }} />
    </div>
  );
};

// ---------- Acabado premium ----------
// Viñeta, gradación cálida, destello de luz que deriva y grano fino de película.
export const AcabadoPremium: React.FC<{ frame: number; calidez: number }> = ({ frame, calidez }) => {
  const t = frame / FPS;
  const semilla = Math.floor(random(`grano-${frame % 12}`) * 1000);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${30 + 20 * Math.sin(t * 0.3)}% ${25 + 8 * Math.cos(t * 0.4)}%, rgba(255,150,80,${0.1 * calidez}) 0%, rgba(255,120,60,0) 45%)`, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(255,170,90,${0.05 * calidez}) 0%, rgba(0,0,0,0) 40%, rgba(40,10,60,${0.08 * calidez}) 100%)`, mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={semilla} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#grano)" />
      </svg>
    </AbsoluteFill>
  );
};

// Fondo de estudio para primeros planos: degradado profundo con luz de acento roja,
// bokeh que flota y piso con reflejo.
const BOKEH = Array.from({ length: 16 }, (_, k) => ({ x: random(`bx${k}`) * 1080, y: 200 + random(`by${k}`) * 900, r: 20 + random(`br${k}`) * 70, v: 6 + random(`bv${k}`) * 14, f: random(`bf${k}`) * 6 }));
export const Estudio: React.FC<{ t: number; tono: [string, string]; acento: string }> = ({ t, tono, acento }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <defs>
      <radialGradient id={`est-${tono[0]}`} cx="0.5" cy="0.3" r="0.75">
        <stop offset="0" stopColor={tono[0]} />
        <stop offset="1" stopColor={tono[1]} />
      </radialGradient>
      <filter id="bokeh-blur" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="12" />
      </filter>
      <linearGradient id="haz" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity={0.12} />
        <stop offset="1" stopColor="#fff" stopOpacity={0} />
      </linearGradient>
    </defs>
    <rect width={1080} height={1920} fill={`url(#est-${tono[0]})`} />
    <path d={`M${420 + 40 * Math.sin(t * 0.4)} 0 L${660 + 40 * Math.sin(t * 0.4)} 0 L900 1100 L180 1100 Z`} fill="url(#haz)" />
    {BOKEH.map((b, k) => (
      <circle key={k} cx={(b.x + t * b.v) % 1180 - 50} cy={b.y + Math.sin(t * 0.6 + b.f) * 20} r={b.r} fill={k % 3 === 0 ? acento : "#ffd9a8"} opacity={0.08 + 0.05 * Math.sin(t + b.f)} filter="url(#bokeh-blur)" />
    ))}
    {/* piso: elipse de luz y reflejo */}
    <ellipse cx={540} cy={900} rx={520} ry={70} fill={acento} opacity={0.12} filter="url(#bokeh-blur)" />
    <rect y={1000} width={1080} height={920} fill="#000" opacity={0.35} />
  </svg>
);
