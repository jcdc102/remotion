import { AbsoluteFill, Audio, Freeze, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio } from "../doctor-auto/pro";
import { Escena } from "./Escenas";

// Meme: "Yo cuando arreglo mi auto y le sale otra falla" (TikTok @patyperez650, marcas de agua
// intactas). Se tapa el texto original (decía "carro") con el nuestro. Groserías tapadas con claxon.
const FIN_CLIP = 14.3;
const T_OUTRO = 16.4;
const DUR = 20.8;
export const DURACION_FALLA = Math.round(DUR * 30);
const CLAXON: [number, number][] = [
  [1.2, 1.78],
  [8.7, 9.16],
  [10.46, 11.1],
];

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 11, stiffness = 240) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

// Testigos del tablero que se van prendiendo.
const AMBAR = "#ffb020";
const TESTIGOS: { t: number; color: string; icono: React.ReactNode }[] = [
  { t: 0.35, color: AMBAR, icono: <path d="M8 22 h6 l4-5 h14 l4 4 h6 v14 h-6 l-4 4 h-18 l-6-6 h-6 Z M2 24 v10 M50 24 v10" stroke="currentColor" strokeWidth={4} fill="none" strokeLinejoin="round" /> },
  { t: 2.08, color: "#ff3b3b", icono: <g stroke="currentColor" strokeWidth={4} fill="none"><rect x={6} y={16} width={44} height={26} rx={4} /><path d="M14 16 v-5 h8 v5 M34 16 v-5 h8 v5 M14 29 h8 M36 29 h8 M40 25 v8" /></g> },
  { t: 2.45, color: "#ff3b3b", icono: <g stroke="currentColor" strokeWidth={4} fill="none" strokeLinejoin="round"><path d="M6 24 h10 l6 6 h20 l10-8 v12 l-10 6 h-30 Z M16 24 v-6 h8" /><path d="M50 38 q2 4 0 6" /></g> },
  { t: 13.6, color: "#ff3b3b", icono: <g stroke="currentColor" strokeWidth={4} fill="none"><path d="M28 6 v26" /><circle cx={28} cy={38} r={7} /><path d="M32 12 h8 M32 20 h8 M32 28 h6 M10 46 q6 -4 12 0 q6 4 12 0 q6 -4 12 0" /></g> },
  { t: 14.04, color: AMBAR, icono: <g><circle cx={28} cy={28} r={18} stroke="currentColor" strokeWidth={4} fill="none" /><text x={28} y={35} textAnchor="middle" fontFamily={ANTON} fontSize={18} fill="currentColor">ABS</text></g> },
];

export const OtraFalla: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fFin = Math.round(FIN_CLIP * fps);
  const fO = Math.round(T_OUTRO * fps);
  const golpe = [0.35, 2.08, 4.54, 10.46, 13.6].reduce((a, g) => a + (t >= g ? 0.06 * Math.max(0, 1 - (t - g) / 0.3) : 0), 0);
  const tiembla = CLAXON.some(([a, b]) => t >= a && t < b) ? Math.sin(t * 90) * 8 : 0;
  const huevos = Math.min(10, Math.max(0, Math.floor((t - 4.54) / 0.12) + 1));
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {t < T_OUTRO ? (
        <AbsoluteFill style={{ transform: `scale(${1 + golpe}) translateX(${tiembla}px)` }}>
          <Sequence durationInFrames={fFin}>
            <OffthreadVideo
              src={staticFile("refs2/falla.mp4")}
              volume={(f) => (CLAXON.some(([a, b]) => f / fps >= a - 0.02 && f / fps < b + 0.02) ? 0 : 1)}
              style={{ width: "100%", height: "100%" }}
            />
          </Sequence>
          <Sequence from={fFin}>
            <Freeze frame={0}>
              <OffthreadVideo src={staticFile("refs2/falla.mp4")} muted startFrom={fFin - 3} style={{ width: "100%", height: "100%", filter: "brightness(0.45) saturate(0.6)" }} />
            </Freeze>
          </Sequence>
        </AbsoluteFill>
      ) : null}

      {/* nuestro texto encima del original (que decía "carro") */}
      {t < T_OUTRO ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 285 }}>
          <div style={{ width: 1000, minHeight: 470, background: "#fff", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 40px", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
            <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 82, color: "#111", textAlign: "center", lineHeight: 1.12 }}>
              Yo cuando arreglo mi auto y le sale <span style={{ color: "#fff", background: ROJO_DA, padding: "0 14px", borderRadius: 12, display: "inline-block", transform: `scale(${1 + 0.15 * Math.max(0, 1 - (t % 2.3) / 0.25)})` }}>OTRA</span> falla 😩
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* tablero de testigos */}
      {t < FIN_CLIP ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1440 }}>
          <div style={{ display: "flex", gap: 18, background: "rgba(8,9,12,0.85)", borderRadius: 26, padding: "16px 24px", border: "2px solid rgba(255,255,255,0.12)", opacity: resorte(frame, fps, 0.2, 14, 200) }}>
            {TESTIGOS.map((x, i) => {
              const e = resorte(frame, fps, x.t, 8, 280);
              const on = t >= x.t;
              const parpadeo = on ? 0.65 + 0.35 * Math.abs(Math.sin(t * 6 + i)) : 0.15;
              return (
                <div key={i} style={{ width: 104, height: 104, borderRadius: 20, background: on ? "rgba(255,255,255,0.06)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on ? 0.7 + 0.3 * e + 0.25 * e * (1 - e) : 0.8})`, color: x.color, opacity: parpadeo, filter: on ? `drop-shadow(0 0 12px ${x.color})` : "none" }}>
                  <svg width={78} height={78} viewBox="0 0 56 56">{x.icono}</svg>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 10 huevos */}
      {t >= 4.54 && t < 7.0 ? (
        <AbsoluteFill>
          {Array.from({ length: huevos }).map((_, k) => {
            const l = t - (4.54 + k * 0.12);
            const x = 120 + random(`hx${k}`) * 840;
            const y = Math.min(1250 + random(`hy${k}`) * 120, -150 + l * l * 2600);
            return (
              <div key={k} style={{ position: "absolute", left: x, top: y, transform: `rotate(${random(`hr${k}`) * 60 - 30}deg)` }}>
                <svg width={90} height={116} viewBox="0 0 90 116">
                  <ellipse cx={45} cy={62} rx={40} ry={52} fill="#fff4dc" stroke="#d9c39a" strokeWidth={4} />
                  <ellipse cx={32} cy={42} rx={10} ry={16} fill="#fff" opacity={0.8} />
                </svg>
              </div>
            );
          })}
          <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-end", padding: "800px 50px 0 0" }}>
            <div style={{ fontFamily: ANTON, fontSize: 120, color: "#fff", textShadow: "0 6px 0 #000, 0 0 30px rgba(0,0,0,0.6)", transform: `scale(${resorte(frame, fps, 4.6)})` }}>🥚 x{huevos}</div>
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 300 }}>
            <div style={{ transform: `scale(${interpolate(resorte(frame, fps, 5.1, 9, 260), [0, 1], [2.4, 1])}) rotate(-8deg)`, opacity: lim(resorte(frame, fps, 5.1) * 3), border: "10px solid #ffd54a", borderRadius: 22, padding: "8px 30px 16px", fontFamily: ANTON, fontSize: 86, color: "#ffd54a", background: "rgba(0,0,0,0.55)", textAlign: "center", lineHeight: 1.05 }}>
              LIMPIA PARA
              <br />
              EL AUTO ✨
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}

      {/* ojo turco */}
      {t >= 7.0 && t < 11.8 ? (
        <AbsoluteFill>
          <div style={{ position: "absolute", left: 790, top: 760, transformOrigin: "50% 0%", transform: `rotate(${Math.sin(t * 3.2) * 18}deg) scale(${resorte(frame, fps, 7.0)})` }}>
            <div style={{ width: 6, height: 120, background: "#d9d9d9", margin: "0 auto" }} />
            <svg width={170} height={170} viewBox="0 0 100 100" style={{ display: "block", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>
              <circle cx={50} cy={50} r={48} fill="#1d4fd8" />
              <circle cx={50} cy={50} r={33} fill="#fff" />
              <circle cx={50} cy={50} r={21} fill="#6ec6ff" />
              <circle cx={50} cy={50} r={11} fill="#0b0b0b" />
              <circle cx={44} cy={44} r={4} fill="#fff" />
            </svg>
          </div>
          <ChipVidrio t={t} t0={7.3} t1={11.8} texto="¿Le echaron el ojo a tu auto? 🧿" x={150} y={1290} tamano={42} />
        </AbsoluteFill>
      ) : null}

      {/* congelado */}
      {t >= FIN_CLIP && t < T_OUTRO ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 960 }}>
            <TituloMascara texto="Ni limpia, ni huevos… 🥚🚫" resaltar={["huevos…"]} t={t} t0={FIN_CLIP + 0.05} t1={99} tamano={100} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* cierre */}
      <Sequence from={fO}>
        <Escena nombre="lista" l={t - T_OUTRO} d={DUR - T_OUTRO} t={t} />
        <AbsoluteFill style={{ background: "rgba(0,0,0,0.25)" }} />
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 230 }}>
          <div style={{ width: 980 }}>
            <TituloMascara texto="El Doctor encuentra TODAS las fallas" resaltar={["TODAS"]} t={t} t0={T_OUTRO + 0.1} t1={99} tamano={84} />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 420 }}>
          <div style={{ width: 960, opacity: t >= T_OUTRO + 1.4 ? 1 : 0 }}>
            <TituloMascara texto="…de una vez, no una por una 🔧" resaltar={["vez,"]} t={t} t0={T_OUTRO + 1.45} t1={99} tamano={76} />
          </div>
        </AbsoluteFill>
        <ChipVidrio t={t} t0={T_OUTRO + 2.2} t1={99} texto="Diagnóstico completo en CDMX 🔍" x={170} y={1580} tamano={40} />
      </Sequence>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, background: t < FIN_CLIP ? "rgba(0,0,0,0.45)" : "transparent", padding: "6px 16px", borderRadius: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: ROJO_DA, boxShadow: "0 0 16px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 28, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>
      <AcabadoPremium frame={frame} calidez={0.4} />

      {CLAXON.map(([a], i) => (
        <Sequence key={`c${i}`} from={Math.round(a * fps)} durationInFrames={20}>
          <Audio src={staticFile("refs2/claxon.wav")} volume={0.55} />
        </Sequence>
      ))}
      {(
        [
          ...TESTIGOS.map((x): [number, string, number] => [x.t, "sfx/mk-error.wav", 0.35]),
          ...Array.from({ length: 10 }).map((_, k): [number, string, number] => [4.54 + k * 0.12, "sfx/mk-pop.wav", 0.25]),
          [5.1, "sfx/mk-hit.wav", 0.45],
          [7.0, "sfx/memes/boing.mp3", 0.25],
          [FIN_CLIP, "sfx/memes/scratch.mp3", 0.5],
          [T_OUTRO, "sfx/kit/shutter.mp3", 0.4],
          [T_OUTRO + 1.45, "sfx/kit/magic.mp3", 0.5],
        ] as [number, string, number][]
      ).map(([s, src, v], i) => (
        <Sequence key={i} from={Math.round(s * fps)} durationInFrames={60}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Sequence from={fO - 10}>
        <Audio src={staticFile("musica.mp3")} volume={(f) => 0.22 * interpolate(f / fps, [0, 0.4, DUR - T_OUTRO - 0.4, DUR - T_OUTRO + 0.3], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
    </AbsoluteFill>
  );
};
