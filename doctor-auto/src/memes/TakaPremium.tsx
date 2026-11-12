import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// "Taka taka" con video real y acabado de comercial: color de cine, entradas con zoom
// desenfocado, destellos en los cortes, textos que salen de una máscara y grano fino.
const DUR_AUDIO = 7.65;
const DUR_REMATE = 3.0;
export const DURACION_TAKA_PREMIUM = Math.round((DUR_AUDIO + DUR_REMATE) * 30);

type Toma = { archivo: string; desde: number; t0: number; t1: number; zoom: [number, number]; pos: string };
const TOMAS: Toma[] = [
  { archivo: "mixkit/4521.mp4", desde: 2.0, t0: 0, t1: 1.92, zoom: [1.0, 1.1], pos: "30% 50%" },
  { archivo: "mixkit/24815.mp4", desde: 1.0, t0: 1.92, t1: 2.42, zoom: [1.12, 1.2], pos: "18% 50%" },
  { archivo: "mixkit/4716.mp4", desde: 2.0, t0: 2.42, t1: 2.74, zoom: [1.12, 1.2], pos: "40% 50%" },
  { archivo: "mixkit/13270.mp4", desde: 1.0, t0: 2.74, t1: 3.3, zoom: [1.1, 1.18], pos: "45% 50%" },
  { archivo: "mixkit/17675.mp4", desde: 12.0, t0: 3.3, t1: 3.78, zoom: [1.12, 1.2], pos: "60% 50%" },
  { archivo: "mixkit/13260.mp4", desde: 1.0, t0: 3.78, t1: 4.68, zoom: [1.05, 1.14], pos: "35% 50%" },
  { archivo: "mixkit/41937.mp4", desde: 1.0, t0: 4.68, t1: 5.5, zoom: [1.04, 1.16], pos: "60% 50%" },
  { archivo: "mixkit/64.mp4", desde: 3.0, t0: 5.5, t1: 6.5, zoom: [1.08, 1.22], pos: "45% 50%" },
  { archivo: "mixkit/1960.mp4", desde: 2.0, t0: 6.5, t1: DUR_AUDIO, zoom: [1.0, 1.15], pos: "50% 50%" },
];
const CORTES = TOMAS.slice(1).map((x) => x.t0);
const TAKAS = [1.92, 2.42, 2.74, 3.3, 3.54, 3.78, 4.1];
const VAUS = [5.0, 6.1];
const POS_TAKA = [
  { top: 980, left: 90, rot: -4 },
  { top: 1120, left: 420, rot: 3 },
  { top: 860, left: 360, rot: -2 },
  { top: 1240, left: 120, rot: 4 },
  { top: 1010, left: 460, rot: -3 },
  { top: 1180, left: 260, rot: 2 },
  { top: 900, left: 140, rot: -3 },
];

const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 200) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const TomaCine: React.FC<{ toma: Toma; t: number }> = ({ toma, t }) => {
  const l = t - toma.t0;
  const dur = toma.t1 - toma.t0;
  const entrada = Math.max(0, 1 - l / 0.18);
  const escala = interpolate(l, [0, dur], toma.zoom, { extrapolateRight: "clamp" }) * (1 + 0.1 * entrada * entrada);
  return (
    <AbsoluteFill style={{ transform: `scale(${escala})`, filter: `blur(${entrada * entrada * 10}px) contrast(1.1) saturate(1.12) brightness(${1 + entrada * 0.25})` }}>
      <OffthreadVideo src={staticFile(toma.archivo)} muted startFrom={Math.round(toma.desde * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: toma.pos }} />
    </AbsoluteFill>
  );
};

// Palabra que sale de una máscara, con línea roja que se dibuja debajo.
const PalabraMascara: React.FC<{ texto: string; frame: number; fps: number; t0: number; vida: number; tamano: number; style: React.CSSProperties }> = ({ texto, frame, fps, t0, vida, tamano, style }) => {
  const t = frame / fps;
  if (t < t0 || t > t0 + vida) return null;
  const entra = resorte(frame, fps, t0, 15, 260);
  const sale = interpolate(t, [t0 + vida - 0.12, t0 + vida], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const linea = interpolate(t, [t0 + 0.04, t0 + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", ...style }}>
      <div style={{ overflow: "hidden", padding: "0.12em 0.04em 0.02em" }}>
        <div style={{ fontFamily: ANTON, fontSize: tamano, lineHeight: 1, color: "#fff", letterSpacing: "0.01em", transform: `translateY(${(1 - entra) * 105 + sale * -105}%)`, textShadow: "0 10px 40px rgba(0,0,0,0.55)" }}>{texto}</div>
      </div>
      <div style={{ height: tamano * 0.06, background: DEGRADADO, width: `${linea * (1 - sale) * 100}%`, borderRadius: 4, boxShadow: "0 6px 18px rgba(204,35,40,0.5)" }} />
    </div>
  );
};

export const TakaPremium: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const finAudio = Math.round(DUR_AUDIO * fps);
  const enRemate = frame >= finAudio;
  const vau = VAUS.reduce((a, k) => a + (t >= k ? Math.exp(-(t - k) * 6) : 0), 0);
  const ydos = t >= 4.68 && t < 5.0;
  const marca = resorte(frame, fps, 0.1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {!enRemate ? (
        <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 70) * vau * 14}px, ${Math.cos(t * 63) * vau * 10}px)` }}>
          {TOMAS.map((toma, i) => (
            <Sequence key={i} from={Math.round(toma.t0 * fps)} durationInFrames={Math.round((toma.t1 - toma.t0) * fps)}>
              <TomaCine toma={toma} t={t} />
            </Sequence>
          ))}
        </AbsoluteFill>
      ) : null}

      {/* legibilidad arriba y abajo */}
      {!enRemate ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.55) 100%)" }} /> : null}
      {!enRemate ? <Destello t={t} cortes={CORTES} /> : null}

      {/* encabezado: kicker + titular con máscara */}
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

      {/* subtítulo de arranque */}
      {!enRemate && t < 1.92 ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, 0.35)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 52, color: "#fff", background: "rgba(10,10,14,0.45)", border: "2px solid rgba(255,255,255,0.22)", borderRadius: 20, padding: "12px 30px 16px" }}>
              "Resulta que de repente oímos..."
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* TAKA con máscara, una por golpe */}
      {!enRemate
        ? TAKAS.map((k, i) => (
            <PalabraMascara key={k} texto="TAKA" frame={frame} fps={fps} t0={k} vida={Math.min(0.5, (TAKAS[i + 1] ?? 4.68) - k + 0.12)} tamano={210} style={{ top: POS_TAKA[i].top, left: POS_TAKA[i].left, transform: `rotate(${POS_TAKA[i].rot}deg)` }} />
          ))
        : null}

      {/* Y DOS */}
      {ydos ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 420 }}>
          <div style={{ width: 900, display: "flex", justifyContent: "center" }}>
            <TituloMascara texto="Y dos..." resaltar={["dos..."]} t={t} t0={4.68} t1={4.86} tamano={170} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* VAU con aberración de color */}
      {!enRemate
        ? VAUS.map((k, i) => {
            const l = t - k;
            if (l < 0 || l > 0.7) return null;
            const s = interpolate(l, [0, 0.07, 0.18, 0.7], [1.5, 0.95, 1, 1.04]);
            const o = interpolate(l, [0, 0.03, 0.55, 0.7], [0, 1, 1, 0]);
            const ab = Math.exp(-l * 7) * 14;
            return (
              <AbsoluteFill key={k} style={{ justifyContent: "center", alignItems: "center", paddingTop: i ? 520 : 380 }}>
                <div style={{ fontFamily: ANTON, fontSize: 300, color: "#fff", opacity: o, transform: `scale(${s}) rotate(${i ? 3 : -3}deg)`, textShadow: `${ab}px 0 0 rgba(255,40,60,0.85), ${-ab}px 0 0 rgba(40,220,255,0.75), 0 20px 60px rgba(0,0,0,0.6)` }}>VAU!</div>
              </AbsoluteFill>
            );
          })
        : null}

      {/* remate */}
      <Sequence from={finAudio}>
        <AbsoluteFill style={{ filter: "blur(22px) brightness(0.35) saturate(1.2)", transform: "scale(1.15)" }}>
          <Img src={staticFile("mixkit/72-fin.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.35) 0%, rgba(0,0,0,0) 60%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, DUR_AUDIO + 0.1)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.3em", color: "rgba(255,255,255,0.8)" }}>TRANQUI</div>
          </div>
          <div style={{ width: 920 }}>
            <TituloMascara texto="En Doctor Auto sí entendemos el taka taka" resaltar={["taka"]} t={t} t0={DUR_AUDIO + 0.25} t1={99} tamano={96} />
          </div>
        </AbsoluteFill>
        <ChipVidrio t={t} t0={DUR_AUDIO + 0.9} t1={99} texto="Diagnóstico por escáner · CDMX" x={225} y={1330} tamano={38} />
      </Sequence>

      {/* marca */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca, transform: `translateY(${(1 - marca) * -20}px)` }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.8} />

      {/* sonido: audio original + diseño sonoro suave */}
      <Sequence durationInFrames={finAudio}>
        <Audio src={staticFile("sfx/memes/taka-taka.wav")} />
      </Sequence>
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={20}>
          <Audio src={staticFile("sfx/mk-whoosh-slide.wav")} volume={0.12} />
        </Sequence>
      ))}
      {VAUS.map((k) => (
        <Sequence key={k} from={Math.round(k * fps)} durationInFrames={30}>
          <Audio src={staticFile("sfx/mk-hit.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={finAudio - 6}>
        <Audio src={staticFile("sfx/mk-whoosh-zoom.wav")} volume={0.4} />
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => interpolate(f, [0, 10, 70, 96], [0, 0.28, 0.28, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
    </AbsoluteFill>
  );
};
