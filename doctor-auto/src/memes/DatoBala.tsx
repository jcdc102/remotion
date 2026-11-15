import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio } from "../doctor-auto/pro";

// Formato "anuncio escondido" con el video viral de la bala en el tubo curvo: la animación
// original con su voz hasta "…sale y se va directa", y donde el original se iba a la
// hamburguesería, la bala sale disparada a Doctor Auto y empieza el comercial real.
const T_CORTE = 12.13; // fin de la animación (la bala sale hacia la cámara)
const T_VOZ = 12.4; // termina el audio original ("…y se va directa")
const DUR_ANUNCIO = 14.4;
export const DURACION_DATO_BALA = Math.round((T_VOZ + DUR_ANUNCIO + 0.6) * 30);
const FIN = T_VOZ + DUR_ANUNCIO + 0.6;

type Plano = { src: string; t0: number; t1: number; desde: number; w: number; h: number; vel?: number };
const PLANOS: Plano[] = [
  { src: "cortinas", t0: T_CORTE, t1: 13.54, desde: 0.6, w: 1080, h: 976, vel: 0.9 },
  { src: "escaner", t0: 13.54, t1: 16.88, desde: 0.3, w: 1080, h: 1186 },
  { src: "ppf", t0: 16.88, t1: 17.94, desde: 0.8, w: 1080, h: 1290 },
  { src: "recepcion", t0: 17.94, t1: 18.96, desde: 1.0, w: 1080, h: 1260 },
  { src: "disco", t0: 18.96, t1: 19.8, desde: 2, w: 1080, h: 1050 },
  { src: "hojalateria", t0: 19.8, t1: 22.3, desde: 0.3, w: 1080, h: 644 },
  { src: "mecanico", t0: 22.3, t1: 24.68, desde: 0.3, w: 1080, h: 1260 },
  { src: "grua", t0: 24.68, t1: FIN, desde: 0.2, w: 1080, h: 1260, vel: 0.85 },
];
const CORTES = PLANOS.slice(1).map((p) => p.t0);

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 200) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const PlanoTarjeta: React.FC<{ p: Plano; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const k = lim(l / (p.t1 - p.t0));
  const entra = Math.max(0, 1 - l / 0.2);
  const alto = Math.min(980, (980 * p.h) / p.w);
  const video = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile(`datofalso/${p.src}.mp4`)} muted playbackRate={p.vel ?? 1} startFrom={Math.round(p.desde * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", ...estilo }} />
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.4 + k * 0.08})`, filter: "blur(44px) brightness(0.45) saturate(1.3)" }}>{video({})}</AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 260 }}>
        <div style={{ width: 980, height: alto, borderRadius: 34, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)", transform: `translateY(${entra * 40}px) scale(${1 + 0.04 * entra})`, filter: `blur(${entra * entra * 8}px)` }}>
          {video({ transform: `scale(${1 + 0.08 * k})`, filter: "contrast(1.1) saturate(1.12)" })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const SFX: [number, string, number][] = [
  [T_CORTE - 0.1, "sfx/mixkit/fast-swipe-zoom.wav", 0.5],
  [T_CORTE, "sfx/kit/fahhh.mp3", 0.5],
  [12.64, "sfx/kit/magic.mp3", 0.55],
  [13.6, "sfx/kit/click.wav", 0.5],
  [16.9, "sfx/kit/click.wav", 0.5],
  [17.95, "sfx/kit/click.wav", 0.5],
  [18.97, "sfx/kit/click.wav", 0.5],
  [19.82, "sfx/kit/click.wav", 0.5],
  [22.3, "sfx/kit/shutter.mp3", 0.4],
  [24.68, "sfx/kit/magic.mp3", 0.5],
];

export const DatoBala: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enAnuncio = t >= T_CORTE;
  const estallido = lim(1 - Math.abs(t - T_CORTE) / 0.2);
  const sacude = t >= T_CORTE && t < T_CORTE + 0.4 ? Math.sin(t * 90) * 18 * (1 - (t - T_CORTE) / 0.4) : 0;
  const logo = resorte(frame, fps, 12.64, 12, 170);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 1. el video viral, tal cual (con su audio y marca de agua) */}
      <Sequence durationInFrames={Math.round(T_CORTE * fps) + 3}>
        <AbsoluteFill style={{ transformOrigin: "36% 50%", transform: `scale(${1 + 0.6 * lim((t - (T_CORTE - 0.3)) / 0.3) ** 2})` }}>
          <OffthreadVideo src={staticFile("datofalso/bala-anim.mp4")} muted style={{ width: "100%", height: "100%" }} />
        </AbsoluteFill>
      </Sequence>

      {/* 2. el comercial de Doctor Auto */}
      {enAnuncio ? (
        <AbsoluteFill style={{ transform: `translate(${sacude}px, ${sacude * 0.6}px)` }}>
          {PLANOS.map((p) => (
            <Sequence key={p.src} from={Math.round(p.t0 * fps)} durationInFrames={Math.round((p.t1 - p.t0) * fps)}>
              <PlanoTarjeta p={p} t={t} />
            </Sequence>
          ))}
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 72%, rgba(0,0,0,0.7) 100%)" }} />

          <AbsoluteFill style={{ alignItems: "center", paddingTop: 230 }}>
            <div style={{ width: 980 }}>
              {t >= 13.54 && t < 16.88 ? <TituloMascara texto="El mejor diagnóstico por escáner de la CDMX" resaltar={["escáner"]} t={t} t0={13.6} t1={16.75} tamano={84} /> : null}
              {t >= 16.88 && t < 17.94 ? <TituloMascara texto="Mucha calidad" resaltar={["calidad"]} t={t} t0={16.9} t1={17.85} tamano={110} /> : null}
              {t >= 17.94 && t < 18.96 ? <TituloMascara texto="Precio justo" resaltar={["justo"]} t={t} t0={17.95} t1={18.85} tamano={110} /> : null}
              {t >= 18.96 && t < 19.8 ? <TituloMascara texto="Frenos" resaltar={["Frenos"]} t={t} t0={18.97} t1={19.72} tamano={120} /> : null}
              {t >= 19.8 && t < 22.3 ? <TituloMascara texto="Hojalatería y pintura" resaltar={["pintura"]} t={t} t0={19.82} t1={22.2} tamano={96} /> : null}
              {t >= 22.3 && t < 24.68 ? <TituloMascara texto="Sucursales en toda la CDMX" resaltar={["CDMX"]} t={t} t0={22.3} t1={24.55} tamano={92} /> : null}
              {t >= 24.68 ? <TituloMascara texto="Agenda tu cita" resaltar={["cita"]} t={t} t0={24.68} t1={99} tamano={110} /> : null}
            </div>
          </AbsoluteFill>

          {/* golpe de marca */}
          {t >= 12.64 && t < 13.54 ? (
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 260 }}>
              <div style={{ transform: `scale(${interpolate(logo, [0, 1], [1.8, 1])})`, opacity: lim(logo * 2), background: DEGRADADO, padding: "12px 50px 22px", borderRadius: 26, fontFamily: ANTON, fontSize: 150, color: "#fff", boxShadow: "0 30px 90px rgba(204,35,40,0.7)" }}>DOCTOR AUTO</div>
            </AbsoluteFill>
          ) : null}
          {t >= 12.64 ? (
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: logo }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
                <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
              </div>
            </AbsoluteFill>
          ) : null}
          <ChipVidrio t={t} t0={25.4} t1={99} texto="📞 55 7823 3306 · doctorauto.com.mx" x={130} y={1560} tamano={40} />
          <AcabadoPremium frame={frame} calidez={0.8} />
        </AbsoluteFill>
      ) : null}

      {/* explosión de transición */}
      {estallido > 0 ? (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 36% 54%, rgba(255,255,255,${estallido}) 0%, rgba(255,230,190,${estallido}) ${15 + 35 * estallido}%, rgba(255,150,70,${estallido * 0.9}) ${35 + 40 * estallido}%, rgba(255,120,60,${estallido * 0.5}) ${60 + 40 * estallido}%, rgba(0,0,0,0) 100%)` }} />
      ) : null}

      <Audio src={staticFile("audio/datofalso/bala-audio.wav")} />
      <Sequence from={Math.round(T_VOZ * fps)}>
        <Audio src={staticFile("audio/datofalso/voz-bala.mp3")} />
      </Sequence>
      {/* música de comercial desde que se revela la marca */}
      <Sequence from={Math.round(12.6 * fps)}>
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => 0.14 * interpolate(f / fps, [0, 0.3, FIN - 12.6 - 0.8, FIN - 12.6], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={24}>
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
