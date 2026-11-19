import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// "Lo que dice tu auto de ti": lista de humor con fotos reales de cada modelo.
const DUR_VOZ = 31.3;
export const DURACION_TU_AUTO = Math.round((DUR_VOZ + 1.6) * 30);

type Auto = { src: string; nombre: string; t0: number; t1: number; tNombre: number; tChiste: number; chiste: string; resaltar: string[]; pos?: string };
const AUTOS: Auto[] = [
  { src: "tsuru", nombre: "TSURU", t0: 2.0, t1: 6.2, tNombre: 2.16, tChiste: 3.0, chiste: "No lo vendes porque “todavía da guerra”", resaltar: ["guerra”"] },
  { src: "vocho", nombre: "VOCHO", t0: 6.2, t1: 10.0, tNombre: 6.28, tChiste: 7.1, chiste: "Tienes una técnica secreta para que arranque", resaltar: ["secreta"] },
  { src: "aveo", nombre: "AVEO", t0: 10.0, t1: 14.3, tNombre: 10.06, tChiste: 10.88, chiste: "O trabajas en plataforma… o te subiste a uno hoy", resaltar: ["plataforma…"] },
  { src: "jetta", nombre: "JETTA TUNEADO", t0: 14.3, t1: 17.9, tNombre: 14.34, tChiste: 15.64, chiste: "Le invertiste más que a tu carrera", resaltar: ["carrera"] },
  { src: "pickup", nombre: "PICKUP", t0: 17.9, t1: 22.3, tNombre: 17.96, tChiste: 18.82, chiste: "Nunca has cargado nada… pero por si acaso", resaltar: ["acaso"] },
  { src: "bmw", nombre: "BMW", t0: 22.3, t1: 26.1, tNombre: 22.38, tChiste: 23.86, chiste: "Las direccionales son opcionales", resaltar: ["opcionales"] },
];
const CORTES = AUTOS.map((a) => a.t0).concat([26.1]);

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 13, stiffness = 200) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const Tarjeta: React.FC<{ a: Auto; t: number; frame: number; fps: number }> = ({ a, t, frame, fps }) => {
  const l = t - a.t0;
  const k = lim(l / (a.t1 - a.t0));
  const entra = Math.max(0, 1 - l / 0.2);
  const golpe = t >= a.tChiste ? 1 + 0.04 * Math.max(0, 1 - (t - a.tChiste) / 0.25) : 1;
  const insignia = resorte(frame, fps, a.tNombre, 11, 260);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.35 + k * 0.08})`, filter: "blur(40px) brightness(0.42) saturate(1.2)" }}>
        <Img src={staticFile(`tuauto/${a.src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 80 }}>
        <div style={{ position: "relative", transform: `translateY(${entra * 50}px) scale(${golpe})` }}>
          <div style={{ width: 980, height: 740, borderRadius: 34, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)", filter: `blur(${entra * entra * 8}px)` }}>
            <Img src={staticFile(`tuauto/${a.src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: a.pos ?? "50% 55%", transform: `scale(${1.02 + 0.1 * k})`, filter: "contrast(1.08) saturate(1.12)" }} />
          </div>
          <div style={{ position: "absolute", left: 40, top: -50, transform: `scale(${insignia}) rotate(-3deg)`, transformOrigin: "left center", background: DEGRADADO, padding: "6px 32px 14px", borderRadius: 18, fontFamily: ANTON, fontSize: 92, color: "#fff", boxShadow: "0 16px 40px rgba(204,35,40,0.55)" }}>{a.nombre}</div>
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 250 }}>
        <div style={{ width: 960 }}>
          <TituloMascara texto={a.chiste} resaltar={a.resaltar} t={t} t0={a.tChiste} t1={a.t1 - 0.15} tamano={78} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SFX: [number, string, number][] = [
  [0.0, "sfx/kit/fahhh.mp3", 0.45],
  ...AUTOS.flatMap((a): [number, string, number][] => [
    [a.tNombre, "sfx/mk-pop.wav", 0.4],
    [a.tChiste, "sfx/kit/click.wav", 0.5],
  ]),
  [24.6, "sfx/memes/boing.mp3", 0.25],
  [26.1, "sfx/kit/shutter.mp3", 0.4],
  [29.7, "sfx/kit/magic.mp3", 0.5],
];

export const TuAuto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const marca = resorte(frame, fps, 0.1);
  const final = t >= 26.1;
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {AUTOS.map((a) => (
        <Sequence key={a.src} from={Math.round(a.t0 * fps)} durationInFrames={Math.round((a.t1 - a.t0) * fps)}>
          <Tarjeta a={a} t={t} frame={frame} fps={fps} />
        </Sequence>
      ))}

      {/* portada: mosaico de los 6 autos */}
      {t < 2.0 ? (
        <AbsoluteFill style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 8, padding: 8 }}>
          {AUTOS.map((a, i) => (
            <div key={a.src} style={{ borderRadius: 18, overflow: "hidden", transform: `scale(${resorte(frame, fps, i * 0.06, 14)})`, filter: "brightness(0.55)" }}>
              <Img src={staticFile(`tuauto/${a.src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </AbsoluteFill>
      ) : null}
      {t < 2.0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 960 }}>
            <TituloMascara texto="Lo que dice tu auto de ti" resaltar={["ti"]} t={t} t0={0.15} t1={1.85} tamano={120} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* cierre */}
      {final ? (
        <>
          <AbsoluteFill style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 8, padding: 8, filter: "blur(14px) brightness(0.3)" }}>
            {AUTOS.map((a) => (
              <div key={a.src} style={{ borderRadius: 18, overflow: "hidden" }}>
                <Img src={staticFile(`tuauto/${a.src}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.35) 0%, rgba(0,0,0,0) 60%)" }} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
            <div style={{ width: 960 }}>
              <TituloMascara texto="¿Y el tuyo qué dice de ti?" resaltar={["tuyo"]} t={t} t0={26.15} t1={99} tamano={100} />
            </div>
            <div style={{ width: 920, opacity: t >= 28.4 ? 1 : 0 }}>
              <TituloMascara texto="Sea cual sea, el Doctor lo atiende" resaltar={["Doctor"]} t={t} t0={28.45} t1={99} tamano={74} />
            </div>
          </AbsoluteFill>
          <ChipVidrio t={t} t0={27.0} t1={99} texto="Cuéntanos en los comentarios 👇" x={200} y={1420} tamano={40} />
        </>
      ) : null}

      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.6) 100%)" }} />
      <Destello t={t} cortes={CORTES} />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.7} />

      <Audio src={staticFile("audio/tuauto/voz.wav")} />
      <Audio
        src={staticFile("sfx/memes/musica.mp3")}
        loop
        volume={(f) => 0.1 * interpolate(f / fps, [0, 0.4, DUR_VOZ + 0.6, DUR_VOZ + 1.6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={20}>
          <Audio src={staticFile("sfx/kit/whoosh.wav")} volume={0.16} />
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
