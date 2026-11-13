import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// "ENCENDER AUTO": audio viral + video real nuevo con acabado de comercial.
// Remate: no era el tono, era la batería.
const DUR_AUDIO = 25.7;
const DUR_REMATE = 3.2;
export const DURACION_ENCENDER = Math.round((DUR_AUDIO + DUR_REMATE) * 30);

type Toma = { archivo: string; desde: number; t0: number; t1: number; zoom: [number, number]; pos: string; luz?: number };
const TOMAS: Toma[] = [
  { archivo: "mixkit/13127.mp4", desde: 3, t0: 0, t1: 2.95, zoom: [1.0, 1.1], pos: "55% 50%", luz: 1.7 },
  { archivo: "mixkit/24723.mp4", desde: 4, t0: 2.95, t1: 6.34, zoom: [1.05, 1.15], pos: "35% 50%" },
  { archivo: "mixkit/48198.mp4", desde: 0.5, t0: 6.34, t1: 10.7, zoom: [1.05, 1.18], pos: "50% 50%" },
  { archivo: "mixkit/21516.mp4", desde: 2.5, t0: 10.7, t1: 11.46, zoom: [1.15, 1.25], pos: "45% 50%" },
  { archivo: "mixkit/28917.mp4", desde: 4, t0: 11.46, t1: 14.6, zoom: [1.05, 1.15], pos: "45% 50%" },
  { archivo: "mixkit/45301.mp4", desde: 2, t0: 14.6, t1: 16.6, zoom: [1.1, 1.2], pos: "40% 50%" },
  { archivo: "mixkit/47363.mp4", desde: 6, t0: 16.6, t1: 20.3, zoom: [1.12, 1.25], pos: "40% 50%" },
  { archivo: "mixkit/33739.mp4", desde: 2, t0: 20.3, t1: 23.15, zoom: [1.05, 1.15], pos: "35% 50%" },
  { archivo: "mixkit/33324.mp4", desde: 3, t0: 23.15, t1: DUR_AUDIO, zoom: [1.05, 1.2], pos: "60% 50%" },
];
const CORTES = TOMAS.slice(1).map((x) => x.t0);
const GRITOS = [10.75, 16.63, 23.2];

const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 200) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const TomaCine: React.FC<{ toma: Toma; t: number }> = ({ toma, t }) => {
  const l = t - toma.t0;
  const entrada = Math.max(0, 1 - l / 0.18);
  const escala = interpolate(l, [0, toma.t1 - toma.t0], toma.zoom, { extrapolateRight: "clamp" }) * (1 + 0.1 * entrada * entrada);
  return (
    <AbsoluteFill style={{ transform: `scale(${escala})`, filter: `blur(${entrada * entrada * 10}px) contrast(1.1) saturate(1.12) brightness(${(toma.luz ?? 1) + entrada * 0.25})` }}>
      <OffthreadVideo src={staticFile(toma.archivo)} muted startFrom={Math.round(toma.desde * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: toma.pos }} />
    </AbsoluteFill>
  );
};

const Frase: React.FC<{ texto: string; resaltar: string[]; t: number; t0: number; t1: number; tamano?: number }> = ({ texto, resaltar, t, t0, t1, tamano = 92 }) =>
  t >= t0 && t < t1 + 0.4 ? (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 340 }}>
      <div style={{ width: 960, display: "flex", justifyContent: "center" }}>
        <TituloMascara texto={texto} resaltar={resaltar} t={t} t0={t0} t1={t1} tamano={tamano} />
      </div>
    </AbsoluteFill>
  ) : null;

export const EncenderAuto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fin = Math.round(DUR_AUDIO * fps);
  const enRemate = frame >= fin;
  const grito = GRITOS.reduce((a, k) => a + (t >= k ? Math.exp(-(t - k) * 5) : 0), 0);
  const marca = resorte(frame, fps, 0.1);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {!enRemate ? (
        <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 70) * grito * 16}px, ${Math.cos(t * 63) * grito * 12}px)` }}>
          {TOMAS.map((toma, i) => (
            <Sequence key={i} from={Math.round(toma.t0 * fps)} durationInFrames={Math.round((toma.t1 - toma.t0) * fps)}>
              <TomaCine toma={toma} t={t} />
            </Sequence>
          ))}
        </AbsoluteFill>
      ) : null}
      {!enRemate ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)" }} /> : null}
      {!enRemate ? <Destello t={t} cortes={CORTES} /> : null}

      {!enRemate ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
          <div style={{ overflow: "hidden", marginBottom: 18 }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, 0.15)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, letterSpacing: "0.35em", color: "rgba(255,255,255,0.85)" }}>POV</div>
          </div>
          <div style={{ width: 960 }}>
            <TituloMascara texto="Cuando tu carro no arranca si no le hablas fuerte" resaltar={["fuerte"]} t={t} t0={0.25} t1={99} tamano={72} />
          </div>
        </AbsoluteFill>
      ) : null}

      {!enRemate ? (
        <>
          <Frase texto='"Tienes que gritar: encender auto"' resaltar={["encender", "auto\""]} t={t} t0={0.2} t1={2.8} tamano={70} />
          <Frase texto="Pero con 🥚🥚" resaltar={["🥚🥚"]} t={t} t0={4.4} t1={6.2} tamano={120} />
          <Frase texto="¡Con 🥚🥚!" resaltar={["🥚🥚!"]} t={t} t0={6.4} t1={9.6} tamano={130} />
          <Frase texto="Creo que es en inglés" resaltar={["inglés"]} t={t} t0={11.6} t1={13.3} tamano={100} />
          <Frase texto="Yo lo puse en inglés" resaltar={["inglés"]} t={t} t0={13.4} t1={14.4} tamano={100} />
          <Frase texto="Dilo fuerte" resaltar={["fuerte"]} t={t} t0={20.4} t1={23.0} tamano={120} />
        </>
      ) : null}

      {!enRemate
        ? GRITOS.map((k, i) => {
            const l = t - k;
            if (l < 0 || l > 1.3) return null;
            const s = interpolate(l, [0, 0.07, 0.2, 1.3], [1.6, 0.95, 1, 1.05]);
            const o = interpolate(l, [0, 0.03, 1.1, 1.3], [0, 1, 1, 0]);
            const ab = Math.exp(-l * 6) * 16;
            return (
              <AbsoluteFill key={k} style={{ justifyContent: "center", alignItems: "center", paddingTop: 300 }}>
                <div style={{ fontFamily: ANTON, fontSize: 190 + i * 25, lineHeight: 0.95, color: "#fff", textAlign: "center", opacity: o, transform: `scale(${s}) rotate(${i % 2 ? 2 : -2}deg)`, textShadow: `${ab}px 0 0 rgba(255,40,60,0.85), ${-ab}px 0 0 rgba(40,220,255,0.75), 0 20px 60px rgba(0,0,0,0.6)` }}>
                  ENCENDER
                  <br />
                  AUTO!
                </div>
              </AbsoluteFill>
            );
          })
        : null}

      <Sequence from={fin}>
        <AbsoluteFill style={{ filter: "blur(24px) brightness(0.35) saturate(1.2)", transform: "scale(1.15)" }}>
          <OffthreadVideo src={staticFile("mixkit/33324.mp4")} muted startFrom={Math.round(5.6 * 30)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.35) 0%, rgba(0,0,0,0) 60%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 36 }}>
          <div style={{ fontSize: 140, transform: `scale(${resorte(frame, fps, DUR_AUDIO + 0.05, 10)})` }}>🔋</div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, DUR_AUDIO + 0.15)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.3em", color: "rgba(255,255,255,0.8)" }}>SPOILER</div>
          </div>
          <div style={{ width: 920 }}>
            <TituloMascara texto="No era el tono, era la batería" resaltar={["batería"]} t={t} t0={DUR_AUDIO + 0.3} t1={99} tamano={100} />
          </div>
        </AbsoluteFill>
        <ChipVidrio t={t} t0={DUR_AUDIO + 1.0} t1={99} texto="Baterías a domicilio en CDMX 🔧" x={190} y={1360} tamano={40} />
      </Sequence>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.8} />

      <Sequence durationInFrames={fin}>
        <Audio src={staticFile("sfx/memes/encender-auto.wav")} />
      </Sequence>
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={20}>
          <Audio src={staticFile("sfx/mk-whoosh-slide.wav")} volume={0.1} />
        </Sequence>
      ))}
      {GRITOS.map((k) => (
        <Sequence key={k} from={Math.round(k * fps)} durationInFrames={30}>
          <Audio src={staticFile("sfx/mk-hit.wav")} volume={0.3} />
        </Sequence>
      ))}
      <Sequence from={fin - 6}>
        <Audio src={staticFile("sfx/mk-whoosh-zoom.wav")} volume={0.4} />
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => interpolate(f, [0, 10, 76, 102], [0, 0.28, 0.28, 0], { extrapolateRight: "clamp" })} />
      </Sequence>
    </AbsoluteFill>
  );
};
