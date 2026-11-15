import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio } from "../doctor-auto/pro";

// Formato "anuncio escondido": la primera parte es el video viral de la animación
// (tanques con QR, con su audio y su marca de agua), sin ninguna pista de la marca.
// Justo donde el original explota hacia los chilaquiles, nuestra explosión lleva a
// Doctor Auto y la gente "se come" el comercial con material real de la empresa.
const T_CORTE = 9.95; // fin de la animación
const T_VOZ = 11.72; // termina el audio original ("…los lleva directamente")
const DUR_ANUNCIO = 10.29;
export const DURACION_DATO_ANUNCIO = Math.round((T_VOZ + DUR_ANUNCIO + 0.8) * 30);
const FIN = T_VOZ + DUR_ANUNCIO + 0.8;

type Plano = { src: string; t0: number; t1: number; desde: number; w: number; h: number; vel?: number };
const PLANOS: Plano[] = [
  { src: "cortinas", t0: T_CORTE, t1: T_VOZ, desde: 0.4, w: 1080, h: 976, vel: 0.85 },
  { src: "mecanico", t0: T_VOZ, t1: 14.5, desde: 0, w: 1080, h: 1260, vel: 1.0 },
  { src: "escaner", t0: 14.5, t1: 17.0, desde: 0.5, w: 1080, h: 1186 },
  { src: "disco", t0: 17.0, t1: 17.65, desde: 2, w: 1080, h: 1050 },
  { src: "hojalateria", t0: 17.65, t1: 18.9, desde: 0.5, w: 1080, h: 644 },
  { src: "recepcion", t0: 18.9, t1: 20.9, desde: 0.5, w: 1080, h: 1260 },
  { src: "grua", t0: 20.9, t1: FIN, desde: 0.2, w: 1080, h: 1260, vel: 0.9 },
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
  [T_CORTE - 0.05, "sfx/memes/boom.mp3", 0.6],
  [T_CORTE, "sfx/kit/fahhh.mp3", 0.5],
  [13.65, "sfx/kit/click.wav", 0.5],
  [14.5, "sfx/kit/magic.mp3", 0.55],
  [15.75, "sfx/kit/click.wav", 0.5],
  [17.09, "sfx/kit/click.wav", 0.5],
  [17.69, "sfx/kit/click.wav", 0.5],
  [18.93, "sfx/kit/shutter.mp3", 0.4],
  [21.05, "sfx/kit/magic.mp3", 0.5],
];

export const DatoAnuncio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enAnuncio = t >= T_CORTE;
  const estallido = lim(1 - Math.abs(t - T_CORTE) / 0.28);
  const sacude = t >= T_CORTE && t < T_CORTE + 0.4 ? Math.sin(t * 90) * 18 * (1 - (t - T_CORTE) / 0.4) : 0;
  const logo = resorte(frame, fps, 14.5, 12, 170);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 1. el video viral, tal cual (con su audio y marca de agua) */}
      <Sequence durationInFrames={Math.round(T_CORTE * fps) + 3}>
        <AbsoluteFill style={{ transform: `scale(${1 + 0.25 * lim((t - (T_CORTE - 0.25)) / 0.25)})` }}>
          <OffthreadVideo src={staticFile("datofalso/ref-anim.mp4")} muted style={{ width: "100%", height: "100%" }} />
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
              {t < T_VOZ ? <TituloMascara texto="Los lleva directamente" resaltar={["directamente"]} t={t} t0={10.8} t1={T_VOZ - 0.1} tamano={100} /> : null}
              {t >= T_VOZ && t < 13.6 ? <TituloMascara texto="con el doctor…" resaltar={["doctor…"]} t={t} t0={T_VOZ} t1={13.5} tamano={110} /> : null}
              {t >= 13.6 && t < 14.5 ? <TituloMascara texto="de su auto" resaltar={["auto"]} t={t} t0={13.65} t1={14.4} tamano={120} /> : null}
              {t >= 15.7 && t < 17.0 ? <TituloMascara texto="Diagnóstico por escáner" resaltar={["escáner"]} t={t} t0={15.75} t1={16.9} tamano={92} /> : null}
              {t >= 17.0 && t < 17.65 ? <TituloMascara texto="Frenos" resaltar={["Frenos"]} t={t} t0={17.05} t1={17.6} tamano={120} /> : null}
              {t >= 17.65 && t < 18.9 ? <TituloMascara texto="Hojalatería y pintura" resaltar={["pintura"]} t={t} t0={17.69} t1={18.8} tamano={96} /> : null}
              {t >= 18.9 && t < 20.9 ? <TituloMascara texto="Sucursales en toda la CDMX" resaltar={["CDMX"]} t={t} t0={18.93} t1={20.8} tamano={92} /> : null}
              {t >= 20.9 ? <TituloMascara texto="Agenda tu cita" resaltar={["cita"]} t={t} t0={21.05} t1={99} tamano={110} /> : null}
            </div>
          </AbsoluteFill>

          {/* golpe de marca */}
          {t >= 14.5 && t < 15.7 ? (
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 260 }}>
              <div style={{ transform: `scale(${interpolate(logo, [0, 1], [1.8, 1])})`, opacity: lim(logo * 2), background: DEGRADADO, padding: "12px 50px 22px", borderRadius: 26, fontFamily: ANTON, fontSize: 150, color: "#fff", boxShadow: "0 30px 90px rgba(204,35,40,0.7)" }}>DOCTOR AUTO</div>
            </AbsoluteFill>
          ) : null}
          {t >= 14.5 ? (
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: logo }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
                <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
              </div>
            </AbsoluteFill>
          ) : null}
          <ChipVidrio t={t} t0={21.3} t1={99} texto="📞 55 7823 3306 · doctorauto.com.mx" x={130} y={1560} tamano={40} />
          <AcabadoPremium frame={frame} calidez={0.8} />
        </AbsoluteFill>
      ) : null}

      {/* explosión de transición */}
      {estallido > 0 ? (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, rgba(255,255,255,${estallido}) 0%, rgba(255,214,90,${estallido}) ${15 + 35 * estallido}%, rgba(255,120,30,${estallido * 0.95}) ${35 + 40 * estallido}%, rgba(204,35,40,${estallido * 0.7}) ${60 + 40 * estallido}%, rgba(0,0,0,0) 100%)` }} />
      ) : null}

      <Audio src={staticFile("audio/datofalso/ref-audio.wav")} />
      <Sequence from={Math.round(T_VOZ * fps)}>
        <Audio src={staticFile("audio/datofalso/voz-anuncio-corta.wav")} />
      </Sequence>
      {/* música de comercial desde que se revela la marca */}
      <Sequence from={Math.round(14.4 * fps)}>
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => 0.14 * interpolate(f / fps, [0, 0.3, FIN - 14.4 - 0.8, FIN - 14.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
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
