import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio } from "../doctor-auto/pro";

// Anuncio escondido con el viral de las gotas de gasolina: la animación original con su voz
// hasta "…alrededor de todo el planeta casi 30 veces", y en vez de llegar a la colchonería,
// "…y llegar a Doctor Auto" con tomas del taller que no se usaron en La bala.
const T_CORTE = 26.4; // fin de la animación (el globo con "30x")
const T_VOZ = 26.4; // termina el audio original ("…casi 30 veces")
const DUR_ANUNCIO = 19.12;
export const DURACION_DATO_GAS = Math.round((T_VOZ + DUR_ANUNCIO + 0.6) * 30);
const FIN = T_VOZ + DUR_ANUNCIO + 0.6;

type Plano = { src: string; t0: number; t1: number; desde: number; w: number; h: number; vel?: number };
const PLANOS: Plano[] = [
  { src: "motor", t0: T_CORTE, t1: 27.9, desde: 0.3, w: 1080, h: 540 },
  { src: "calibrado", t0: 27.9, t1: 29.6, desde: 0.6, w: 1080, h: 1080 },
  { src: "guantes", t0: 29.6, t1: 32.6, desde: 0, w: 1080, h: 960, vel: 0.85 },
  { src: "caliper", t0: 32.6, t1: 34.4, desde: 0, w: 1080, h: 1060, vel: 0.74 },
  { src: "alinea", t0: 34.4, t1: 35.3, desde: 0, w: 1080, h: 1100 },
  { src: "manejo", t0: 35.3, t1: 38.9, desde: 0, w: 1080, h: 900, vel: 0.48 },
  { src: "logos", t0: 38.9, t1: 42.3, desde: 0, w: 1080, h: 780, vel: 0.5 },
  { src: "llegada", t0: 42.3, t1: FIN, desde: 0, w: 1080, h: 1230, vel: 0.7 },
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
  [26.9, "sfx/kit/magic.mp3", 0.55],
  [29.5, "sfx/kit/click.wav", 0.5],
  [33.76, "sfx/kit/click.wav", 0.5],
  [34.9, "sfx/kit/click.wav", 0.5],
  [36.8, "sfx/kit/click.wav", 0.5],
  [40.1, "sfx/kit/shutter.mp3", 0.4],
  [42.6, "sfx/kit/magic.mp3", 0.5],
];

export const DatoGas: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enAnuncio = t >= T_CORTE;
  const estallido = lim(1 - Math.abs(t - T_CORTE) / 0.2);
  const sacude = t >= T_CORTE && t < T_CORTE + 0.4 ? Math.sin(t * 90) * 18 * (1 - (t - T_CORTE) / 0.4) : 0;
  const logo = resorte(frame, fps, 26.9, 12, 170);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* 1. el video viral, tal cual (con su audio y marca de agua) */}
      <Sequence durationInFrames={Math.round(T_CORTE * fps) + 3}>
        <AbsoluteFill style={{ transformOrigin: "50% 45%", transform: `scale(${1 + 0.6 * lim((t - (T_CORTE - 0.3)) / 0.3) ** 2})` }}>
          <OffthreadVideo src={staticFile("datofalso/gas-anim.mp4")} muted style={{ width: "100%", height: "100%" }} />
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
              {t >= 27.9 && t < 29.6 ? <TituloMascara texto="El mejor diagnóstico" resaltar={["diagnóstico"]} t={t} t0={29.4} t1={29.55} tamano={100} /> : null}
              {t >= 29.6 && t < 32.6 ? <TituloMascara texto="Mejores precios y el mejor servicio" resaltar={["servicio"]} t={t} t0={30.4} t1={32.5} tamano={92} /> : null}
              {t >= 32.6 && t < 34.4 ? <TituloMascara texto="Frenos y ajuste de motor" resaltar={["Frenos"]} t={t} t0={33.7} t1={34.3} tamano={96} /> : null}
                            {t >= 35.3 && t < 36.7 ? <TituloMascara texto="Alineación y balanceo" resaltar={["balanceo"]} t={t} t0={35.4} t1={36.6} tamano={96} /> : null}
              {t >= 36.7 && t < 38.9 ? <TituloMascara texto="Para que tu auto ande de maravilla" resaltar={["maravilla"]} t={t} t0={36.8} t1={38.8} tamano={90} /> : null}
              {t >= 38.9 && t < 42.3 ? <TituloMascara texto="Taller certificado para aseguradoras" resaltar={["aseguradoras"]} t={t} t0={40.1} t1={42.2} tamano={88} /> : null}
              {t >= 42.3 ? <TituloMascara texto="Te esperamos en nuestras sucursales" resaltar={["sucursales"]} t={t} t0={42.6} t1={99} tamano={90} /> : null}
            </div>
          </AbsoluteFill>

          {/* golpe de marca */}
          {t >= 26.9 && t < 27.9 ? (
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 260 }}>
              <div style={{ transform: `scale(${interpolate(logo, [0, 1], [1.8, 1])})`, opacity: lim(logo * 2), background: DEGRADADO, padding: "12px 50px 22px", borderRadius: 26, fontFamily: ANTON, fontSize: 150, color: "#fff", boxShadow: "0 30px 90px rgba(204,35,40,0.7)" }}>DOCTOR AUTO</div>
            </AbsoluteFill>
          ) : null}
          {t >= 26.9 ? (
            <AbsoluteFill style={{ alignItems: "center", paddingTop: 140 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: logo }}>
                <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
                <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
              </div>
            </AbsoluteFill>
          ) : null}
          <ChipVidrio t={t} t0={43.6} t1={99} texto="📞 55 7823 3306 · doctorauto.com.mx" x={130} y={1560} tamano={40} />
          <AcabadoPremium frame={frame} calidez={0.8} />
        </AbsoluteFill>
      ) : null}

      {/* explosión de transición */}
      {estallido > 0 ? (
        <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,${estallido}) 0%, rgba(255,230,190,${estallido}) ${15 + 35 * estallido}%, rgba(255,150,70,${estallido * 0.9}) ${35 + 40 * estallido}%, rgba(255,120,60,${estallido * 0.5}) ${60 + 40 * estallido}%, rgba(0,0,0,0) 100%)` }} />
      ) : null}

      <Audio src={staticFile("audio/datofalso/gas-audio.wav")} />
      <Sequence from={Math.round(T_VOZ * fps)}>
        <Audio src={staticFile("audio/datofalso/voz-gas.mp3")} />
      </Sequence>
      {/* música de comercial desde que se revela la marca */}
      <Sequence from={Math.round(26.8 * fps)}>
        <Audio src={staticFile("sfx/memes/musica.mp3")} volume={(f) => 0.14 * interpolate(f / fps, [0, 0.3, FIN - 26.8 - 0.8, FIN - 26.8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
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
