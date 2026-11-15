import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// "Dato curioso falso con giro": narración de documental serio sobre un dato inventado
// (los carros se enferman y un mecánico inventó el escáner para preguntarles dónde les duele)
// con material real que Doctor Auto ya publicó, recortado para quitar los textos quemados.
const DUR_VOZ = 35.84;
const T_GIRO = 31.5;
export const DURACION_DATO_FALSO = Math.round((DUR_VOZ + 2.4) * 30);

// ancho y alto de cada recorte (public/datofalso), para dibujar la tarjeta con su proporción
type Plano = { src: string; t0: number; t1: number; desde: number; w: number; h: number; vel?: number; foco?: string };
const PLANOS: Plano[] = [
  { src: "motor", t0: 0, t1: 3.06, desde: 0.2, w: 1080, h: 540 },
  { src: "mecanico", t0: 3.06, t1: 6.16, desde: 0, w: 1080, h: 1260, vel: 0.95 },
  { src: "humo", t0: 6.16, t1: 8.32, desde: 0.5, w: 1080, h: 1214 },
  { src: "fiebre", t0: 8.32, t1: 11.1, desde: 1.6, w: 1080, h: 944 },
  { src: "disco", t0: 11.1, t1: 14.44, desde: 0.3, w: 1080, h: 1050 },
  { src: "calibrado", t0: 14.44, t1: 17.52, desde: 0, w: 1080, h: 1080, vel: 0.95 },
  { src: "escaner", t0: 17.52, t1: 23.24, desde: 0.5, w: 1080, h: 1186 },
  { src: "grua", t0: 23.24, t1: 24.9, desde: 0.3, w: 1080, h: 1260 },
  { src: "ppf", t0: 24.9, t1: 26.68, desde: 0.6, w: 1080, h: 1290 },
  { src: "recepcion", t0: 26.68, t1: 28.6, desde: 0.5, w: 1080, h: 1260 },
  { src: "cortinas", t0: 28.6, t1: T_GIRO, desde: 0.4, w: 1080, h: 976 },
];
const CORTES = PLANOS.slice(1).map((p) => p.t0);

// subtítulos de la narración (tiempos de whisper)
const FRASES: [number, string][] = [
  [0, "Dato curioso que casi nadie sabe."],
  [3.06, "Los carros… también se enferman."],
  [6.16, "Cuando tosen, es el escape."],
  [8.32, "Cuando les da fiebre, es el radiador."],
  [11.1, "Y cuando rechinan… es que ya les duele."],
  [14.44, "Por eso, en 1987,"],
  [17.52, "un mecánico chilango inventó un aparato"],
  [19.8, "para preguntarle al carro:"],
  [21.76, "¿dónde te duele?"],
  [23.24, "Le dijeron que estaba loco."],
  [24.9, "Que los carros no hablan."],
  [26.68, "Y como nunca tuvo título de médico…"],
  [28.68, "se lo puso al taller."],
  [31.6, "Bueno… el dato es falso."],
  [33.86, "Pero el escáner, sí es real."],
];

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 190) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const ALTO_MAX = 960;

// Tarjeta nítida con el recorte real sobre el mismo video desenfocado a pantalla completa.
const PlanoTarjeta: React.FC<{ p: Plano; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const k = lim(l / (p.t1 - p.t0));
  const entra = Math.max(0, 1 - l / 0.22);
  const alto = Math.min(ALTO_MAX, (980 * p.h) / p.w);
  const z = (1.0 + 0.1 * k) * (1 + 0.06 * entra);
  const video = (estilo: React.CSSProperties) => (
    <OffthreadVideo src={staticFile(`datofalso/${p.src}.mp4`)} muted playbackRate={p.vel ?? 1} startFrom={Math.round(p.desde * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", ...estilo }} />
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.4 + k * 0.08})`, filter: "blur(44px) brightness(0.42) saturate(1.2)" }}>{video({})}</AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 300 }}>
        <div style={{ width: 980, height: alto, borderRadius: 34, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)", transform: `translateY(${entra * 40}px)`, filter: `blur(${entra * entra * 8}px)` }}>
          {video({ transform: `scale(${z})`, objectPosition: p.foco ?? "50% 50%", filter: "contrast(1.1) saturate(1.12)" })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ texto: string; frame: number; fps: number; t0: number }> = ({ texto, frame, fps, t0 }) => (
  <div style={{ overflow: "hidden" }}>
    <div style={{ transform: `translateY(${(1 - resorte(frame, fps, t0)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, letterSpacing: "0.35em", color: "rgba(255,255,255,0.88)" }}>{texto}</div>
  </div>
);

// Sello que cae girado, con rebote.
const Sello: React.FC<{ texto: string; color: string; frame: number; fps: number; t0: number; giro: number }> = ({ texto, color, frame, fps, t0, giro }) => {
  const e = resorte(frame, fps, t0, 11, 260);
  if (frame < t0 * fps) return null;
  return (
    <div style={{ transform: `scale(${interpolate(e, [0, 1], [2.4, 1])}) rotate(${giro}deg)`, opacity: lim(e * 3), border: `10px solid ${color}`, borderRadius: 26, padding: "6px 36px 14px", fontFamily: ANTON, fontSize: 130, color, letterSpacing: "0.04em", textShadow: "0 8px 30px rgba(0,0,0,0.5)", boxShadow: `0 0 40px ${color}55, inset 0 0 30px ${color}33`, background: "rgba(0,0,0,0.35)" }}>
      {texto}
    </div>
  );
};

const SFX: [number, string, number][] = [
  [0.0, "sfx/kit/fahhh.mp3", 0.5],
  [3.1, "sfx/kit/click.wav", 0.5],
  [6.36, "sfx/kit/click.wav", 0.5],
  [8.9, "sfx/kit/click.wav", 0.5],
  [11.5, "sfx/ruidos/rechinido-frenos.wav", 0.35],
  [11.52, "sfx/kit/click.wav", 0.5],
  [14.6, "sfx/conteo.wav", 0.35],
  [21.7, "sfx/kit/magic.mp3", 0.45],
  [23.8, "sfx/kit/click.wav", 0.5],
  [25.0, "sfx/kit/click.wav", 0.5],
  [27.0, "sfx/kit/click.wav", 0.5],
  [29.6, "sfx/kit/magic.mp3", 0.6],
  [T_GIRO, "sfx/kit/shutter.mp3", 0.6],
  [32.9, "sfx/mitos/sello.wav", 0.7],
  [34.2, "sfx/kit/magic.mp3", 0.6],
  [35.4, "sfx/kit/click.wav", 0.5],
];

export const DatoFalso: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const enGiro = t >= T_GIRO;
  const marca = resorte(frame, fps, 0.1);
  const anio = Math.round(interpolate(t, [14.6, 15.8], [1900, 1987], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const flash = Math.max(0, 1 - Math.abs(t - T_GIRO) / 0.12);
  const frase = [...FRASES].reverse().find(([t0]) => t >= t0);
  const fraseT0 = frase ? frase[0] : 0;
  const entraFrase = resorte(frame, fps, fraseT0, 16, 240);
  const revelaMarca = resorte(frame, fps, 29.6, 12, 160);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {!enGiro
        ? PLANOS.map((p) => (
            <Sequence key={p.src} from={Math.round(p.t0 * fps)} durationInFrames={Math.round((p.t1 - p.t0) * fps)}>
              <PlanoTarjeta p={p} t={t} />
            </Sequence>
          ))
        : null}

      {enGiro ? (
        <>
          <AbsoluteFill style={{ filter: "blur(30px) brightness(0.3) grayscale(0.4)", transform: "scale(1.25)" }}>
            <Img src={staticFile("datofalso/cortinas-fin.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(204,35,40,0.3) 0%, rgba(0,0,0,0) 60%)" }} />
        </>
      ) : null}

      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.75) 100%)" }} />
      {!enGiro ? <Destello t={t} cortes={CORTES} /> : null}

      {/* títulos de arriba */}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 16 }}>
        {t < 3.06 ? (
          <>
            <Kicker texto="DATO CURIOSO" frame={frame} fps={fps} t0={0.1} />
            <div style={{ width: 960 }}>
              <TituloMascara texto="Lo que casi nadie sabe" resaltar={["nadie"]} t={t} t0={0.3} t1={2.9} tamano={92} />
            </div>
          </>
        ) : null}
        {t >= 3.06 && t < 6.16 ? (
          <div style={{ width: 960 }}>
            <TituloMascara texto="Los carros también se enferman" resaltar={["enferman"]} t={t} t0={3.1} t1={6.0} tamano={88} />
          </div>
        ) : null}
        {t >= 6.16 && t < 14.44 ? (
          <>
            <Kicker texto="SÍNTOMAS" frame={frame} fps={fps} t0={6.2} />
            <div style={{ width: 960 }}>
              {t < 8.32 ? <TituloMascara texto="Tos = escape" resaltar={["escape"]} t={t} t0={6.36} t1={8.2} tamano={110} /> : null}
              {t >= 8.32 && t < 11.1 ? <TituloMascara texto="Fiebre = radiador" resaltar={["radiador"]} t={t} t0={8.9} t1={11.0} tamano={110} /> : null}
              {t >= 11.1 ? <TituloMascara texto="Rechinido = dolor" resaltar={["dolor"]} t={t} t0={11.52} t1={14.3} tamano={110} /> : null}
            </div>
          </>
        ) : null}
        {t >= 14.44 && t < 17.52 ? (
          <>
            <Kicker texto="CIUDAD DE MÉXICO" frame={frame} fps={fps} t0={14.5} />
            <div style={{ fontFamily: ANTON, fontSize: 200, color: "#fff", lineHeight: 1, opacity: resorte(frame, fps, 14.55), fontVariantNumeric: "tabular-nums", textShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>{anio}</div>
          </>
        ) : null}
        {t >= 17.52 && t < 23.24 ? (
          <div style={{ width: 960 }}>
            <TituloMascara texto="Inventó un aparato para hablar con el carro" resaltar={["hablar"]} t={t} t0={17.7} t1={23.1} tamano={80} />
          </div>
        ) : null}
        {t >= 23.24 && t < 26.68 ? (
          <div style={{ width: 960 }}>
            {t < 24.9 ? <TituloMascara texto="«Estás loco»" resaltar={["loco»"]} t={t} t0={23.8} t1={24.8} tamano={120} /> : null}
            {t >= 24.9 ? <TituloMascara texto="«Los carros no hablan»" resaltar={["hablan»"]} t={t} t0={25.0} t1={26.55} tamano={100} /> : null}
          </div>
        ) : null}
        {t >= 26.68 && t < 29.5 ? (
          <div style={{ width: 960 }}>
            <TituloMascara texto="Nunca tuvo título de médico" resaltar={["médico"]} t={t} t0={27.0} t1={29.35} tamano={92} />
          </div>
        ) : null}
        {enGiro ? (
          <>
            <Kicker texto="BUENO…" frame={frame} fps={fps} t0={31.7} />
            <div style={{ width: 960 }}>
              <TituloMascara texto="Te mentimos tantito" resaltar={["tantito"]} t={t} t0={31.9} t1={99} tamano={96} />
            </div>
          </>
        ) : null}
      </AbsoluteFill>

      {/* burbuja: ¿dónde te duele? */}
      {t >= 21.76 && t < 23.24 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 300 }}>
          <div style={{ transform: `scale(${resorte(frame, fps, 21.76, 10, 220)}) rotate(-4deg)`, background: "#fff", color: "#111", fontFamily: ANTON, fontSize: 96, padding: "14px 44px 22px", borderRadius: 40, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", position: "relative" }}>
            ¿DÓNDE TE DUELE?
            <div style={{ position: "absolute", bottom: -34, left: 120, width: 0, height: 0, borderLeft: "26px solid transparent", borderRight: "26px solid transparent", borderTop: "40px solid #fff" }} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* revelación: el nombre del taller sobre las cortinas */}
      {t >= 29.6 && !enGiro ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 245 }}>
          <div style={{ transform: `scale(${interpolate(revelaMarca, [0, 1], [1.6, 1])})`, opacity: lim(revelaMarca * 2), background: DEGRADADO, padding: "10px 46px 20px", borderRadius: 24, fontFamily: ANTON, fontSize: 130, color: "#fff", letterSpacing: "0.02em", boxShadow: "0 30px 90px rgba(204,35,40,0.6)" }}>DOCTOR AUTO</div>
        </AbsoluteFill>
      ) : null}

      {/* el giro: sellos */}
      {enGiro ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 70, paddingTop: 120 }}>
          <Sello texto="DATO FALSO" color="#ff4d55" frame={frame} fps={fps} t0={32.9} giro={-6} />
          <Sello texto="ESCÁNER REAL ✓" color="#4ade80" frame={frame} fps={fps} t0={34.2} giro={4} />
        </AbsoluteFill>
      ) : null}
      <ChipVidrio t={t} t0={35.4} t1={99} texto="Diagnóstico por escáner en CDMX 🔧" x={150} y={1480} tamano={40} />

      {/* subtítulos */}
      {frase && !(t >= 21.76 && t < 23.24) ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: enGiro ? 230 : 150 }}>
          <div style={{ overflow: "hidden", maxWidth: 940 }}>
            <div style={{ transform: `translateY(${(1 - entraFrase) * 100}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 44, color: "#fff", textAlign: "center", lineHeight: 1.25, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>{frase[1]}</div>
          </div>
        </AbsoluteFill>
      ) : null}

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.8} />
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}

      <Audio src={staticFile("audio/datofalso/voz.mp3")} />
      <Audio
        src={staticFile("audio/datofalso/musica.mp3")}
        volume={(f) => {
          const s = f / fps;
          // música seria durante el "documental"; se corta de golpe en el giro
          if (s >= T_GIRO) return 0;
          return 0.2 * interpolate(s, [0, 0.5, 28.6, 29.6, T_GIRO - 0.05, T_GIRO], [0, 1, 1, 1.6, 1.6, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        }}
      />
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={24}>
          <Audio src={staticFile("sfx/kit/whoosh.wav")} volume={0.18} />
        </Sequence>
      ))}
      {SFX.map(([s, src, v], i) => (
        <Sequence key={i} from={Math.round(s * fps)} durationInFrames={90}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
