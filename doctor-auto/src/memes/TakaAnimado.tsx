import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, Audio, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio } from "../doctor-auto/pro";

// "Taka taka" 100% animado con estética de motion design: líneas que se dibujan,
// luces suaves, profundidad, tipografía cinética y barras que reaccionan al audio.
const AUDIO = "sfx/memes/taka-taka.wav";
const DUR_AUDIO = 7.65;
const DUR_REMATE = 3.0;
export const DURACION_TAKA_ANIMADO = Math.round((DUR_AUDIO + DUR_REMATE) * 30);
const TAKAS = [1.92, 2.42, 2.74, 3.3, 3.54, 3.78, 4.1];
const VAUS = [5.0, 6.1];

const lim = (x: number) => Math.max(0, Math.min(1, x));
const suave = (x: number) => (x < 0.5 ? 4 * x ** 3 : 1 - (-2 * x + 2) ** 3 / 2);
const golpe = (t: number, t0: number, k = 7) => (t >= t0 ? Math.exp(-(t - t0) * k) : 0);
const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 200) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const CARRO =
  "M70,300 L95,252 Q125,218 205,206 L335,196 Q405,142 475,122 Q565,102 655,114 Q725,124 795,182 L905,202 Q955,212 963,252 L967,294 Q963,305 943,305 L842,305 A72,72 0 0 0 698,305 L332,305 A72,72 0 0 0 188,305 L88,305 Q70,305 70,300 Z";
const VENTANA = "M365,196 Q425,152 485,137 L645,132 Q705,142 765,186 Z";

// Fondo de estudio: degradado profundo, piso con rejilla en perspectiva y destellos.
const Fondo: React.FC<{ t: number; alerta: number }> = ({ t, alerta }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 38%, rgba(${40 + alerta * 150},${46 - alerta * 20},${62 - alerta * 30},1) 0%, #07080c 70%)` }} />
    <AbsoluteFill style={{ perspective: 900, perspectiveOrigin: "50% 40%" }}>
      <div
        style={{
          position: "absolute",
          left: -800,
          right: -800,
          top: 1180,
          height: 1600,
          transform: "rotateX(72deg)",
          transformOrigin: "50% 0%",
          backgroundImage: `linear-gradient(rgba(255,255,255,0.09) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.09) 2px, transparent 2px)`,
          backgroundSize: "120px 120px",
          backgroundPosition: `${-t * 260}px ${t * 180}px`,
          maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
    </AbsoluteFill>
    {Array.from({ length: 22 }).map((_, k) => {
      const x = random(`px${k}`) * 1080;
      const v = 20 + random(`pv${k}`) * 50;
      const y = 1900 - ((t * v + random(`py${k}`) * 1900) % 1900);
      const r = 2 + random(`pr${k}`) * 4;
      return <div key={k} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: k % 3 ? "rgba(255,255,255,0.35)" : "rgba(255,80,90,0.55)", filter: "blur(1px)" }} />;
    })}
  </AbsoluteFill>
);

// Escena 1: el carro se dibuja en línea y avanza con estelas de luz.
const EscenaCarro: React.FC<{ t: number }> = ({ t }) => {
  const dibujo = suave(lim(t / 1.0));
  const relleno = lim((t - 0.7) / 0.5);
  const susto = golpe(t, 1.05, 5);
  const zoom = t > 1.6 ? interpolate(t, [1.6, 1.92], [1, 5.5], { extrapolateRight: "clamp" }) : 1;
  const giro = t * 720;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 260 }}>
      {Array.from({ length: 7 }).map((_, k) => {
        const y = 760 + k * 40;
        const x = ((t * (900 + k * 120) + k * 300) % 1600) - 300;
        return <div key={k} style={{ position: "absolute", top: y + 330, left: 1080 - x, width: 260, height: 3, borderRadius: 2, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5))", opacity: 0.6 }} />;
      })}
      <div style={{ transform: `scale(${zoom}) translate(${susto * -6}px, ${susto * -14}px) rotate(${susto * -1.5}deg)`, transformOrigin: "78% 55%", filter: t > 1.6 ? `blur(${(zoom - 1) * 1.6}px)` : "none" }}>
        <svg width={1000} height={420} viewBox="0 0 1000 420" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="pintura" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff4a55" />
              <stop offset="0.55" stopColor={ROJO_DA} />
              <stop offset="1" stopColor="#5a0c10" />
            </linearGradient>
            <linearGradient id="brillo" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(255,255,255,0)" />
              <stop offset="0.5" stopColor="rgba(255,255,255,0.55)" />
              <stop offset="1" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="resplandor" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <clipPath id="clipCarro">
              <path d={CARRO} />
            </clipPath>
          </defs>
          <ellipse cx={515} cy={380} rx={460} ry={22} fill="rgba(0,0,0,0.55)" filter="url(#resplandor)" />
          <path d={CARRO} fill="url(#pintura)" opacity={relleno} />
          <g clipPath="url(#clipCarro)" opacity={relleno}>
            <rect x={-300 + ((t * 700) % 1600)} y={100} width={220} height={260} fill="url(#brillo)" transform="skewX(-20)" />
          </g>
          <path d={VENTANA} fill="rgba(12,18,28,0.92)" opacity={relleno} stroke="rgba(255,255,255,0.6)" strokeWidth={3} />
          <path d={CARRO} fill="none" stroke="#fff" strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dibujo} filter="url(#resplandor)" />
          {[260, 770].map((cx) => (
            <g key={cx} transform={`rotate(${giro} ${cx} 305)`}>
              <circle cx={cx} cy={305} r={60} fill="#0d0f13" stroke="#fff" strokeWidth={4} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - dibujo} />
              <circle cx={cx} cy={305} r={34} fill="none" stroke="#c9ced6" strokeWidth={6} opacity={relleno} />
              {[0, 72, 144, 216, 288].map((a) => (
                <line key={a} x1={cx} y1={305} x2={cx + Math.cos((a * Math.PI) / 180) * 32} y2={305 + Math.sin((a * Math.PI) / 180) * 32} stroke="#c9ced6" strokeWidth={5} opacity={relleno} />
              ))}
            </g>
          ))}
          <ellipse cx={955} cy={238} rx={10} ry={16} fill="#fff6d5" opacity={relleno} filter="url(#resplandor)" />
          {susto > 0.02 ? (
            <g>
              {[0, 1, 2].map((k) => {
                const l = (t - 1.05 - k * 0.12) * 1.6;
                if (l < 0 || l > 1) return null;
                return <circle key={k} cx={800} cy={210} r={30 + l * 220} fill="none" stroke={ROJO_DA} strokeWidth={6 * (1 - l)} opacity={1 - l} />;
              })}
            </g>
          ) : null}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// Escena 2 y 3: motor en vector con cilindros de cristal y pistones metálicos.
const EscenaMotor: React.FC<{ t: number }> = ({ t }) => {
  const entra = suave(lim((t - 1.92) / 0.35));
  const ydos = t >= 4.68 && t < 5.0;
  const vau = VAUS.reduce((a, k) => a + golpe(t, k, 3.5), 0);
  const tiembla = t >= 5.0 ? 4 + vau * 18 : 0;
  const xs = [228, 436, 644, 852];
  return (
    <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 60) * tiembla}px, ${Math.cos(t * 52) * tiembla}px) scale(${0.85 + entra * 0.15})`, opacity: entra }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6d7480" />
            <stop offset="0.35" stopColor="#f3f5f8" />
            <stop offset="0.6" stopColor="#aab1bb" />
            <stop offset="1" stopColor="#4c525b" />
          </linearGradient>
          <linearGradient id="cristal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="0.3" stopColor="rgba(255,255,255,0.22)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
          <linearGradient id="bloque" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c313a" />
            <stop offset="1" stopColor="#14171c" />
          </linearGradient>
          <radialGradient id="calor">
            <stop offset="0" stopColor="rgba(255,70,50,0.95)" />
            <stop offset="1" stopColor="rgba(255,40,40,0)" />
          </radialGradient>
          <filter id="brilloMotor" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <rect x={110} y={1180} width={860} height={300} rx={36} fill="url(#bloque)" stroke="rgba(255,255,255,0.14)" strokeWidth={3} />
        <rect x={110} y={1180} width={860} height={8} rx={4} fill="rgba(255,255,255,0.18)" />
        {xs.map((x, i) => {
          const base = Math.sin(t * 10 + i * 1.57) * 18;
          const g = TAKAS.filter((_, k) => k % 4 === i).reduce((a, k) => a + golpe(t, k, 8), 0);
          const y = 980 - base - g * 120;
          const rojo = ydos && (i === 1 || i === 2);
          const calor = rojo ? 0.7 + Math.sin(t * 20) * 0.3 : g;
          const ang = t * 9 + i * 1.57;
          const cx = x + Math.cos(ang) * 30;
          const cy = 1400 + Math.sin(ang) * 30;
          return (
            <g key={x}>
              <circle cx={x} cy={y + 40} r={150} fill="url(#calor)" opacity={calor} filter="url(#brilloMotor)" />
              <rect x={x - 82} y={840} width={164} height={360} rx={18} fill="url(#cristal)" stroke="rgba(255,255,255,0.35)" strokeWidth={3} />
              <line x1={x} y1={y + 70} x2={cx} y2={cy} stroke="url(#metal)" strokeWidth={22} strokeLinecap="round" />
              <circle cx={x} cy={1400} r={44} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={4} />
              <circle cx={cx} cy={cy} r={14} fill="#e9ecf0" />
              <rect x={x - 70} y={y} width={140} height={86} rx={14} fill={rojo ? "#ff3b3b" : "url(#metal)"} stroke={rojo || g > 0.1 ? "rgba(255,120,100,0.95)" : "rgba(255,255,255,0.5)"} strokeWidth={3} />
              {[18, 36, 54].map((d) => (
                <rect key={d} x={x - 70} y={y + d} width={140} height={4} fill="rgba(0,0,0,0.25)" />
              ))}
              {g > 0.05 ? <circle cx={x} cy={y - 10} r={40 + (1 - g) * 160} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={5 * g} /> : null}
            </g>
          );
        })}
      </svg>
      {/* humo suave */}
      {t > 5.0
        ? Array.from({ length: 18 }).map((_, k) => {
            const l = t - 5.0 - random(`hd${k}`) * 1.4;
            if (l < 0) return null;
            const x = 160 + random(`hx${k}`) * 760;
            const y = 900 - l * (180 + random(`hv${k}`) * 160);
            const r = 120 + l * 160;
            return <div key={k} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: r, background: "radial-gradient(circle, rgba(230,233,238,0.55) 0%, rgba(230,233,238,0) 70%)", filter: "blur(10px)", opacity: lim(1 - l * 0.45) }} />;
          })
        : null}
    </AbsoluteFill>
  );
};

// Palabra cinética con profundidad: contorno fantasma detrás y máscara.
const PalabraCinetica: React.FC<{ texto: string; t: number; t0: number; vida: number; x: number; y: number; ry: number; tam: number }> = ({ texto, t, t0, vida, x, y, ry, tam }) => {
  const l = t - t0;
  if (l < 0 || l > vida) return null;
  const e = suave(lim(l / 0.12));
  const s = lim((l - (vida - 0.12)) / 0.12);
  return (
    <div style={{ position: "absolute", left: x, top: y, perspective: 800 }}>
      <div style={{ transform: `rotateY(${ry * (1 - e)}deg) rotateX(${(1 - e) * 25}deg) translateZ(${e * 40}px)`, transformStyle: "preserve-3d" }}>
        <div style={{ position: "absolute", left: 10, top: 10, fontFamily: ANTON, fontSize: tam, lineHeight: 1, color: "transparent", WebkitTextStroke: "3px rgba(204,35,40,0.9)", opacity: e * (1 - s) }}>{texto}</div>
        <div style={{ overflow: "hidden", padding: "0.1em 0.02em 0" }}>
          <div style={{ fontFamily: ANTON, fontSize: tam, lineHeight: 1, color: "#fff", transform: `translateY(${(1 - e) * 100 - s * 100}%)`, textShadow: "0 18px 50px rgba(0,0,0,0.6)" }}>{texto}</div>
        </div>
        <div style={{ height: tam * 0.05, width: `${e * (1 - s) * 100}%`, background: DEGRADADO, borderRadius: 4, marginTop: 6 }} />
      </div>
    </div>
  );
};

const POS = [
  { x: 110, y: 560, ry: -40 },
  { x: 520, y: 650, ry: 40 },
  { x: 160, y: 700, ry: -30 },
  { x: 560, y: 560, ry: 35 },
  { x: 300, y: 620, ry: -35 },
  { x: 120, y: 600, ry: 30 },
  { x: 520, y: 690, ry: -40 },
];

// Barras de audio que reaccionan a la voz.
const Espectro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const datos = useAudioData(staticFile(AUDIO));
  if (!datos) return null;
  const vals = visualizeAudio({ fps, frame, audioData: datos, numberOfSamples: 64, smoothing: true });
  const mitad = vals.slice(1, 13).map((v, i) => Math.min(150, Math.max(6, Math.sqrt(v) * 260 * (0.55 + i * 0.09))));
  const barras = [...mitad.slice().reverse(), ...mitad];
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 200 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, height: 160 }}>
        {barras.map((h, i) => (
          <div key={i} style={{ width: 16, height: h, borderRadius: 8, background: i === 11 || i === 12 ? DEGRADADO : "rgba(255,255,255,0.75)", boxShadow: i === 11 || i === 12 ? "0 0 18px rgba(204,35,40,0.7)" : "0 0 10px rgba(255,255,255,0.25)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

export const TakaAnimado: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const finAudio = Math.round(DUR_AUDIO * fps);
  const enRemate = frame >= finAudio;
  const alerta = t >= 5.0 && !enRemate ? 0.35 + 0.25 * Math.sin(t * 12) : 0;
  const destello = interpolate(t, [1.84, 1.92, 2.1], [0, 0.9, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const marca = resorte(frame, fps, 0.1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080c" }}>
      <Fondo t={t} alerta={alerta} />
      {!enRemate && t < 1.92 ? <EscenaCarro t={t} /> : null}
      {!enRemate && t >= 1.92 ? <EscenaMotor t={t} /> : null}
      <AbsoluteFill style={{ background: "white", opacity: destello, mixBlendMode: "screen" }} />

      {!enRemate ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
          <div style={{ overflow: "hidden", marginBottom: 18 }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, 0.15)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, letterSpacing: "0.35em", color: "rgba(255,255,255,0.85)" }}>POV</div>
          </div>
          <div style={{ width: 960 }}>
            <TituloMascara texto="Yo explicándole al mecánico el ruido que hace mi carro" resaltar={["ruido"]} t={t} t0={0.25} t1={99} tamano={74} />
          </div>
        </AbsoluteFill>
      ) : null}

      {!enRemate && t < 1.85 ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 420 }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, 0.35)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 50, color: "#fff", background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "12px 30px 16px" }}>
              "Resulta que de repente oímos..."
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {!enRemate ? TAKAS.map((k, i) => <PalabraCinetica key={k} texto="TAKA" t={t} t0={k} vida={Math.min(0.5, (TAKAS[i + 1] ?? 4.68) - k + 0.12)} x={POS[i].x} y={POS[i].y} ry={POS[i].ry} tam={220} />) : null}

      {!enRemate && t >= 4.68 && t < 5.0 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 600 }}>
          <div style={{ width: 900, display: "flex", justifyContent: "center" }}>
            <TituloMascara texto="Y dos..." resaltar={["dos..."]} t={t} t0={4.68} t1={4.86} tamano={170} />
          </div>
        </AbsoluteFill>
      ) : null}

      {!enRemate
        ? VAUS.map((k, i) => {
            const l = t - k;
            if (l < 0 || l > 0.75) return null;
            const s = interpolate(l, [0, 0.07, 0.2, 0.75], [1.6, 0.95, 1, 1.05]);
            const o = interpolate(l, [0, 0.03, 0.6, 0.75], [0, 1, 1, 0]);
            const ab = Math.exp(-l * 7) * 16;
            return (
              <AbsoluteFill key={k} style={{ alignItems: "center", paddingTop: i ? 640 : 560 }}>
                <div style={{ fontFamily: ANTON, fontSize: 300, color: "#fff", opacity: o, transform: `scale(${s}) rotate(${i ? 3 : -3}deg)`, textShadow: `${ab}px 0 0 rgba(255,40,60,0.85), ${-ab}px 0 0 rgba(40,220,255,0.75), 0 20px 60px rgba(0,0,0,0.6)` }}>VAU!</div>
              </AbsoluteFill>
            );
          })
        : null}

      {!enRemate ? <Espectro frame={frame} fps={fps} /> : null}

      <Sequence from={finAudio}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.4) 0%, rgba(7,8,12,0) 60%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
          <svg width={420} height={180} viewBox="0 0 1000 420" style={{ marginBottom: 10 }}>
            <path d={CARRO} fill="none" stroke="#fff" strokeWidth={10} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - suave(lim((t - DUR_AUDIO) / 0.8))} />
          </svg>
          <div style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, DUR_AUDIO + 0.1)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.3em", color: "rgba(255,255,255,0.8)" }}>TRANQUI</div>
          </div>
          <div style={{ width: 920 }}>
            <TituloMascara texto="En Doctor Auto sí entendemos el taka taka" resaltar={["taka"]} t={t} t0={DUR_AUDIO + 0.25} t1={99} tamano={96} />
          </div>
        </AbsoluteFill>
        <ChipVidrio t={t} t0={DUR_AUDIO + 0.9} t1={99} texto="Diagnóstico por escáner · CDMX" x={225} y={1400} tamano={38} />
      </Sequence>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.6} />

      <Sequence durationInFrames={finAudio}>
        <Audio src={staticFile(AUDIO)} />
      </Sequence>
      <Sequence from={Math.round(1.7 * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/mk-whoosh-zoom.wav")} volume={0.35} />
      </Sequence>
      {VAUS.map((k) => (
        <Sequence key={k} from={Math.round(k * fps)} durationInFrames={30}>
          <Audio src={staticFile("sfx/mk-hit.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={finAudio - 6}>
        <Audio src={staticFile("sfx/mk-whoosh-slide.wav")} volume={0.3} />
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => interpolate(f, [0, 10, 70, 96], [0, 0.28, 0.28, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
    </AbsoluteFill>
  );
};
