import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { Grano } from "./cine";

// Historia de Los Algodones, parte 2: «¿Por qué Molar City está aquí y no en otro pueblo?»
// Estilo nuevo (pedido de Julio, según sus referencias de TikTok): tipografía en movimiento, una pantalla por frase,
// fondos que cambian (blanco con retícula, negro, rojo con humo), palabra clave de color y un objeto animado por idea.
// Voz «Julio» (public/voz-algodones-parte2.mp3, 52.4 s), tiempos por palabra con Whisper.
// Datos: Rodríguez Blanco (2020) pp. 52 y 57; Zermeño Flores y Cuevas Contreras (2020) p. 115; INEGI, DENUE (7 nov 2026).
export const DURACION_PARTE2 = 1574;

const { fontFamily: F } = loadFont("normal", { weights: ["600", "800", "900"], subsets: ["latin", "latin-ext"] });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const m = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const ROJO = "#E8252B";
const AMARILLO = "#FFC93C";

// Fotograma en que la voz dice cada palabra (índice = posición en la transcripción).
const P = [9, 16, 20, 28, 37, 46, 56, 71, 77, 80, 86, 113, 121, 148, 172, 175, 205, 209, 222, 232, 248, 251, 253, 274, 281, 287, 292, 296, 299, 309, 313, 328, 329, 356, 361, 372, 388, 394, 398, 405, 417, 446, 475, 484, 492, 521, 524, 527, 533, 553, 557, 568, 574, 583, 595, 597, 611, 617, 629, 636, 643, 665, 673, 678, 683, 697, 714, 750, 776, 781, 805, 809, 816, 823, 828, 839, 858, 865, 868, 881, 890, 896, 917, 920, 925, 933, 937, 950, 952, 955, 970, 987, 993, 1004, 1008, 1018, 1022, 1034, 1045, 1062, 1067, 1079, 1088, 1100, 1129, 1130, 1138, 1145, 1161, 1163, 1170, 1183, 1208, 1215, 1217, 1220, 1226, 1232, 1235, 1256, 1265, 1270, 1274, 1288, 1306, 1316, 1322, 1324, 1348, 1374, 1394, 1401, 1423, 1432, 1443, 1453, 1474, 1479, 1486, 1487, 1496, 1514, 1517];

type Fondo = "blanco" | "negro" | "rojo";
type Linea = { t: string; a: number; b: number; tam: number };
type Escena = { d: number; fondo: Fondo; lineas: Linea[]; Obj: React.FC<{ d: number }> | null; fuente: string | null; arriba: boolean };

// ---------- Fondos ----------
const FondoEscena: React.FC<{ tipo: Fondo }> = ({ tipo }) => {
  const frame = useCurrentFrame();
  const reticula = (c: string) => ({ backgroundImage: `linear-gradient(${c} 2px, transparent 2px), linear-gradient(90deg, ${c} 2px, transparent 2px)`, backgroundSize: "90px 90px", backgroundPosition: `0 ${(frame * 0.6) % 90}px` });
  if (tipo === "blanco")
    return (
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 45%, #FFFFFF 0%, #F1F1F1 45%, #9C9C9C 100%)" }}>
        <AbsoluteFill style={{ ...reticula("rgba(0,0,0,0.05)"), WebkitMaskImage: "radial-gradient(ellipse 60% 45% at 50% 45%, black 20%, transparent 80%)" }} />
      </AbsoluteFill>
    );
  if (tipo === "negro")
    return (
      <AbsoluteFill style={{ background: "#070707" }}>
        <AbsoluteFill style={{ ...reticula("rgba(255,255,255,0.06)"), WebkitMaskImage: "radial-gradient(ellipse 55% 40% at 50% 45%, black 10%, transparent 85%)" }} />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 45%, rgba(232,37,43,0.10), transparent 70%)" }} />
      </AbsoluteFill>
    );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 60% at 50% 45%, #8E0F13 0%, #4A0507 55%, #160102 100%)", overflow: "hidden" }}>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 540 + Math.sin(frame / 40 + i * 1.7) * 380 - 420, top: 300 + i * 380 + Math.cos(frame / 33 + i) * 120, width: 840, height: 300, borderRadius: "50%", background: "rgba(255,60,60,0.22)", filter: "blur(70px)", transform: `rotate(${frame * 0.3 + i * 40}deg)` }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Texto grande, palabra por palabra (máscara), *clave* de color ----------
const Texto: React.FC<{ l: Linea; fondo: Fondo }> = ({ l, fondo }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palabras = l.t.split(" ");
  const base = fondo === "blanco" ? "#111111" : "#FFFFFF";
  const clave = fondo === "rojo" ? AMARILLO : ROJO;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${l.tam * 0.24}px` }}>
      {palabras.map((p, k) => {
        const t0 = P[l.a] + Math.round(((P[l.b] - P[l.a]) * k) / Math.max(1, palabras.length));
        const e = spring({ frame: frame - t0 + 2, fps, config: { damping: 15, mass: 0.7 } });
        const esClave = p.startsWith("*");
        const txt = p.replace(/\*/g, "");
        return (
          <span key={k} style={{ display: "inline-block", overflow: "hidden", paddingBottom: l.tam * 0.14, marginBottom: -l.tam * 0.14 }}>
            <span style={{ display: "inline-block", fontFamily: F, fontWeight: 900, fontSize: esClave ? l.tam * 1.12 : l.tam, letterSpacing: -l.tam * 0.03, lineHeight: 1.08, color: esClave ? clave : base, transform: `translateY(${(1 - e) * 110}%) scale(${esClave ? 0.9 + e * 0.1 : 1})`, textShadow: esClave ? `0 0 ${l.tam * 0.35}px ${fondo === "rojo" ? "rgba(255,201,60,0.55)" : "rgba(232,37,43,0.45)"}` : fondo === "blanco" ? "none" : "0 6px 24px rgba(0,0,0,0.5)" }}>
              {txt}
            </span>
          </span>
        );
      })}
    </div>
  );
};

// ---------- Objetos animados ----------
const Emoji: React.FC<{ e: string; tam: number; desde: number; x: number; y: number }> = ({ e, tam, desde, x, y }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, config: { damping: 11 } });
  const flota = Math.sin((frame - desde) / 14) * 8;
  return <div style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2 + flota, width: tam, height: tam, fontSize: tam * 0.85, lineHeight: `${tam}px`, textAlign: "center", transform: `scale(${s}) rotate(${(1 - s) * -25}deg)`, filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.35))" }}>{e}</div>;
};

const Numero: React.FC<{ n: string; desde: number; color: string }> = ({ n, desde, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, config: { damping: 10, mass: 0.8 } });
  return <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 520, lineHeight: 1, color, transform: `scale(${s})`, textShadow: `0 0 80px ${color}66` }}>{n}</div>;
};

const Pregunta: React.FC<{ d: number }> = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {[...Array(5)].map((_, i) => {
        const brilla = i === 2;
        const x = 160 + i * 190;
        const s = spring({ frame: frame - (P[7] + i * 3), fps: 30, config: { damping: 12 } });
        return (
          <div key={i} style={{ position: "absolute", left: x - 50, top: 1130 - (brilla ? 40 : 0), width: 100, height: 140, transform: `scale(${s * (brilla ? 1.3 : 0.9)})`, opacity: brilla ? 1 : 0.35 }}>
            <svg width={100} height={140} viewBox="0 0 24 34"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill={brilla ? ROJO : "#888"} /><circle cx={12} cy={12} r={5} fill="#fff" /></svg>
          </div>
        );
      })}
      <Emoji e="🦷" tam={220} desde={P[2]} x={540} y={1000} />
    </>
  );
};

const Frontera: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const linea = m(frame, d + 4, d + 30);
  const pin = spring({ frame: frame - P[19], fps: 30, config: { damping: 9 } });
  return (
    <>
      <div style={{ position: "absolute", left: 60, top: 1060, width: 960 * linea, borderTop: `8px dashed ${ROJO}` }} />
      <div style={{ position: "absolute", left: 90, top: 960, fontFamily: F, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "rgba(255,255,255,0.55)", opacity: linea }}>EE. UU. 🇺🇸</div>
      <div style={{ position: "absolute", left: 90, top: 1110, fontFamily: F, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "rgba(255,255,255,0.85)", opacity: linea }}>MÉXICO 🇲🇽</div>
      <div style={{ position: "absolute", left: 640, top: 1060 - 130 * pin, transform: `scale(${pin})`, transformOrigin: "50% 100%" }}>
        <svg width={110} height={150} viewBox="0 0 24 34"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 22 12 22s12-13 12-22C24 5.4 18.6 0 12 0z" fill="#fff" /><circle cx={12} cy={12} r={5} fill={ROJO} /></svg>
      </div>
      <div style={{ position: "absolute", left: 560, top: 1240, fontFamily: F, fontWeight: 800, fontSize: 34, color: "#fff", opacity: m(frame, P[17], P[17] + 10) }}>Los Algodones</div>
    </>
  );
};

const Garita: React.FC<{ d: number }> = () => {
  const frame = useCurrentFrame();
  const sube = m(frame, P[28] + 6, P[28] + 26);
  return (
    <>
      <div style={{ position: "absolute", left: 250, top: 1100, width: 70, height: 300, borderRadius: 14, background: "linear-gradient(90deg, #DDD, #FFF, #BBB)" }} />
      <div style={{ position: "absolute", left: 285, top: 1120, width: 560, height: 46, borderRadius: 23, transformOrigin: "0 50%", transform: `rotate(${-sube * 45}deg)`, background: `repeating-linear-gradient(90deg, ${AMARILLO} 0 70px, #fff 70px 140px)`, boxShadow: "0 10px 30px rgba(0,0,0,0.4)" }} />
      <Emoji e="🛂" tam={170} desde={P[28]} x={800} y={1300} />
    </>
  );
};

const Yuma: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const avance = m(frame, P[34], P[40] + 10);
  const min = Math.round(interpolate(frame, [P[34], P[40] + 10], [0, 10], clamp));
  return (
    <>
      <div style={{ position: "absolute", left: 120, top: 1150, width: 840, height: 16, borderRadius: 8, background: "#222" }} />
      <div style={{ position: "absolute", left: 120, top: 1156, width: 840, borderTop: "4px dashed #fff", opacity: 0.9 }} />
      <div style={{ position: "absolute", left: 80, top: 1190, fontFamily: F, fontWeight: 800, fontSize: 30, color: "#111" }}>Algodones 🇲🇽</div>
      <div style={{ position: "absolute", right: 80, top: 1190, fontFamily: F, fontWeight: 800, fontSize: 30, color: "#111" }}>Yuma 🇺🇸</div>
      <div style={{ position: "absolute", left: 100 + avance * 760, top: 1060, fontSize: 110, transform: "scaleX(-1)" }}>🚗</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 90, color: ROJO, opacity: m(frame, d, d + 8) }}>⏱️ {min} min</div>
    </>
  );
};

const Dentista: React.FC<{ d: number }> = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 200, color: ROJO, transform: `rotate(-6deg) scale(${spring({ frame: frame - P[47], fps: 30, config: { damping: 9 } })})`, textShadow: "0 0 60px rgba(232,37,43,0.35)" }}>1970s</div>
      <Emoji e="🦷" tam={190} desde={P[50]} x={250} y={1150} />
      <Emoji e="📣" tam={170} desde={P[55]} x={470} y={1150} />
      {[0, 1, 2].map((i) => {
        const t = ((frame - P[55] - i * 8) % 30) / 30;
        return frame > P[55] ? <div key={i} style={{ position: "absolute", left: 560 + t * 220, top: 1150 - 60 - t * 30, width: 40 + t * 40, height: 120 + t * 60, borderRight: `8px solid ${ROJO}`, borderRadius: "50%", opacity: 1 - t }} /> : null;
      })}
      <Emoji e="🇺🇸" tam={180} desde={P[59]} x={880} y={1150} />
    </>
  );
};

const Explota: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const t = m(frame, P[64], P[66] + 10);
  const pts = Array.from({ length: 30 }, (_, i) => { const x = i / 29; return [120 + x * 840, 1350 - Math.pow(x, 3.2) * 520] as const; });
  const n = Math.max(2, Math.round(t * 30));
  const path = pts.slice(0, n).map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ");
  const [xe, ye] = pts[n - 1];
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        <path d={path} stroke={AMARILLO} strokeWidth={14} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 100, top: 1370, fontFamily: F, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.75)", opacity: m(frame, d, d + 10) }}>1980</div>
      <div style={{ position: "absolute", left: xe - 80, top: ye - 80, fontSize: 160, transform: `scale(${m(frame, P[66], P[66] + 8)})` }}>💥</div>
    </>
  );
};

const Termometros: React.FC<{ d: number }> = () => {
  const frame = useCurrentFrame();
  const calor = m(frame, P[74], P[74] + 18);
  const frio = m(frame, P[81] - 4, P[81] + 14);
  const Tubo: React.FC<{ x: number; nivel: number; color: string; e: string; t: string; desde: number }> = ({ x, nivel, color, e, t, desde }) => (
    <div style={{ position: "absolute", left: x, top: 920, width: 360, height: 470, borderRadius: 40, background: "#fff", boxShadow: "0 30px 60px rgba(0,0,0,0.18)", opacity: m(frame, desde - 6, desde + 4) }}>
      <div style={{ position: "absolute", left: 40, top: 60, width: 60, height: 300, borderRadius: 30, background: "#EEE", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${nivel * 100}%`, background: color }} />
      </div>
      <div style={{ position: "absolute", left: 30, top: 340, width: 80, height: 80, borderRadius: 40, background: color }} />
      <div style={{ position: "absolute", left: 140, top: 70, fontSize: 110 }}>{e}</div>
      <div style={{ position: "absolute", left: 130, top: 250, fontFamily: F, fontWeight: 900, fontSize: 60, color }}>{t}</div>
    </div>
  );
  return (
    <>
      <Tubo x={130} nivel={0.25 + calor * 0.7} color={ROJO} e="☀️" t="35–40°" desde={P[71]} />
      <Tubo x={590} nivel={0.85 - frio * 0.55} color="#2E86FF" e="❄️" t="<20°" desde={P[78]} />
    </>
  );
};

const Pajaros: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 9 }).map((_, i) => {
        const t = (frame - d - i * 4) / 90;
        const x = -150 + t * 1350 + (i % 3) * 60;
        const y = 1050 + Math.floor(i / 3) * 90 + Math.sin(t * 8 + i) * 18 - (i % 3) * 40;
        return <div key={i} style={{ position: "absolute", left: x, top: y, fontSize: 90, transform: "scaleX(-1)" }}>🐦</div>;
      })}
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: (i * 131) % 1080, top: 900 + ((frame * 2 + i * 97) % 600), fontSize: 30, opacity: 0.7 }}>❄️</div>
      ))}
    </>
  );
};

const MapaNorte: React.FC<{ d: number }> = () => {
  const frame = useCurrentFrame();
  const Origen: React.FC<{ x: number; y: number; t: string; i: number }> = ({ x, y, t, i }) => {
    const a = m(frame, P[i], P[i] + 30);
    const fin = { x: 640, y: 1380 };
    const cx = (x + fin.x) / 2 - 200;
    const cy = (y + fin.y) / 2;
    const len = 1400;
    return (
      <>
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
          <path d={`M${x},${y} Q${cx},${cy} ${fin.x},${fin.y}`} stroke={ROJO} strokeWidth={8} fill="none" strokeDasharray={len} strokeDashoffset={len * (1 - a)} strokeLinecap="round" />
        </svg>
        <div style={{ position: "absolute", left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: "#fff", opacity: m(frame, P[i] - 6, P[i]) }} />
        <div style={{ position: "absolute", left: x + 26, top: y - 26, fontFamily: F, fontWeight: 800, fontSize: 36, color: "#fff", opacity: m(frame, P[i] - 6, P[i]) }}>{t}</div>
      </>
    );
  };
  return (
    <>
      <Origen x={170} y={760} t="Alaska" i={100} />
      <Origen x={330} y={980} t="Columbia Británica" i={102} />
      <div style={{ position: "absolute", left: 610, top: 1350, width: 60, height: 60, borderRadius: 30, background: ROJO, boxShadow: "0 0 40px rgba(232,37,43,0.9)" }} />
      <div style={{ position: "absolute", left: 690, top: 1350, fontFamily: F, fontWeight: 800, fontSize: 36, color: "#fff" }}>Los Algodones</div>
    </>
  );
};

const MANZ = [60, 31, 30, 27, 25];
const Manzanas: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const top5 = [7, 8, 12, 2, 13];
  const suma = Math.round(interpolate(frame, [P[122], P[123] + 20], [0, 173], clamp));
  return (
    <>
      {Array.from({ length: 25 }).map((_, i) => {
        const k = top5.indexOf(i);
        const luz = k >= 0 ? m(frame, P[118] + k * 6, P[118] + k * 6 + 8) : 0;
        const e = spring({ frame: frame - (d + i), fps: 30, config: { damping: 14 } });
        return (
          <div key={i} style={{ position: "absolute", left: 190 + (i % 5) * 145, top: 760 + Math.floor(i / 5) * 105, width: 125, height: 88, borderRadius: 14, background: luz > 0.5 ? ROJO : "rgba(255,255,255,0.12)", transform: `scale(${e})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F, fontWeight: 900, fontSize: 40, color: "#fff", boxShadow: luz > 0.5 ? "0 0 30px rgba(232,37,43,0.7)" : "none" }}>
            {luz > 0.5 ? MANZ[k] : ""}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1310, textAlign: "center", fontFamily: F, fontWeight: 900, fontSize: 70, color: "#fff", opacity: m(frame, P[122], P[122] + 8) }}>
        <span style={{ color: ROJO }}>{suma}</span> de 311 🦷
      </div>
    </>
  );
};

const Cuadras: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [d, d + 80], [0.6, 1.25], clamp);
  return (
    <div style={{ position: "absolute", left: 540, top: 1080, transform: `translate(-50%, -50%) scale(${zoom})` }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 110px)", gap: 22 }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} style={{ height: 80, borderRadius: 12, background: [7, 8, 13].includes(i) ? ROJO : "#D9D9D9", boxShadow: "0 8px 18px rgba(0,0,0,0.12)" }} />
        ))}
      </div>
    </div>
  );
};

const Resumen: React.FC<{ d: number }> = () => {
  const frame = useCurrentFrame();
  const items: [string, string, number][] = [["📍", "Ubicación", 128], ["💡", "Iniciativa", 129], ["🌡️", "Clima", 131]];
  return (
    <>
      {items.map(([e, t, i], k) => {
        const s = spring({ frame: frame - P[i] + 2, fps: 30, config: { damping: 11 } });
        return (
          <div key={k} style={{ position: "absolute", left: 140, top: 900 + k * 150, width: 800, height: 120, borderRadius: 60, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 30, padding: "0 40px", boxSizing: "border-box", transform: `translateX(${(1 - s) * 900}px)` }}>
            <span style={{ fontSize: 70 }}>{e}</span>
            <span style={{ fontFamily: F, fontWeight: 900, fontSize: 60, color: "#fff" }}>{t}</span>
          </div>
        );
      })}
    </>
  );
};

const Sello: React.FC<{ d: number }> = ({ d }) => {
  const frame = useCurrentFrame();
  const s = spring({ frame: frame - (P[134] - 2), fps: 30, config: { damping: 8 } });
  return (
    <>
      <div style={{ position: "absolute", left: 540 - 230, top: 980, width: 460, height: 460, borderRadius: 230, border: `14px solid ${ROJO}`, transform: `rotate(-10deg) scale(${1.6 - s * 0.6})`, opacity: Math.min(1, s * 1.4), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 0 60px rgba(232,37,43,0.5)" }}>
        <div style={{ fontSize: 140 }}>🦷</div>
        <div style={{ fontFamily: F, fontWeight: 900, fontSize: 52, color: ROJO, letterSpacing: 1 }}>MOLAR CITY</div>
      </div>
      <Emoji e="✨" tam={120} desde={d + 20} x={830} y={980} />
    </>
  );
};

const Cierre: React.FC<{ d: number }> = ({ d }) => (
  <>
    <Emoji e="💬" tam={260} desde={d + 4} x={540} y={1110} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 34, color: "#333" }}>@julio.chaidez1</div>
  </>
);

const Uno: React.FC<{ d: number }> = ({ d }) => (<><Numero n="1" desde={d} color={ROJO} /><Emoji e="📍" tam={180} desde={P[15]} x={540} y={1350} /></>);
const Dos: React.FC<{ d: number }> = ({ d }) => (<><Numero n="2" desde={d} color={ROJO} /><Emoji e="💡" tam={180} desde={P[44]} x={540} y={1350} /></>);
const TresC: React.FC<{ d: number }> = ({ d }) => (<><Numero n="3" desde={d} color={ROJO} /><Emoji e="🌡️" tam={180} desde={P[69]} x={540} y={1350} /></>);
const Tres: React.FC<{ d: number }> = ({ d }) => <Numero n="3" desde={d} color={AMARILLO} />;

// ---------- Guion visual: una escena por frase ----------
const ESCENAS: Escena[] = [
  { d: 0, fondo: "negro", lineas: [{ t: "¿Por qué *Molar *City está aquí…", a: 0, b: 5, tam: 92 }, { t: "y no en otro *pueblo?", a: 6, b: 10, tam: 76 }], Obj: Pregunta, fuente: null, arriba: true },
  { d: 106, fondo: "rojo", lineas: [{ t: "*razones", a: 12, b: 12, tam: 120 }], Obj: Tres, fuente: null, arriba: false },
  { d: 142, fondo: "blanco", lineas: [{ t: "Primera: la *ubicación", a: 13, b: 15, tam: 96 }], Obj: Uno, fuente: null, arriba: false },
  { d: 200, fondo: "negro", lineas: [{ t: "Pegado a la *frontera", a: 16, b: 22, tam: 100 }], Obj: Frontera, fuente: null, arriba: true },
  { d: 268, fondo: "rojo", lineas: [{ t: "Junto a la garita de *Andrade, California", a: 23, b: 32, tam: 84 }], Obj: Garita, fuente: null, arriba: true },
  { d: 350, fondo: "blanco", lineas: [{ t: "*Yuma, Arizona, a solo 10 minutos", a: 34, b: 40, tam: 88 }], Obj: Yuma, fuente: "Fuente: Zermeño Flores y Cuevas Contreras (2020)", arriba: true },
  { d: 440, fondo: "negro", lineas: [{ t: "Segunda: alguien se *atrevió", a: 41, b: 44, tam: 96 }], Obj: Dos, fuente: null, arriba: false },
  { d: 515, fondo: "blanco", lineas: [{ t: "Un *dentista se anunció en *EE. UU.", a: 49, b: 59, tam: 86 }], Obj: Dentista, fuente: "Fuente: Rodríguez Blanco (2020), UNAM", arriba: true },
  { d: 660, fondo: "rojo", lineas: [{ t: "Desde los 80… *explotó", a: 62, b: 66, tam: 100 }], Obj: Explota, fuente: "Fuente: Rodríguez Blanco (2020), UNAM", arriba: true },
  { d: 744, fondo: "negro", lineas: [{ t: "Tercera: el *clima", a: 67, b: 69, tam: 100 }], Obj: TresC, fuente: null, arriba: false },
  { d: 800, fondo: "blanco", lineas: [{ t: "Verano *ardiente, invierno *templado", a: 70, b: 81, tam: 84 }], Obj: Termometros, fuente: "Fuente: Rodríguez Blanco (2020), UNAM", arriba: true },
  { d: 912, fondo: "rojo", lineas: [{ t: "Llegan los *pájaros de la *nieve", a: 82, b: 89, tam: 92 }], Obj: Pajaros, fuente: null, arriba: true },
  { d: 1012, fondo: "negro", lineas: [{ t: "Escapan del frío desde *Alaska y *Canadá", a: 90, b: 103, tam: 80 }], Obj: MapaNorte, fuente: "Fuente: Zermeño Flores y Cuevas Contreras (2020)", arriba: true },
  { d: 1124, fondo: "blanco", lineas: [{ t: "Todo en unas cuantas *cuadras", a: 104, b: 111, tam: 92 }], Obj: Cuadras, fuente: null, arriba: true },
  { d: 1203, fondo: "negro", lineas: [{ t: "Más de la *mitad, en solo *5 manzanas", a: 112, b: 123, tam: 84 }], Obj: Manzanas, fuente: "Fuente: INEGI, DENUE (7 nov 2026)", arriba: true },
  { d: 1342, fondo: "rojo", lineas: [{ t: "*La *fórmula", a: 128, b: 128, tam: 110 }], Obj: Resumen, fuente: null, arriba: true },
  { d: 1418, fondo: "negro", lineas: [{ t: "Así nació *Molar *City", a: 132, b: 135, tam: 104 }], Obj: Sello, fuente: null, arriba: true },
  { d: 1468, fondo: "blanco", lineas: [{ t: "¿Cuál crees que *pesa más?", a: 136, b: 140, tam: 96 }, { t: "Te *leo", a: 141, b: 142, tam: 80 }], Obj: Cierre, fuente: null, arriba: true },
];

const EscenaVista: React.FC<{ e: Escena; fin: number }> = ({ e, fin }) => {
  const frame = useCurrentFrame();
  const entra = interpolate(frame, [e.d, e.d + 7], [1, 0], clamp);
  const camara = interpolate(frame, [e.d, fin], [1, 1.06], clamp);
  const Obj = e.Obj;
  return (
    <AbsoluteFill>
      <FondoEscena tipo={e.fondo} />
      <AbsoluteFill style={{ transform: `scale(${camara + entra * 0.14})`, filter: `blur(${entra * 12}px)` }}>
        {Obj ? <Obj d={e.d} /> : null}
        <div style={{ position: "absolute", left: 60, right: 60, top: e.arriba ? 380 : 1000, display: "flex", flexDirection: "column", gap: 10 }}>
          {e.lineas.map((l, k) => <Texto key={k} l={l} fondo={e.fondo} />)}
        </div>
      </AbsoluteFill>
      {e.fuente ? (
        <div style={{ position: "absolute", left: 80, right: 80, top: 1420, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 22, color: e.fondo === "blanco" ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.6)", opacity: m(frame, e.d + 8, e.d + 18) }}>{e.fuente}</div>
      ) : null}
      {/* destello del corte */}
      <AbsoluteFill style={{ background: e.fondo === "negro" ? "#fff" : e.fondo === "rojo" ? "#FFDDDD" : "#000", opacity: interpolate(frame, [e.d, e.d + 4], [0.35, 0], clamp), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

export const AlgodonesParte2: React.FC = () => {
  const frame = useCurrentFrame();
  const i = ESCENAS.findIndex((e, k) => frame >= e.d && (k === ESCENAS.length - 1 || frame < ESCENAS[k + 1].d));
  const e = ESCENAS[Math.max(0, i)];
  const fin = i < ESCENAS.length - 1 ? ESCENAS[i + 1].d : DURACION_PARTE2;
  const claro = e.fondo === "blanco";
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <EscenaVista e={e} fin={fin} />
      {/* barra de progreso y firma */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 270, height: 6, borderRadius: 3, background: claro ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.18)" }}>
        <div style={{ width: `${(frame / DURACION_PARTE2) * 100}%`, height: "100%", borderRadius: 3, background: ROJO }} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 288, fontFamily: F, fontWeight: 600, fontSize: 24, color: claro ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.6)" }}>@julio.chaidez1 · Los Algodones, parte 2</div>
      <Audio src={staticFile("voz-algodones-parte2.mp3")} />
      <Audio src={staticFile("musica-turistificacion.mp3")} volume={(f) => 0.13 * interpolate(f, [0, 15, DURACION_PARTE2 - 40, DURACION_PARTE2], [0, 1, 1, 0], clamp)} />
      {ESCENAS.map((s, k) => (
        <Sequence key={k} from={s.d} durationInFrames={40}>
          <Audio src={staticFile(`sfx/${k % 2 ? "whoosh" : "pop"}.wav`)} volume={k % 2 ? 0.3 : 0.28} />
        </Sequence>
      ))}
      {[[P[47], "golpe"], [P[66], "golpe"], [P[74], "ding"], [P[122], "pop"], [P[134], "golpe"], [P[118], "brillo"]].map(([d, s], k) => (
        <Sequence key={`x${k}`} from={d as number} durationInFrames={40}>
          <Audio src={staticFile(`sfx/${s}.wav`)} volume={0.3} />
        </Sequence>
      ))}
      <Grano />
    </AbsoluteFill>
  );
};
