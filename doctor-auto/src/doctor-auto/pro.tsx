// Motor "pro" (CLAUDE.md, «ESTILO COOL 3D»): tomas reales (video o imagen) con
// movimiento de cámara constante y gradación de color, transiciones con zoom y
// destello de luz, etiquetas que señalan cosas sobre el video y número grande.
import { AbsoluteFill, Img, OffthreadVideo, Sequence, spring, staticFile } from "remotion";
import { ANTON, DEGRADADO, POPPINS, PESO_POPPINS, ROJO_DA } from "./constantes";

const FPS = 30;
const limitar01 = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const resorte = (t: number, t0: number, damping = 13, stiffness = 180) =>
  t < t0 ? 0 : spring({ frame: Math.round((t - t0) * FPS), fps: FPS, config: { damping, stiffness } });

export type Toma = {
  nombre: string;
  archivo: string; // en public/
  desde: number; // s en el video
  hasta: number;
  zoom: [number, number]; // escala al inicio y al final (movimiento constante)
  foco: [number, number]; // origen del zoom en % (x, y)
  paneo?: [number, number]; // desplazamiento horizontal en px al inicio y al final
  velocidad?: number; // reproducción del video (1 = normal)
  inicioClip?: number; // s dentro del archivo donde empieza
  filtro?: string; // gradación extra (CSS filter)
  desenfoque?: number; // px, para usarla de fondo detrás de gráficos
};

const esVideo = (f: string) => /\.(mp4|webm|mov)$/i.test(f);

// Una toma real a pantalla completa. Entra con un zoom rápido desenfocado (8 fotogramas)
// y nunca queda quieta: hace un zoom lento con paneo durante toda su duración.
export const TomaReal: React.FC<{ toma: Toma; t: number }> = ({ toma, t }) => {
  if (t < toma.desde - 0.01 || t > toma.hasta + 0.3) return null;
  const p = limitar01((t - toma.desde) / Math.max(0.1, toma.hasta - toma.desde));
  const entrada = limitar01((t - toma.desde) / (8 / FPS));
  const golpe = 1 + 0.18 * (1 - suave(entrada));
  const escala = (toma.zoom[0] + (toma.zoom[1] - toma.zoom[0]) * p) * golpe;
  const dx = toma.paneo ? toma.paneo[0] + (toma.paneo[1] - toma.paneo[0]) * p : 0;
  const blur = (toma.desenfoque ?? 0) + 14 * (1 - entrada);
  const estilo: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: `translateX(${dx}px) scale(${escala})`,
    transformOrigin: `${toma.foco[0]}% ${toma.foco[1]}%`,
    filter: `contrast(1.08) saturate(1.12) ${toma.filtro ?? ""} ${blur > 0.2 ? `blur(${blur}px)` : ""}`,
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      {esVideo(toma.archivo) ? (
        <Sequence from={Math.round(toma.desde * FPS)} layout="none">
          <OffthreadVideo src={staticFile(toma.archivo)} muted playbackRate={toma.velocidad ?? 1} startFrom={Math.round((toma.inicioClip ?? 0) * FPS)} style={estilo} />
        </Sequence>
      ) : (
        <Img src={staticFile(toma.archivo)} style={estilo} />
      )}
    </AbsoluteFill>
  );
};

// Todas las tomas en orden; la más reciente queda arriba.
export const Tomas: React.FC<{ tomas: Toma[]; t: number }> = ({ tomas, t }) => (
  <AbsoluteFill style={{ background: "#000" }}>
    {tomas
      .filter((tm) => t >= tm.desde - 0.01 && t <= tm.hasta + 0.3)
      .map((tm) => (
        <TomaReal key={tm.nombre} toma={tm} t={t} />
      ))}
  </AbsoluteFill>
);

// Destello de luz cálido en cada corte (light leak) que barre la pantalla.
export const Destello: React.FC<{ t: number; cortes: number[]; color?: string }> = ({ t, cortes, color = "255,170,90" }) => {
  const c = cortes.find((x) => t >= x - 0.08 && t <= x + 0.3);
  if (c === undefined) return null;
  const p = limitar01((t - (c - 0.08)) / 0.38);
  const a = Math.sin(Math.PI * p);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        background: `radial-gradient(ellipse at ${-20 + 140 * p}% 40%, rgba(${color},${0.75 * a}) 0%, rgba(${color},${0.25 * a}) 30%, rgba(0,0,0,0) 60%)`,
      }}
    />
  );
};

// Oscurecido para legibilidad: arriba (barra y etiquetas) y abajo (subtítulos y mascota).
export const Legibilidad: React.FC<{ fuerza?: number }> = ({ fuerza = 1 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `linear-gradient(180deg, rgba(0,0,0,${0.55 * fuerza}) 0%, rgba(0,0,0,0) 26%, rgba(0,0,0,0) 42%, rgba(0,0,0,${0.55 * fuerza}) 58%, rgba(0,0,0,${0.8 * fuerza}) 100%)`,
    }}
  />
);

// Etiqueta que señala algo en la toma: anillo que late en el punto, línea que se dibuja
// y cápsula con el texto que sale desde su máscara.
export const Senal: React.FC<{ t: number; t0: number; t1: number; x: number; y: number; texto: string; lado: "izq" | "der"; alto?: number; color?: string }> = ({
  t,
  t0,
  t1,
  x,
  y,
  texto,
  lado,
  alto = -150,
  color = ROJO_DA,
}) => {
  if (t < t0 || t > t1) return null;
  const linea = suave(limitar01((t - t0) / 0.25));
  const sale = 1 - suave(limitar01((t - (t1 - 0.2)) / 0.2));
  const late = (t - t0) % 0.8 / 0.8;
  const lx = x + (lado === "der" ? 120 : -120);
  const ly = y + alto;
  const sube = resorte(t, t0 + 0.18);
  return (
    <AbsoluteFill style={{ opacity: sale, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={x} cy={y} r={14} fill="#fff" />
        <circle cx={x} cy={y} r={14 + 46 * late} fill="none" stroke="#fff" strokeWidth={4} opacity={1 - late} />
        <path d={`M${x} ${y} L${lx} ${ly}`} stroke="#fff" strokeWidth={5} strokeDasharray={600} strokeDashoffset={600 * (1 - linea)} />
      </svg>
      <div style={{ position: "absolute", top: ly - 40, ...(lado === "der" ? { left: lx } : { right: 1080 - lx }), overflow: "hidden", borderRadius: 18 }}>
        <div style={{ transform: `translateY(${(1 - sube) * 110}%)`, background: color, color: "#fff", fontFamily: ANTON, fontSize: 46, padding: "6px 22px 10px", borderRadius: 18, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>{texto}</div>
      </div>
    </AbsoluteFill>
  );
};

// Número grande con unidad: la barra roja lo descubre y luego "late" con la música.
export const NumeroGrande: React.FC<{ t: number; t0: number; t1: number; numero: string; unidad: string; arriba: number }> = ({ t, t0, t1, numero, unidad, arriba }) => {
  if (t < t0 || t > t1) return null;
  const l = t - t0;
  const cubre = suave(limitar01(l / 0.16));
  const retira = suave(limitar01((l - 0.18) / 0.18));
  const sube = resorte(t, t0 + 0.25);
  const sale = 1 - suave(limitar01((t - (t1 - 0.15)) / 0.15));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: arriba, display: "flex", flexDirection: "column", alignItems: "center", opacity: sale }}>
      <div style={{ position: "relative" }}>
        <div style={{ opacity: l >= 0.16 ? 1 : 0, fontFamily: ANTON, fontSize: 230, lineHeight: 1, color: "#fff", textShadow: "0 12px 50px rgba(0,0,0,0.7), 0 0 40px rgba(204,35,40,0.6)" }}>{numero}</div>
        <div style={{ position: "absolute", inset: 0, background: DEGRADADO, transformOrigin: retira > 0 ? "right" : "left", transform: `scaleX(${retira > 0 ? 1 - retira : cubre})` }} />
      </div>
      <div style={{ overflow: "hidden", paddingTop: "0.2em", marginTop: "-0.2em" }}>
        <div style={{ transform: `translateY(${(1 - sube) * 120}%)`, fontFamily: ANTON, fontSize: 70, color: "#fff", background: ROJO_DA, padding: "0 24px 6px", borderRadius: 12, letterSpacing: 6 }}>{unidad}</div>
      </div>
    </div>
  );
};

// Chip de vidrio con emoji y texto (para preguntas, datos cortos, avisos).
export const ChipVidrio: React.FC<{ t: number; t0: number; t1: number; texto: string; x: number; y: number; tamano?: number }> = ({ t, t0, t1, texto, x, y, tamano = 34 }) => {
  if (t < t0 || t > t1) return null;
  const entra = resorte(t, t0);
  const sale = 1 - suave(limitar01((t - (t1 - 0.15)) / 0.15));
  return (
    <div style={{ position: "absolute", left: x, top: y, overflow: "hidden", borderRadius: 22, opacity: sale }}>
      <div style={{ transform: `translateY(${(1 - entra) * 110}%)`, background: "rgba(20,20,24,0.45)", border: "2px solid rgba(255,255,255,0.3)", backdropFilter: "blur(16px)", borderRadius: 22, padding: "10px 24px 14px", fontFamily: POPPINS, fontWeight: PESO_POPPINS, fontSize: tamano, color: "#fff", whiteSpace: "nowrap" }}>{texto}</div>
    </div>
  );
};

// Insignia blanca con texto rojo, descubierta por una barra roja.
export const Insignia: React.FC<{ t: number; t0: number; t1: number; texto: string; x: number; y: number; color?: string }> = ({ t, t0, t1, texto, x, y, color = ROJO_DA }) => {
  if (t < t0 || t > t1) return null;
  const l = t - t0;
  const cubre = suave(limitar01(l / 0.16));
  const retira = suave(limitar01((l - 0.18) / 0.18));
  const sale = 1 - suave(limitar01((t - (t1 - 0.15)) / 0.15));
  return (
    <div style={{ position: "absolute", left: x, top: y, opacity: sale }}>
      <div style={{ position: "relative" }}>
        <div style={{ opacity: l >= 0.16 ? 1 : 0, background: "#fff", color, fontFamily: ANTON, fontSize: 50, padding: "6px 24px 10px", borderRadius: 14, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>{texto}</div>
        <div style={{ position: "absolute", inset: 0, background: DEGRADADO, borderRadius: 14, transformOrigin: retira > 0 ? "right" : "left", transform: `scaleX(${retira > 0 ? 1 - retira : cubre})` }} />
      </div>
    </div>
  );
};
