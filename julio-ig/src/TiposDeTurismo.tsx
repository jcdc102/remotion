import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { C, Palabras, Reel, SANS, SERIF } from "./comun";

// Tipos de turismo según las definiciones de la OMT (2019). Tomas reales de Pexels (créditos en fuentes.md).
// Escenas alineadas con las pausas de public/voz-tipos.mp3 (47,1 s).
export const DURACION_TIPOS = 1428;

const SONIDOS: [number, string, number][] = [
  [0, "whoosh", 0.35],
  [206, "pop", 0.35],
  [212, "pop", 0.35],
  [218, "pop", 0.35],
  [224, "pop", 0.35],
  [230, "pop", 0.35],
  [236, "pop", 0.35],
  [236, "whoosh", 0.45], // 01
  [477, "whoosh", 0.45], // 02
  [648, "whoosh", 0.45], // 03
  [833, "whoosh", 0.45], // 04
  [971, "whoosh", 0.45], // 05
  [1178, "whoosh", 0.45], // 06
  [1311, "whoosh", 0.45], // cierre
  [1330, "ding", 0.3],
];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Toma real a pantalla completa con zoom lento, color cálido, viñeta y entrada con desenfoque.
const Toma: React.FC<{ src: string; desde: number; dur: number; zoom: [number, number]; mover: number }> = ({ src, desde, dur, zoom, mover }) => {
  const frame = useCurrentFrame();
  const escala = interpolate(frame, [0, dur], zoom);
  const x = interpolate(frame, [0, dur], [0, mover]);
  const entrada = interpolate(frame, [0, 9], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${escala + entrada * 0.12}) translateX(${x}px)`, filter: `blur(${entrada * 14}px) contrast(1.08) saturate(1.12) brightness(0.96)` }}>
        <Video src={staticFile(`tomas/${src}`)} muted trimBefore={desde * 30} objectFit="cover" style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      {/* Tono cálido de atardecer, como el resto de la cuenta */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,27,46,0.10), rgba(255,138,80,0.10))", mixBlendMode: "soft-light" }} />
      {/* Oscurecer arriba para el texto y abajo para la interfaz */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,24,0.88) 0%, rgba(8,10,24,0.55) 30%, rgba(8,10,24,0) 52%, rgba(8,10,24,0) 70%, rgba(8,10,24,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// Destello de luz cálida que cruza la pantalla en cada cambio de toma.
const Destello: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${-20 + p * 140}% 30%, rgba(255,190,120,0.75) 0%, rgba(255,120,80,0.35) 22%, transparent 45%)`,
        mixBlendMode: "screen",
        opacity: Math.sin(p * Math.PI),
        pointerEvents: "none",
      }}
    />
  );
};

// Grano de película fino en todo el video.
const Grano: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={frame % 30} />
        </filter>
        <rect width={1080} height={1920} filter="url(#grano)" />
      </svg>
    </AbsoluteFill>
  );
};

// Número grande, nombre del tipo y la frase que dices, al ritmo de la voz.
const Rotulo: React.FC<{ n: number; icono: string; titulo: string; frase: string; tTitulo: number; tFrase: number }> = ({ n, icono, titulo, frase, tTitulo, tFrase }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const num = spring({ frame: frame - 2, fps, config: { damping: 14, mass: 0.7 } });
  const linea = interpolate(frame, [tTitulo, tTitulo + 18], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const ico = spring({ frame: frame - tTitulo - 4, fps, config: { damping: 8 } });
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 330 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, opacity: num, transform: `translateX(${(1 - num) * -60}px)` }}>
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontStyle: "italic", fontSize: 150, lineHeight: 1, color: "transparent", WebkitTextStroke: `3px ${C.naranja}` }}>
          {String(n).padStart(2, "0")}
        </span>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: "rgba(255,244,230,0.6)", letterSpacing: 4 }}>/ 06</span>
        <span style={{ marginLeft: "auto", fontSize: 84, transform: `scale(${ico}) rotate(${(1 - ico) * -30}deg)`, display: "inline-block" }}>{icono}</span>
      </div>
      <div style={{ height: 4, width: `${linea * 100}%`, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral}, transparent)`, margin: "18px 0 22px" }} />
      <Palabras texto={titulo} tam={86} fuente={SERIF} peso={800} retraso={tTitulo} resaltar={null} color={C.crema} />
      <div style={{ height: 20 }} />
      <Palabras texto={frase} tam={44} fuente={SANS} peso={500} retraso={tFrase} resaltar={null} color="rgba(255,244,230,0.9)" />
    </div>
  );
};

const TIPOS: { n: number; icono: string; titulo: string; frase: string; tomas: string; desde: number; tTitulo: number; tFrase: number; zoom: [number, number]; mover: number }[] = [
  { n: 1, icono: "🏛️", titulo: "Turismo cultural", frase: "Aprender y vivir la cultura de un lugar: su historia, sus tradiciones, su patrimonio.", tomas: "cultural.mp4", desde: 2, tTitulo: 18, tFrase: 63, zoom: [1.12, 1.0], mover: -30 },
  { n: 2, icono: "🐋", titulo: "Ecoturismo", frase: "Observar y apreciar la naturaleza… cuidándola.", tomas: "ballena.mp4", desde: 3, tTitulo: 6, tFrase: 50, zoom: [1.0, 1.1], mover: 20 },
  { n: 3, icono: "🏄", titulo: "Turismo de aventura", frase: "Actividad física, naturaleza… y un poquito de riesgo.", tomas: "surf.mp4", desde: 2, tTitulo: 6, tFrase: 66, zoom: [1.1, 1.0], mover: -25 },
  { n: 4, icono: "🌮", titulo: "Turismo gastronómico", frase: "Tu viaje gira alrededor de la comida.", tomas: "tacos.mp4", desde: 1, tTitulo: 6, tFrase: 72, zoom: [1.0, 1.12], mover: 0 },
  { n: 5, icono: "🌿", titulo: "Turismo de salud", frase: "Cuidar tu cuerpo y tu mente: desde un spa hasta un tratamiento médico.", tomas: "spa.mp4", desde: 0, tTitulo: 6, tFrase: 69, zoom: [1.12, 1.0], mover: 25 },
  { n: 6, icono: "🌅", titulo: "Sol y playa", frase: "El clásico…", tomas: "playa.mp4", desde: 5, tTitulo: 6, tFrase: 40, zoom: [1.0, 1.1], mover: -20 },
];

const Tipo = (i: number, dur: number): React.FC => {
  const t = TIPOS[i];
  const Pieza: React.FC = () => (
    <>
      <Toma src={t.tomas} desde={t.desde} dur={dur} zoom={t.zoom} mover={t.mover} />
      <Rotulo n={t.n} icono={t.icono} titulo={t.titulo} frase={t.frase} tTitulo={t.tTitulo} tFrase={t.tFrase} />
      <div style={{ position: "absolute", left: 80, top: 1400, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "rgba(255,244,230,0.7)" }}>
        Definición: OMT (2019) · Video: Pexels
      </div>
      <Destello />
    </>
  );
  return Pieza;
};

// Gancho: la maleta y los 6 tipos que aparecen.
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iconos = TIPOS.map((t) => t.icono);
  return (
    <>
      <Toma src="maleta.mp4" desde={0} dur={240} zoom={[1.15, 1.0]} mover={0} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 340 }}>
        <Palabras texto="No todo el turismo es ir a la playa." tam={88} fuente={SERIF} peso={800} retraso={2} resaltar={["playa"]} color={C.crema} />
        <div style={{ height: 26 }} />
        <Palabras texto="La Organización Mundial del Turismo reconoce muchos tipos." tam={44} fuente={SANS} peso={500} retraso={97} resaltar={null} color="rgba(255,244,230,0.9)" />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 18 }}>
        {iconos.map((e, i) => {
          const s = spring({ frame: frame - 206 - i * 6, fps, config: { damping: 9 } });
          return (
            <div
              key={i}
              style={{
                width: 128,
                height: 128,
                borderRadius: 34,
                background: "rgba(255,244,230,0.14)",
                border: "2px solid rgba(255,244,230,0.35)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 64,
                opacity: s,
                transform: `translateY(${(1 - s) * 80}px) scale(${0.6 + s * 0.4})`,
              }}
            >
              {e}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1020, textAlign: "center", fontFamily: SERIF, fontWeight: 800, fontSize: 64, color: C.naranja, opacity: spring({ frame: frame - 206, fps, config: { damping: 12 } }) }}>
        Te enseño 6
      </div>
    </>
  );
};

// Sol y playa: el remate con Puerto Vallarta.
const SolYPlaya: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const Pieza = Tipo(5, 133);
  const pv = spring({ frame: frame - 70, fps, config: { damping: 10 } });
  return (
    <>
      <Pieza />
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", opacity: pv, transform: `scale(${0.7 + pv * 0.3})` }}>
        <div style={{ padding: "16px 36px", borderRadius: 999, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, fontFamily: SERIF, fontWeight: 800, fontSize: 60, color: C.noche }}>
          …y el de Puerto Vallarta
        </div>
      </div>
    </>
  );
};

// Cierre: mosaico de las 6 tomas con su número.
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "#0B0E1F" }}>
      <div style={{ position: "absolute", left: 60, right: 60, top: 330 }}>
        <Palabras texto="¿Y tú qué tipo de turista eres?" tam={84} fuente={SERIF} peso={800} retraso={2} resaltar={["turista"]} color={C.crema} />
      </div>
      <div style={{ position: "absolute", left: 60, top: 600, display: "grid", gridTemplateColumns: "repeat(3, 306px)", gap: 21 }}>
        {TIPOS.map((t, i) => {
          const s = spring({ frame: frame - 6 - i * 4, fps, config: { damping: 12 } });
          return (
            <div key={t.n} style={{ position: "relative", width: 306, height: 380, borderRadius: 26, overflow: "hidden", opacity: s, transform: `scale(${0.8 + s * 0.2})`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
              <Video src={staticFile(`tomas/${t.tomas}`)} muted trimBefore={t.desde * 30} objectFit="cover" style={{ width: "100%", height: "100%" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.75) 100%)" }} />
              <div style={{ position: "absolute", left: 18, bottom: 14, fontFamily: SERIF, fontWeight: 800, fontStyle: "italic", fontSize: 64, color: C.naranja, lineHeight: 1 }}>{t.n}</div>
              <div style={{ position: "absolute", right: 14, top: 12, fontSize: 44 }}>{t.icono}</div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 1430 - 30,
          display: "flex",
          justifyContent: "center",
          opacity: spring({ frame: frame - 40, fps, config: { damping: 10 } }),
        }}
      >
        <div style={{ padding: "12px 34px", borderRadius: 999, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.noche }}>
          Comenta tu número 👇
        </div>
      </div>
      <Destello />
    </AbsoluteFill>
  );
};

export const TiposDeTurismo: React.FC = () => (
  <>
    <Reel
      duracion={DURACION_TIPOS}
      fondo={<AbsoluteFill style={{ background: "#000" }} />}
      etiqueta={null}
      voz="voz-tipos.mp3"
      musica="musica-tipos.mp3"
      sonidos={SONIDOS}
      escenas={[
        { desde: 0, dur: 240, Pieza: Gancho },
        { desde: 240, dur: 241, Pieza: Tipo(0, 241) },
        { desde: 481, dur: 171, Pieza: Tipo(1, 171) },
        { desde: 652, dur: 185, Pieza: Tipo(2, 185) },
        { desde: 837, dur: 138, Pieza: Tipo(3, 138) },
        { desde: 975, dur: 207, Pieza: Tipo(4, 207) },
        { desde: 1182, dur: 133, Pieza: SolYPlaya },
        { desde: 1315, dur: 113, Pieza: Cierre },
      ]}
    />
    <Grano />
  </>
);
