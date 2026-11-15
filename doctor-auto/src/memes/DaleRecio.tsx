import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// "Dale bien recio": en mi mente (carretera a toda velocidad) vs. la realidad (Periférico a 20 km/h).
// Remata con un dato del taller: el tráfico de para y avanza desgasta frenos y clutch.
const DUR = 27.6;
const T_REMATE = 24.2;
export const DURACION_DALE_RECIO = Math.round(DUR * 30);

type Toma = { archivo: string; desde: number; t0: number; t1: number; zoom: [number, number]; pos: string };
const TOMAS: Toma[] = [
  { archivo: "mixkit/42367.mp4", desde: 4, t0: 0, t1: 1.74, zoom: [1.0, 1.12], pos: "50% 50%" },
  { archivo: "mixkit/52454.mp4", desde: 6, t0: 1.74, t1: 3.16, zoom: [1.0, 1.12], pos: "45% 50%" },
  { archivo: "mixkit/47629.mp4", desde: 0.5, t0: 3.16, t1: 4.17, zoom: [1.05, 1.2], pos: "50% 50%" },
  { archivo: "mixkit/2675.mp4", desde: 1, t0: 4.17, t1: 5.14, zoom: [1.1, 1.25], pos: "50% 50%" },
  { archivo: "mixkit/3304.mp4", desde: 2, t0: 5.14, t1: 7.08, zoom: [1.05, 1.15], pos: "45% 50%" },
  { archivo: "mixkit/17613.mp4", desde: 0, t0: 7.08, t1: 9.64, zoom: [1.1, 1.2], pos: "35% 50%" },
  { archivo: "mixkit/4401.mp4", desde: 3, t0: 9.64, t1: 12.24, zoom: [1.05, 1.15], pos: "50% 50%" },
  { archivo: "mixkit/27845.mp4", desde: 0.5, t0: 12.24, t1: 13.98, zoom: [1.05, 1.15], pos: "40% 50%" },
  { archivo: "mixkit/39825.mp4", desde: 2, t0: 13.98, t1: 15.82, zoom: [1.05, 1.15], pos: "60% 50%" },
  { archivo: "mixkit/4000.mp4", desde: 2, t0: 15.82, t1: 18.47, zoom: [1.05, 1.15], pos: "50% 50%" },
  { archivo: "mixkit/13976.mp4", desde: 3, t0: 18.47, t1: 20.52, zoom: [1.05, 1.15], pos: "45% 50%" },
  { archivo: "mixkit/33327.mp4", desde: 1, t0: 20.52, t1: T_REMATE, zoom: [1.05, 1.18], pos: "50% 50%" },
];
const CORTES = TOMAS.slice(1).map((x) => x.t0);

const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 200) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const TomaCine: React.FC<{ toma: Toma; t: number }> = ({ toma, t }) => {
  const l = t - toma.t0;
  const entrada = Math.max(0, 1 - l / 0.16);
  const escala = interpolate(l, [0, toma.t1 - toma.t0], toma.zoom, { extrapolateRight: "clamp" }) * (1 + 0.1 * entrada * entrada);
  return (
    <AbsoluteFill style={{ transform: `scale(${escala})`, filter: `blur(${entrada * entrada * 10}px) contrast(1.12) saturate(1.15) brightness(${1 + entrada * 0.25})` }}>
      <OffthreadVideo src={staticFile(toma.archivo)} muted startFrom={Math.round(toma.desde * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: toma.pos }} />
    </AbsoluteFill>
  );
};

// Lo que dice la voz viral, como pensamiento: sale de una máscara abajo; los gritos, más grandes.
const VOZ = [
  { texto: "¡Dale bien recio!", t0: 5.14, t1: 6.9, grande: true },
  { texto: "¡Que no te importe nada!", t0: 7.08, t1: 8.9, grande: false },
  { texto: "Tu cuerpo y tu rostro...", t0: 10.66, t1: 12.7, grande: false },
  { texto: "Tallados a mano", t0: 12.86, t1: 13.9, grande: false },
  { texto: "¡Apocalíptica!", t0: 13.96, t1: 15.6, grande: true },
  { texto: "Auténtica...", t0: 17.66, t1: 18.85, grande: false },
  { texto: "¡Apocalíptica!", t0: 18.94, t1: 20.4, grande: true },
  { texto: "¡Dale bien recio!", t0: 20.52, t1: 23.9, grande: true },
];

const Voz: React.FC<{ texto: string; t0: number; t1: number; grande: boolean; t: number; frame: number; fps: number }> = ({ texto, t0, t1, grande, t, frame, fps }) => {
  if (t < t0 || t > t1) return null;
  const e = resorte(frame, fps, t0, 13, 240);
  const sale = interpolate(t, [t1 - 0.12, t1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ab = grande ? Math.exp(-(t - t0) * 7) * 12 : 0;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 320 }}>
      <div style={{ overflow: "hidden", padding: "0.1em 0.2em 0" }}>
        <div style={{ fontFamily: ANTON, fontSize: grande ? 140 : 96, lineHeight: 1, color: "#fff", textAlign: "center", padding: "0 40px", transform: `translateY(${(1 - e) * 105 - sale * 105}%)`, textShadow: `${ab}px 0 0 rgba(255,40,60,0.85), ${-ab}px 0 0 rgba(40,220,255,0.75), 0 14px 40px rgba(0,0,0,0.7)` }}>{texto}</div>
      </div>
    </AbsoluteFill>
  );
};

export const DaleRecio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enRemate = t >= T_REMATE;
  const marca = resorte(frame, fps, 0.1);
  const golpe = t >= 5.14 ? Math.exp(-(t - 5.14) * 5) : 0;
  const vel = Math.round(20 + Math.sin(t * 3) * 1.5);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {!enRemate ? (
        <AbsoluteFill style={{ transform: `translate(${Math.sin(t * 70) * golpe * 18}px, ${Math.cos(t * 63) * golpe * 14}px)` }}>
          {TOMAS.map((toma, i) => (
            <Sequence key={i} from={Math.round(toma.t0 * fps)} durationInFrames={Math.round((toma.t1 - toma.t0) * fps)}>
              <TomaCine toma={toma} t={t} />
            </Sequence>
          ))}
        </AbsoluteFill>
      ) : null}
      {!enRemate ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.6) 100%)" }} /> : null}
      {!enRemate ? <Destello t={t} cortes={CORTES} /> : null}
      <AbsoluteFill style={{ backgroundColor: "white", opacity: interpolate(t, [5.08, 5.12, 5.3], [0, 0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />

      {!enRemate ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
          <div style={{ overflow: "hidden", marginBottom: 18 }}>
            <div style={{ transform: `translateY(${(1 - resorte(frame, fps, 0.15)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, letterSpacing: "0.35em", color: "rgba(255,255,255,0.85)" }}>POV</div>
          </div>
          <div style={{ width: 960 }}>
            <TituloMascara texto="Lo que pasa por mi mente cuando voy a 20 km/h en Periférico" resaltar={["mente"]} t={t} t0={0.25} t1={99} tamano={70} />
          </div>
        </AbsoluteFill>
      ) : null}

      {VOZ.map((v) => (
        <Voz key={v.t0} {...v} t={t} frame={frame} fps={fps} />
      ))}

      {/* velocímetro de mentira: 20 km/h */}
      {t >= 7.08 && t < 9.64 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 80 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, opacity: resorte(frame, fps, 7.1), transform: `scale(${0.7 + 0.3 * resorte(frame, fps, 7.1)})` }}>
            <div style={{ fontFamily: ANTON, fontSize: 260, color: "#fff", lineHeight: 1, textShadow: "0 20px 60px rgba(0,0,0,0.6)", fontVariantNumeric: "tabular-nums" }}>{vel}</div>
            <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 60, color: "rgba(255,255,255,0.85)" }}>km/h</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* remate con dato del taller */}
      {enRemate ? (
        <>
          <AbsoluteFill style={{ filter: "blur(24px) brightness(0.35) saturate(1.2)", transform: "scale(1.15)" }}>
            <OffthreadVideo src={staticFile("mixkit/3304.mp4")} muted startFrom={Math.round(8 * 30)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.35) 0%, rgba(0,0,0,0) 60%)" }} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
            <div style={{ overflow: "hidden" }}>
              <div style={{ transform: `translateY(${(1 - resorte(frame, fps, T_REMATE + 0.05)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.3em", color: "rgba(255,255,255,0.8)" }}>DATO DEL DOCTOR</div>
            </div>
            <div style={{ width: 940 }}>
              <TituloMascara texto="El para y avanza del tráfico desgasta frenos y clutch" resaltar={["frenos", "clutch"]} t={t} t0={T_REMATE + 0.2} t1={99} tamano={86} />
            </div>
          </AbsoluteFill>
          <ChipVidrio t={t} t0={T_REMATE + 0.9} t1={99} texto="Revisión de frenos y clutch · CDMX 🔧" x={140} y={1380} tamano={40} />
        </>
      ) : null}

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.8} />

      <Audio src={staticFile("sfx/memes/dale-recio.wav")} />
      {/* kit de efectos: fahhh para el gancho, click en cada texto, camera shutter en la transición a la realidad, magic en las revelaciones */}
      <Sequence from={3} durationInFrames={60}>
        <Audio src={staticFile("sfx/kit/fahhh.mp3")} volume={0.45} />
      </Sequence>
      {VOZ.map((v) => (
        <Sequence key={`c${v.t0}`} from={Math.round(v.t0 * fps)} durationInFrames={15}>
          <Audio src={staticFile("sfx/kit/click.wav")} volume={0.35} />
        </Sequence>
      ))}
      <Sequence from={Math.round(5.08 * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/kit/shutter.mp3")} volume={0.5} />
      </Sequence>
      <Sequence from={Math.round(7.1 * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/kit/magic.mp3")} volume={0.4} />
      </Sequence>
      <Sequence from={Math.round((T_REMATE + 0.2) * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/kit/magic.mp3")} volume={0.45} />
      </Sequence>
      <Sequence from={Math.round(5.1 * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/mk-hit.wav")} volume={0.3} />
      </Sequence>
      <Sequence from={Math.round((T_REMATE - 0.1) * fps)} durationInFrames={30}>
        <Audio src={staticFile("sfx/mk-whoosh-zoom.wav")} volume={0.35} />
      </Sequence>
    </AbsoluteFill>
  );
};
