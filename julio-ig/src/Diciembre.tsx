import { AbsoluteFill, Easing, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Video } from "@remotion/media";
import { Grano } from "./cine";
import { C, Palabras, Reel, SANS, SERIF } from "./comun";

// ¿A dónde ir en diciembre según el tipo de turista que eres? Fuentes en fuentes.md.
// Escenas alineadas con las pausas de public/voz-diciembre.mp3 (48,7 s).
export const DURACION_DICIEMBRE = 1490;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Contorno simplificado de México (longitud, latitud). Es ilustrativo, no cartográfico.
const MEXICO: [number, number][] = [
  [-117.1, 32.5], [-116.6, 31.8], [-115.9, 30.4], [-115.2, 29.4], [-114.1, 28.0], [-114.2, 27.2], [-112.8, 26.0], [-112.2, 24.8],
  [-110.0, 22.9], [-109.4, 23.2], [-110.3, 24.2], [-111.2, 25.8], [-112.4, 27.6], [-113.1, 28.7], [-114.0, 30.2], [-114.8, 31.6],
  [-113.0, 31.4], [-112.1, 29.9], [-110.9, 27.9], [-109.4, 26.0], [-108.0, 24.8], [-106.4, 23.2], [-105.3, 21.5], [-105.2, 20.6],
  [-105.7, 20.4], [-104.6, 19.1], [-103.2, 18.3], [-101.9, 17.9], [-99.9, 16.8], [-97.8, 16.0], [-96.1, 15.7], [-95.0, 16.2],
  [-94.0, 16.1], [-92.2, 14.5], [-92.0, 15.1], [-91.4, 16.1], [-90.4, 16.1], [-90.4, 17.8], [-89.1, 17.8], [-88.3, 18.5],
  [-87.5, 19.5], [-86.8, 21.2], [-87.5, 21.5], [-88.9, 21.4], [-90.4, 21.2], [-90.6, 19.8], [-91.8, 18.6], [-93.6, 18.4],
  [-94.8, 18.2], [-95.9, 18.8], [-96.4, 19.6], [-97.2, 20.7], [-97.8, 22.3], [-97.6, 24.0], [-97.2, 25.9], [-99.1, 26.4],
  [-99.9, 27.5], [-100.6, 28.9], [-101.4, 29.8], [-102.7, 29.7], [-103.2, 29.0], [-104.4, 29.6], [-104.9, 30.6], [-106.4, 31.7],
  [-108.2, 31.8], [-108.2, 31.3], [-111.1, 31.3], [-114.8, 32.5],
];
const K = 30;
const ORIGEN = { x: 60, y: 620 };
const proyectar = ([lon, lat]: [number, number]) => ({ x: ORIGEN.x + (lon + 118) * K, y: ORIGEN.y + (33 - lat) * K });
const RUTA_MEXICO = MEXICO.map((p, i) => {
  const { x, y } = proyectar(p);
  return `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`;
}).join(" ") + " Z";

type Destino = {
  emoji: string;
  tipo: string;
  nombre: string;
  frase: string;
  dato: string;
  fuente: string;
  coord: [number, number];
  desde: number;
  hasta: number;
};
const DESTINOS: Destino[] = [
  { emoji: "🏛️", tipo: "Cultural", nombre: "Oaxaca", frase: "Noche de Rábanos", dato: "23 de diciembre · tradición desde 1897", fuente: "Fuente: La Jornada; México Desconocido", coord: [-96.7, 17.1], desde: 132, hasta: 381 },
  { emoji: "🦋", tipo: "Ecoturismo", nombre: "Mariposa monarca", frase: "Michoacán y Estado de México", dato: "Patrimonio Mundial UNESCO · nov. a mar.", fuente: "Fuente: UNESCO; CONANP · Video: Pexels", coord: [-100.3, 19.6], desde: 381, hasta: 610 },
  { emoji: "🏔️", tipo: "Aventura", nombre: "Barrancas del Cobre", frase: "Chihuahua", dato: "Con suerte, nieve de diciembre a febrero", fuente: "Fuente: México Desconocido", coord: [-107.6, 27.75], desde: 610, hasta: 811 },
  { emoji: "🌮", tipo: "Gastronómico", nombre: "Michoacán", frase: "Cocina tradicional", dato: "Patrimonio Inmaterial UNESCO · 2010", fuente: "Fuente: UNESCO (2010) · Video: Morelia, Pexels", coord: [-101.6, 19.5], desde: 811, hasta: 1037 },
  { emoji: "♨️", tipo: "Salud y bienestar", nombre: "Tolantongo", frase: "Hidalgo", dato: "Aguas termales para descansar", fuente: "Fuente: México Desconocido", coord: [-99.0, 20.65], desde: 1037, hasta: 1161 },
  { emoji: "🌅", tipo: "Sol y playa", nombre: "Puerto Vallarta", frase: "Bahía de Banderas", dato: "En invierno llegan las ballenas jorobadas", fuente: "Fuente: UdeG, CUCosta (2025)", coord: [-105.23, 20.65], desde: 1161, hasta: 1365 },
];

const SONIDOS: [number, string, number][] = [
  [0, "whoosh", 0.35],
  ...DESTINOS.map((_, i): [number, string, number] => [66 + i * 5, "pop", 0.3]),
  ...DESTINOS.flatMap((d): [number, string, number][] => [
    [d.desde, "whoosh", 0.45],
    [d.desde + 22, "pop", 0.4],
  ]),
  [732, "brillo", 0.3], // nieve
  [1300, "golpe", 0.35], // ballena
  [1365, "whoosh", 0.45],
  [1380, "notificacion", 0.4],
];

// Cámara: vista general y acercamiento a cada destino, con transiciones suaves.
const camara = (frame: number) => {
  const general = { s: 1, px: 540, py: 905, cx: 540, cy: 905 };
  const estados = [
    { f: 0, ...general },
    ...DESTINOS.map((d) => {
      const p = proyectar(d.coord);
      return { f: d.desde, s: 2.0, px: p.x, py: p.y, cx: 540, cy: 800 };
    }),
    { f: 1365, ...general },
  ];
  let i = 0;
  while (i < estados.length - 1 && frame >= estados[i + 1].f) i++;
  const a = estados[i];
  const b = estados[Math.min(i + 1, estados.length - 1)];
  if (a === b || frame < b.f - 0) {
    // Transición de 24 fotogramas al empezar cada estado.
    const prev = estados[Math.max(0, i - 1)];
    const t = i === 0 ? 1 : interpolate(frame, [a.f, a.f + 24], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
    const mix = (k: "s" | "px" | "py" | "cx" | "cy") => prev[k] + (a[k] - prev[k]) * t;
    return { s: mix("s"), px: mix("px"), py: mix("py"), cx: mix("cx"), cy: mix("cy") };
  }
  return a;
};

const Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cam = camara(frame);
  const dibujo = interpolate(frame, [0, 60], [0, 1], clamp);
  const transform = `translate(${cam.cx} ${cam.cy}) scale(${cam.s}) translate(${-cam.px} ${-cam.py})`;
  const visitados = DESTINOS.filter((d) => frame >= d.desde + 10).map((d) => proyectar(d.coord));
  return (
    <svg style={{ position: "absolute", inset: 0 }} width={1080} height={1920}>
      <defs>
        <filter id="brilloMapa" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g transform={transform}>
        {/* Retícula de latitud y longitud */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`v${i}`} x1={ORIGEN.x + i * 4 * K} y1={ORIGEN.y - 60} x2={ORIGEN.x + i * 4 * K} y2={ORIGEN.y + 640} stroke="rgba(255,244,230,0.06)" strokeWidth={1.5 / cam.s} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`h${i}`} x1={ORIGEN.x - 60} y1={ORIGEN.y + i * 4 * K} x2={ORIGEN.x + 1020} y2={ORIGEN.y + i * 4 * K} stroke="rgba(255,244,230,0.06)" strokeWidth={1.5 / cam.s} />
        ))}
        <path d={RUTA_MEXICO} fill={`rgba(42,58,104,${0.85 * dibujo})`} stroke={C.coral} strokeWidth={3 / cam.s} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dibujo} filter="url(#brilloMapa)" />
        {/* Ruta del viaje */}
        {visitados.length > 1 ? (
          <polyline points={visitados.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={C.naranja} strokeWidth={3 / cam.s} strokeDasharray={`${10 / cam.s} ${8 / cam.s}`} opacity={0.8} />
        ) : null}
        {DESTINOS.map((d, i) => {
          const p = proyectar(d.coord);
          const aparece = spring({ frame: frame - 66 - i * 5, fps, config: { damping: 10 } });
          const activo = frame >= d.desde && frame < d.hasta;
          const pulso = activo ? ((frame - d.desde) % 40) / 40 : 0;
          const r = 9 / Math.sqrt(cam.s);
          return (
            <g key={d.nombre} opacity={aparece}>
              {activo ? <circle cx={p.x} cy={p.y} r={r + pulso * 30 / cam.s} fill="none" stroke={C.naranja} strokeWidth={3 / cam.s} opacity={1 - pulso} /> : null}
              <circle cx={p.x} cy={p.y} r={r * aparece} fill={activo ? C.naranja : C.coral} stroke={C.crema} strokeWidth={2 / cam.s} />
              <text x={p.x} y={p.y - 18 / cam.s} textAnchor="middle" fontSize={34 / cam.s}>
                {d.emoji}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ---------- Ilustraciones de las postales ----------
const Rabanos: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1E1440 0%, #4A1F3E 100%)" }}>
      {Array.from({ length: 30 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 97) % 860, top: (i * 53) % 120, width: 6, height: 6, borderRadius: 3, background: ["#FFC27A", "#FF6B5B", "#5BD6A0"][i % 3], opacity: 0.4 + 0.6 * Math.abs(Math.sin(frame / 10 + i)) }} />
      ))}
      {[0, 1, 2, 3].map((i) => {
        const brinco = Math.abs(Math.sin(frame / 9 + i * 1.3)) * 18;
        return (
          <svg key={i} style={{ position: "absolute", left: 110 + i * 170, top: 120 - brinco }} width={130} height={170} viewBox="0 0 130 170">
            <path d="M65 60 C40 10 20 20 30 50 M65 60 C65 5 80 5 75 50 M65 60 C95 15 110 30 95 55" stroke="#4CAF6A" strokeWidth={9} fill="none" strokeLinecap="round" />
            <ellipse cx={65} cy={105} rx={46} ry={44} fill="#E0344F" />
            <ellipse cx={50} cy={92} rx={12} ry={8} fill="rgba(255,255,255,0.35)" />
            <path d="M65 149 L65 168" stroke="#F3D6DC" strokeWidth={4} />
            <circle cx={52} cy={108} r={5} fill="#1E1440" />
            <circle cx={78} cy={108} r={5} fill="#1E1440" />
          </svg>
        );
      })}
      <div style={{ position: "absolute", right: 30, top: 20, width: 120, borderRadius: 16, overflow: "hidden", background: C.crema, textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }}>
        <div style={{ background: C.coral, color: C.crema, fontFamily: SANS, fontWeight: 600, fontSize: 22, padding: 4 }}>DIC</div>
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 56, color: C.noche }}>23</div>
      </div>
    </AbsoluteFill>
  );
};

const Barrancas: React.FC = () => {
  const frame = useCurrentFrame();
  const tren = interpolate(frame, [0, 200], [-420, 900]);
  const nieve = interpolate(frame, [118, 130], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #7FA6C9 0%, #C9D9E6 100%)" }}>
      <svg style={{ position: "absolute", inset: 0 }} width={860} height={300}>
        <path d="M0 120 L120 80 L230 130 L360 60 L480 120 L620 70 L760 125 L860 90 L860 300 L0 300 Z" fill="#8C5A3C" />
        <path d="M0 120 L120 80 L160 92 L230 130 L300 98 L360 60 L420 90 L480 120" fill="none" stroke="#FFFFFF" strokeWidth={10 * nieve} opacity={nieve} />
        <path d="M0 175 L150 140 L300 190 L460 130 L620 185 L860 150 L860 300 L0 300 Z" fill="#A8693F" />
        <path d="M0 235 L860 235" stroke="#5A3A2A" strokeWidth={6} />
      </svg>
      <div style={{ position: "absolute", left: tren, top: 196, display: "flex", gap: 6 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ width: 96, height: 36, borderRadius: i === 0 ? "18px 8px 6px 6px" : 6, background: i === 0 ? "#C0392B" : "#E67E22", border: "3px solid #3A1F1A", display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
            {[0, 1, 2].map((w) => (
              <div key={w} style={{ width: 16, height: 12, background: "#FFF4E6", borderRadius: 2 }} />
            ))}
          </div>
        ))}
      </div>
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 71) % 860, top: ((frame * 2 + i * 37) % 320) - 20, width: 7, height: 7, borderRadius: 4, background: "#FFFFFF", opacity: nieve * 0.9 }} />
      ))}
    </AbsoluteFill>
  );
};

const Termales: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #4A6B5A 0%, #2F4A3E 100%)" }}>
      <svg style={{ position: "absolute", inset: 0 }} width={860} height={300}>
        <path d="M0 0 L860 0 L860 300 L0 300 Z" fill="#5C7A5A" />
        <path d="M300 0 Q 430 -20 560 0 L 540 70 Q 430 40 320 70 Z" fill="#2B2420" />
        <path d="M380 60 Q 430 20 480 60 L 470 110 L 390 110 Z" fill="#1A1412" />
        <path d="M425 100 L 425 300" stroke="#7FE7E0" strokeWidth={10} opacity={0.6} />
      </svg>
      {[0, 1, 2, 3].map((i) => {
        const ancho = 260 + i * 120;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 430 - ancho / 2,
              width: ancho,
              top: 100 + i * 50,
              height: 40,
              borderRadius: "0 0 40px 40px",
              background: "linear-gradient(180deg, #7FE7E0, #2FB9C2)",
              borderBottom: "8px solid #CBB28E",
              boxShadow: "inset 0 6px 0 rgba(255,255,255,0.35)",
            }}
          />
        );
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const ciclo = ((frame + i * 13) % 80) / 80;
        return (
          <div key={i} style={{ position: "absolute", left: 120 + (i * 61) % 620, top: 230 - ciclo * 220, width: 60, height: 40, borderRadius: 30, background: "rgba(255,255,255,0.5)", filter: "blur(10px)", opacity: Math.sin(ciclo * Math.PI) }} />
        );
      })}
    </AbsoluteFill>
  );
};

const Bahia: React.FC = () => {
  const frame = useCurrentFrame();
  const salto = interpolate(frame, [95, 125, 170], [0, 1, 0], clamp);
  const agua = (y: number, fase: number) => {
    let d = `M 0 ${y}`;
    for (let x = 0; x <= 860; x += 20) d += ` L ${x} ${y + Math.sin(x / 50 + frame / 8 + fase) * 5}`;
    return `${d} L 860 300 L 0 300 Z`;
  };
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #3A1F4A 0%, #D2604F 55%, #FFC27A 70%)" }}>
      <div style={{ position: "absolute", left: 560, top: 120, width: 120, height: 120, borderRadius: 60, background: "radial-gradient(circle, #FFF1C9, #FF8F5A)" }} />
      <svg style={{ position: "absolute", inset: 0 }} width={860} height={300}>
        <path d="M0 190 Q 120 120 240 170 Q 360 110 480 175 L 480 200 L 0 200 Z" fill="#2A1A3A" />
        <path d={agua(190, 0)} fill="#2C2350" />
        <g transform={`translate(330 ${225 - salto * 90}) scale(1.7)`} opacity={salto > 0.02 ? 1 : 0}>
          <path d="M0 0 C -40 -30 -70 -20 -80 -45 C -50 -40 -20 -50 0 -20 C 20 -50 50 -40 80 -45 C 70 -20 40 -30 0 0 L 6 40 L -6 40 Z" fill="#1A1430" />
        </g>
        <path d={agua(215, 2)} fill="#1E1B40" />
      </svg>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 320 + Math.cos(i) * 60 * salto, top: 200 - Math.abs(Math.sin(i * 2)) * 70 * salto, width: 10, height: 10, borderRadius: 5, background: "#FFFFFF", opacity: salto }} />
      ))}
    </AbsoluteFill>
  );
};

const Media: React.FC<{ i: number }> = ({ i }) => {
  if (i === 1) return <Video src={staticFile("tomas/monarca.mp4")} muted trimBefore={60} objectFit="cover" style={{ width: "100%", height: "100%" }} />;
  if (i === 3) return <Video src={staticFile("tomas/morelia.mp4")} muted trimBefore={120} objectFit="cover" style={{ width: "100%", height: "100%" }} />;
  return [<Rabanos key="r" />, null, <Barrancas key="b" />, null, <Termales key="t" />, <Bahia key="p" />][i];
};

// Postal con la imagen, el dato y la fuente.
const Postal: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = DESTINOS[i];
  const s = spring({ frame: frame - 18, fps, config: { damping: 13, mass: 0.8 } });
  const sale = interpolate(frame, [d.hasta - d.desde - 10, d.hasta - d.desde], [1, 0], clamp);
  return (
    <div
      style={{
        position: "absolute",
        left: 100,
        width: 880,
        top: 1010,
        borderRadius: 30,
        background: C.crema,
        padding: 10,
        boxShadow: "0 30px 70px rgba(0,0,0,0.55)",
        transform: `translateY(${(1 - s) * 500}px) rotate(${(i % 2 ? 1.5 : -1.5) * s}deg)`,
        opacity: sale,
      }}
    >
      <div style={{ position: "relative", height: 300, borderRadius: 22, overflow: "hidden" }}>
        <Media i={i} />
      </div>
      <div style={{ padding: "12px 14px 4px" }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.noche }}>{d.dato}</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 19, color: "rgba(14,27,46,0.6)", marginTop: 2 }}>{d.fuente}</div>
      </div>
    </div>
  );
};

// Rótulo de arriba: tipo de turista, destino y detalle.
const Rotulo: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const d = DESTINOS[i];
  const p = spring({ frame: frame - 2, fps, config: { damping: 12 } });
  const sale = interpolate(frame, [d.hasta - d.desde - 8, d.hasta - d.desde], [1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 330, opacity: sale }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 22px", borderRadius: 999, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.noche, opacity: p, transform: `scale(${0.7 + p * 0.3})`, transformOrigin: "left center" }}>
        <span style={{ fontSize: 34 }}>{d.emoji}</span> Si eres: {d.tipo}
      </div>
      <div style={{ height: 18 }} />
      <Palabras texto={d.nombre} tam={92} fuente={SERIF} peso={800} retraso={10} resaltar={null} color={C.crema} />
      <div style={{ height: 8 }} />
      <Palabras texto={d.frase} tam={40} fuente={SANS} peso={500} retraso={22} resaltar={null} color="rgba(255,244,230,0.8)" />
    </div>
  );
};

const Escena: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ganchoSale = interpolate(frame, [120, 132], [1, 0], clamp);
  const cierre = spring({ frame: frame - 1375, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #1C2752 0%, #0B0E1F 70%)" }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 211) % 1080, top: (i * 389) % 1920, width: 3, height: 3, borderRadius: 2, background: C.crema, opacity: 0.15 + 0.25 * Math.abs(Math.sin(frame / 25 + i)) }} />
      ))}
      <Mapa />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(11,14,31,0.95) 0%, rgba(11,14,31,0.85) 28%, rgba(11,14,31,0) 38%)", opacity: frame < 132 || frame >= 1365 ? 0.4 : 1, pointerEvents: "none" }} />
      {frame < 132 ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 340, opacity: ganchoSale }}>
          <Palabras texto="¿A dónde ir en diciembre?" tam={88} fuente={SERIF} peso={800} retraso={2} resaltar={["diciembre?"]} color={C.crema} />
          <div style={{ height: 18 }} />
          <Palabras texto="Depende del tipo de turista que eres." tam={44} fuente={SANS} peso={500} retraso={65} resaltar={null} color="rgba(255,244,230,0.9)" />
        </div>
      ) : null}
      {DESTINOS.map((d, i) => (
        <Sequence key={d.nombre} from={d.desde} durationInFrames={d.hasta - d.desde}>
          <Rotulo i={i} />
          <Postal i={i} />
        </Sequence>
      ))}
      {frame >= 1365 ? (
        <>
          <div style={{ position: "absolute", left: 80, right: 80, top: 340 }}>
            <Sequence from={1365}>
              <Palabras texto="¿A cuál te vas?" tam={96} fuente={SERIF} peso={800} retraso={4} resaltar={["cuál"]} color={C.crema} />
            </Sequence>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1240, display: "flex", justifyContent: "center", opacity: cierre, transform: `scale(${0.7 + cierre * 0.3})` }}>
            <div style={{ padding: "16px 38px", borderRadius: 999, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, fontFamily: SANS, fontWeight: 600, fontSize: 40, color: C.noche }}>
              Etiqueta a con quién irías 👇
            </div>
          </div>
        </>
      ) : null}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const Diciembre: React.FC = () => (
  <>
    <Reel
      duracion={DURACION_DICIEMBRE}
      fondo={<AbsoluteFill style={{ background: "#0B0E1F" }} />}
      etiqueta={null}
      voz="voz-diciembre.mp3"
      musica="musica-diciembre.mp3"
      volumenMusica={null}
      sonidos={SONIDOS}
      escenas={[{ desde: 0, dur: DURACION_DICIEMBRE, Pieza: Escena }]}
    />
    <Grano />
  </>
);
