import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium } from "../doctor-auto/premium";
import { ChipVidrio } from "../doctor-auto/pro";

// Formato "dato curioso con giro" (como el de los tanques con QR y los chilaquiles):
// un dato serio de OTRO mundo, sin ninguna pista de la marca, explicado con cara seria,
// y en el remate un corte brusco a material real de Doctor Auto.
const DUR_VOZ = 14.72;
const T_GIRO = 9.2;
export const DURACION_DATO_JAPON = Math.round((DUR_VOZ + 0.9) * 30);

type Plano = { src: string; t0: number; t1: number; desde: number; pos?: string; zoom?: [number, number] };
const PLANOS: Plano[] = [
  { src: "mixkit/28682.mp4", t0: 0, t1: 1.15, desde: 1, zoom: [1.05, 1.15] },
  { src: "mixkit/14089.mp4", t0: 1.15, t1: 3.5, desde: 9.6, pos: "52% 50%", zoom: [1.0, 1.12] },
  { src: "mixkit/30137.mp4", t0: 3.5, t1: 4.5, desde: 0.3, zoom: [1.05, 1.12] },
  // 4.5–7.2: pantalla del escáner (abajo)
  { src: "mixkit/20085.mp4", t0: 7.2, t1: T_GIRO, desde: 2.5, pos: "40% 50%", zoom: [1.05, 1.2] },
  // giro: material propio de Doctor Auto
  { src: "datofalso/cortinas.mp4", t0: T_GIRO, t1: 11.6, desde: 0.4, zoom: [1.05, 1.12] },
  { src: "datofalso/escaner.mp4", t0: 11.6, t1: DUR_VOZ + 0.9, desde: 0.5, pos: "60% 50%", zoom: [1.0, 1.1] },
];
const CORTES = [1.15, 3.5, 4.5, 7.2, 11.6];

// cajas del sensor sobre la foto del cruce (coordenadas del cuadro original 1280x720)
const CAJAS: { x: number; y: number; w: number; h: number; t: number; mal: boolean }[] = [
  { x: 125, y: 393, w: 112, h: 50, t: 5.3, mal: false },
  { x: 726, y: 616, w: 54, h: 106, t: 5.75, mal: false },
  { x: 435, y: 480, w: 116, h: 54, t: 6.1, mal: true },
  { x: 818, y: 562, w: 62, h: 124, t: 6.55, mal: true },
];

const SUBS: [number, string][] = [
  [0, "En Japón"],
  [1.16, "las ambulancias"],
  [2.28, "traen un escáner"],
  [2.9, "en el techo"],
  [3.57, "¿por qué"],
  [3.87, "hacen esto?"],
  [4.55, "Fácil."],
  [5.12, "detecta los carros"],
  [6.0, "que van enfermos"],
  [7.33, "ya que en vez"],
  [8.17, "de llevarlos al hospital"],
];
const REMATE: [number, string][] = [
  [9.27, "Los lleva"],
  [9.53, "directamente"],
  [10.13, "con el mejor doctor"],
  [11.57, "de autos"],
  [12.56, "de la CDMX"],
];

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 200) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const PlanoVideo: React.FC<{ p: Plano; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const k = lim(l / (p.t1 - p.t0));
  const entra = Math.max(0, 1 - l / 0.2);
  const [z0, z1] = p.zoom ?? [1, 1.1];
  return (
    <AbsoluteFill style={{ transform: `scale(${(z0 + (z1 - z0) * k) * (1 + 0.1 * entra)})`, filter: `blur(${entra * entra * 12}px) contrast(1.08) saturate(1.1)` }}>
      <OffthreadVideo src={staticFile(p.src)} muted startFrom={Math.round(p.desde * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "50% 50%" }} />
    </AbsoluteFill>
  );
};

// Monitor del "sensor": la foto del cruce con barrido y cajas que marcan cada carro.
const PantallaSensor: React.FC<{ t: number; frame: number; fps: number }> = ({ t, frame, fps }) => {
  const l = t - 4.5;
  const W = 1020;
  const X0 = 120; // recorte: x 120–1120 del cuadro original
  const s = W / 1000;
  const entra = resorte(frame, fps, 4.5, 16, 180);
  const barrido = ((l * 0.9) % 1) * 720;
  const pulso = (l * 1.4) % 1;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: "scale(1.5)", filter: "blur(36px) brightness(0.35)" }}>
        <Img src={staticFile("datofalso/cruce.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ width: W, height: 720 * s, position: "relative", borderRadius: 18, overflow: "hidden", border: "3px solid rgba(120,255,170,0.55)", boxShadow: "0 30px 90px rgba(0,0,0,0.7)", transform: `scale(${0.9 + 0.1 * entra})`, opacity: entra }}>
          <Img src={staticFile("datofalso/cruce.jpg")} style={{ position: "absolute", left: -X0 * s, top: 0, width: 1280 * s, height: 720 * s, transform: `scale(${1 + 0.05 * lim(l / 2.7)})`, filter: "contrast(1.15) saturate(0.6) brightness(0.95)" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(20,60,40,0.25)", mixBlendMode: "multiply" }} />
          {/* pulso del escáner saliendo de la ambulancia */}
          <div style={{ position: "absolute", left: (677 - X0) * s - 300 * pulso, top: 230 * s - 300 * pulso, width: 600 * pulso, height: 600 * pulso, borderRadius: "50%", border: "3px solid rgba(120,255,170,0.8)", opacity: 1 - pulso }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: barrido * s, height: 3, background: "rgba(120,255,170,0.9)", boxShadow: "0 0 18px rgba(120,255,170,0.9)" }} />
          <div style={{ position: "absolute", left: (622 - X0) * s, top: 162 * s, width: 110 * s, height: 136 * s, border: "3px dashed #fff", borderRadius: 6 }} />
          {CAJAS.map((c, i) => {
            const e = resorte(frame, fps, c.t, 12, 260);
            if (e === 0) return null;
            const col = c.mal ? "#ff3b47" : "#5dff9a";
            return (
              <div key={i} style={{ position: "absolute", left: (c.x - X0) * s, top: c.y * s, width: c.w * s, height: c.h * s, border: `4px solid ${col}`, borderRadius: 6, transform: `scale(${interpolate(e, [0, 1], [1.8, 1])})`, opacity: lim(e * 2), boxShadow: `0 0 16px ${col}` }}>
                <div style={{ position: "absolute", bottom: "100%", left: -4, marginBottom: 4, background: col, color: c.mal ? "#fff" : "#06210f", fontFamily: POPPINS, fontWeight: 800, fontSize: 22, padding: "2px 8px", borderRadius: 5, whiteSpace: "nowrap" }}>
                  {c.mal ? "ENFERMO 🤒" : "SANO"}
                </div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 16, top: 12, fontFamily: POPPINS, fontWeight: 700, fontSize: 22, color: "#5dff9a", letterSpacing: "0.12em" }}>● SCAN · AMB-07</div>
          <div style={{ position: "absolute", right: 16, top: 12, fontFamily: POPPINS, fontWeight: 700, fontSize: 22, color: "#5dff9a", fontVariantNumeric: "tabular-nums" }}>{`${Math.min(4, Math.floor(lim((l - 0.6) / 2.1) * 4 + 0.001))}/4`}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SFX: [number, string, number][] = [
  [0.0, "sfx/kit/whoosh.wav", 0.25],
  [4.5, "sfx/mixkit/electric-buzz-glitch.wav", 0.18],
  ...CAJAS.map((c): [number, string, number] => [c.t, c.mal ? "sfx/mk-error.wav" : "sfx/kit/click.wav", c.mal ? 0.3 : 0.4]),
  [T_GIRO - 0.05, "sfx/memes/boom.mp3", 0.55],
  [T_GIRO, "sfx/kit/fahhh.mp3", 0.45],
  [9.55, "sfx/kit/click.wav", 0.5],
  [10.15, "sfx/kit/click.wav", 0.5],
  [11.6, "sfx/kit/shutter.mp3", 0.5],
  [12.56, "sfx/kit/magic.mp3", 0.55],
];

export const DatoJapon: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enGiro = t >= T_GIRO;
  const sub = [...SUBS].reverse().find(([t0]) => t >= t0);
  const rem = [...REMATE].reverse().find(([t0]) => t >= t0);
  const estallido = lim(1 - Math.abs(t - T_GIRO) / 0.2);
  const marca = resorte(frame, fps, 12.9, 13, 170);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {PLANOS.map((p) => (
        <Sequence key={p.src} from={Math.round(p.t0 * fps)} durationInFrames={Math.round((p.t1 - p.t0) * fps)}>
          <PlanoVideo p={p} t={t} />
        </Sequence>
      ))}
      <Sequence from={Math.round(4.5 * fps)} durationInFrames={Math.round(2.7 * fps)}>
        <PantallaSensor t={t} frame={frame} fps={fps} />
      </Sequence>

      {enGiro ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 65%, rgba(0,0,0,0.6) 100%)" }} /> : null}

      {/* subtítulos del planteamiento: estilo noticia seca, caja negra */}
      {!enGiro && sub ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 440 }}>
          <div style={{ transform: `scale(${0.85 + 0.15 * resorte(frame, fps, sub[0], 15, 320)})`, background: "rgba(0,0,0,0.88)", color: "#fff", fontFamily: POPPINS, fontWeight: 600, fontSize: 52, padding: "6px 22px 10px", borderRadius: 6 }}>{sub[1]}</div>
        </AbsoluteFill>
      ) : null}

      {/* remate: texto grande arriba */}
      {enGiro && rem ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 280 }}>
          <div style={{ maxWidth: 960, textAlign: "center", transform: `scale(${0.7 + 0.3 * resorte(frame, fps, rem[0], 11, 280)})`, fontFamily: ANTON, fontSize: 118, lineHeight: 1.02, color: "#fff", textTransform: "uppercase", WebkitTextStroke: "3px rgba(0,0,0,0.6)", textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
            {rem[0] >= 12.56 ? <span style={{ background: DEGRADADO, padding: "0 0.18em", borderRadius: "0.12em", WebkitTextStroke: "0px" }}>{rem[1]}</span> : rem[1]}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* cierre de marca, solo después del giro */}
      {t >= 12.9 ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380, gap: 26 }}>
          <div style={{ transform: `scale(${interpolate(marca, [0, 1], [1.5, 1])})`, opacity: lim(marca * 2), display: "flex", alignItems: "center", gap: 18, background: "rgba(10,10,12,0.75)", border: "2px solid rgba(255,255,255,0.2)", padding: "14px 34px 18px", borderRadius: 24 }}>
            <div style={{ width: 20, height: 20, borderRadius: 10, background: ROJO_DA, boxShadow: "0 0 22px rgba(204,35,40,1)" }} />
            <div style={{ fontFamily: ANTON, fontSize: 92, color: "#fff", letterSpacing: "0.03em" }}>DOCTOR AUTO</div>
          </div>
        </AbsoluteFill>
      ) : null}
      <ChipVidrio t={t} t0={13.3} t1={99} texto="Diagnóstico por escáner en CDMX 🔧" x={160} y={1580} tamano={40} />

      <AcabadoPremium frame={frame} calidez={enGiro ? 0.8 : 0.4} />

      {/* estallido del giro */}
      {estallido > 0 ? (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${estallido}) 0%, rgba(255,190,60,${estallido}) ${20 + 40 * estallido}%, rgba(204,35,40,${estallido * 0.9}) ${45 + 40 * estallido}%, rgba(0,0,0,0) 100%)` }} />
      ) : null}

      <Audio src={staticFile("audio/datofalso/voz-japon-corta.wav")} />
      <Audio
        src={staticFile("audio/datofalso/musica.mp3")}
        volume={(f) => {
          const s = f / fps;
          if (s >= T_GIRO) return 0;
          return 0.16 * interpolate(s, [0, 0.4, T_GIRO - 0.1, T_GIRO], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        }}
      />
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={24}>
          <Audio src={staticFile("sfx/kit/whoosh.wav")} volume={0.18} />
        </Sequence>
      ))}
      {SFX.map(([s, src, v], i) => (
        <Sequence key={i} from={Math.round(s * fps)} durationInFrames={75}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
