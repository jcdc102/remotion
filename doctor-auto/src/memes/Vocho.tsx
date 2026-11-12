import { AbsoluteFill, Audio, Img, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// Dato curioso del último Vocho, estilo documental premium: fotos reales con movimiento,
// tarjetas con fondo desenfocado, contador de años, fecha y cifra animadas.
const DUR_VOZ = 29.2;
const DUR_REMATE = 3.0;
export const DURACION_VOCHO = Math.round((DUR_VOZ + DUR_REMATE) * 30);

type Plano =
  | { tipo: "foto"; src: string; t0: number; t1: number; zoom: [number, number]; pan: [number, number]; bn?: boolean }
  | { tipo: "video"; src: string; t0: number; t1: number; desde: number; zoom: [number, number]; pos: string };

const PLANOS: Plano[] = [
  { tipo: "foto", src: "vocho/taxi-cdmx.jpg", t0: 0, t1: 3.5, zoom: [1.0, 1.12], pan: [-20, 20] },
  { tipo: "foto", src: "vocho/taxco.jpg", t0: 3.5, t1: 10.3, zoom: [1.0, 1.15], pan: [30, -30], bn: true },
  { tipo: "foto", src: "vocho/taxis-taxco.jpg", t0: 10.3, t1: 11.9, zoom: [1.02, 1.1], pan: [20, -10] },
  { tipo: "foto", src: "vocho/vocho-mexico.jpg", t0: 11.9, t1: 13.3, zoom: [1.02, 1.1], pan: [-20, 10] },
  { tipo: "video", src: "mixkit/42113.mp4", t0: 13.3, t1: 16.2, desde: 1, zoom: [1.05, 1.15], pos: "50% 50%" },
  { tipo: "foto", src: "vocho/ultima-1.jpg", t0: 16.2, t1: 22.2, zoom: [1.0, 1.16], pan: [10, -20] },
  { tipo: "video", src: "mixkit/2074.mp4", t0: 22.2, t1: 25.8, desde: 3, zoom: [1.05, 1.18], pos: "50% 50%" },
  { tipo: "foto", src: "vocho/cozumel.jpg", t0: 25.8, t1: DUR_VOZ, zoom: [1.0, 1.1], pan: [0, -30] },
];
const CORTES = PLANOS.slice(1).map((p) => p.t0);

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 190) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

// Foto apaisada: fondo desenfocado a pantalla completa + tarjeta nítida con sombra y movimiento.
const PlanoFoto: React.FC<{ p: Extract<Plano, { tipo: "foto" }>; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const d = p.t1 - p.t0;
  const k = lim(l / d);
  const entra = Math.max(0, 1 - l / 0.22);
  const z = interpolate(k, [0, 1], p.zoom) * (1 + 0.06 * entra);
  const x = interpolate(k, [0, 1], p.pan);
  const filtro = p.bn ? "grayscale(1) contrast(1.15) sepia(0.15)" : "contrast(1.08) saturate(1.1)";
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.35 + k * 0.1})`, filter: `blur(40px) brightness(0.45) ${filtro}` }}>
        <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 330 }}>
        <div style={{ width: 980, height: 1020, borderRadius: 34, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)", transform: `translateY(${entra * 40}px)`, filter: `blur(${entra * entra * 8}px)` }}>
          <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z}) translateX(${x}px)`, filter: filtro }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PlanoVideo: React.FC<{ p: Extract<Plano, { tipo: "video" }>; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const entra = Math.max(0, 1 - l / 0.2);
  const z = interpolate(l, [0, p.t1 - p.t0], p.zoom, { extrapolateRight: "clamp" }) * (1 + 0.08 * entra);
  return (
    <AbsoluteFill style={{ transform: `scale(${z})`, filter: `blur(${entra * entra * 10}px) contrast(1.1) saturate(1.1) brightness(0.8)` }}>
      <OffthreadVideo src={staticFile(p.src)} muted startFrom={Math.round(p.desde * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos }} />
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ texto: string; frame: number; fps: number; t0: number }> = ({ texto, frame, fps, t0 }) => (
  <div style={{ overflow: "hidden" }}>
    <div style={{ transform: `translateY(${(1 - resorte(frame, fps, t0)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, letterSpacing: "0.35em", color: "rgba(255,255,255,0.88)" }}>{texto}</div>
  </div>
);

export const Vocho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fin = Math.round(DUR_VOZ * fps);
  const enRemate = frame >= fin;
  const marca = resorte(frame, fps, 0.1);
  const anio = Math.round(interpolate(t, [4.0, 9.6], [1967, 2003], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const avance = lim((t - 4.0) / 5.6);
  const cifra = Math.round(interpolate(t, [23.6, 25.2], [0, 21529464], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {!enRemate
        ? PLANOS.map((p, i) => (
            <Sequence key={i} from={Math.round(p.t0 * fps)} durationInFrames={Math.round((p.t1 - p.t0) * fps)}>
              {p.tipo === "foto" ? <PlanoFoto p={p} t={t} /> : <PlanoVideo p={p} t={t} />}
            </Sequence>
          ))
        : null}

      {/* película antigua sobre la etapa de 1967 */}
      {t >= 3.5 && t < 10.3 ? (
        <AbsoluteFill style={{ mixBlendMode: "screen", opacity: 0.35 }}>
          <OffthreadVideo src={staticFile("mixkit/26656.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}

      {!enRemate ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.7) 100%)" }} /> : null}
      {!enRemate ? <Destello t={t} cortes={CORTES} /> : null}

      {/* 1. gancho */}
      {t < 3.5 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 16 }}>
          <Kicker texto="¿SABÍAS QUE...?" frame={frame} fps={fps} t0={0.1} />
          <div style={{ width: 960 }}>
            <TituloMascara texto="El último Vocho del mundo se hizo en México" resaltar={["México"]} t={t} t0={0.3} t1={3.3} tamano={86} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 2. contador de años */}
      {t >= 3.5 && t < 10.3 ? (
        <>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 16 }}>
            <Kicker texto="PLANTA VOLKSWAGEN · PUEBLA" frame={frame} fps={fps} t0={3.6} />
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
            <div style={{ fontFamily: ANTON, fontSize: 240, color: "#fff", lineHeight: 1, opacity: resorte(frame, fps, 3.8), textShadow: "0 20px 60px rgba(0,0,0,0.6)", fontVariantNumeric: "tabular-nums" }}>{anio}</div>
            <div style={{ width: 760, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.2)", marginTop: 20, overflow: "hidden" }}>
              <div style={{ width: `${avance * 100}%`, height: "100%", background: DEGRADADO, boxShadow: "0 0 20px rgba(204,35,40,0.8)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", width: 760, marginTop: 14, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.75)" }}>
              <span>1967</span>
              <span>+35 AÑOS</span>
              <span>2003</span>
            </div>
          </AbsoluteFill>
        </>
      ) : null}

      {/* 3. taxi, familia, primer auto */}
      {t >= 10.3 && t < 16.2 ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
          <div style={{ width: 980, display: "flex", justifyContent: "center" }}>
            {t < 11.9 ? <TituloMascara texto="Fue taxi" resaltar={["taxi"]} t={t} t0={10.4} t1={11.75} tamano={130} /> : null}
            {t >= 11.9 && t < 13.3 ? <TituloMascara texto="Carro de la familia" resaltar={["familia"]} t={t} t0={11.95} t1={13.15} tamano={110} /> : null}
            {t >= 13.3 ? <TituloMascara texto="El primer auto de millones de mexicanos" resaltar={["mexicanos"]} t={t} t0={13.4} t1={16.0} tamano={92} /> : null}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 4. fecha y Última Edición */}
      {t >= 16.2 && t < 22.2 ? (
        <>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 18 }}>
            <Kicker texto="FIN DE UNA ERA" frame={frame} fps={fps} t0={16.3} />
            <div style={{ display: "flex", gap: 16 }}>
              {["30", "07", "2003"].map((x, i) => {
                const e = resorte(frame, fps, 16.5 + i * 0.18, 12);
                return (
                  <div key={x} style={{ overflow: "hidden", borderRadius: 18 }}>
                    <div style={{ transform: `translateY(${(1 - e) * 110}%)`, background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.25)", borderRadius: 18, padding: "8px 26px 14px", fontFamily: ANTON, fontSize: 110, color: "#fff" }}>{x}</div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
            <div style={{ width: 960, display: "flex", justifyContent: "center" }}>
              <TituloMascara texto="Última Edición" resaltar={["Edición"]} t={t} t0={20.6} t1={22.0} tamano={130} />
            </div>
          </AbsoluteFill>
        </>
      ) : null}

      {/* 5. cifra total */}
      {t >= 22.2 && t < 25.8 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 20 }}>
          <Kicker texto="FABRICADOS EN EL MUNDO" frame={frame} fps={fps} t0={22.4} />
          <div style={{ fontFamily: ANTON, fontSize: 170, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 20px 60px rgba(0,0,0,0.6)", opacity: resorte(frame, fps, 23.4) }}>{cifra.toLocaleString("es-MX")}</div>
          <div style={{ height: 10, width: `${lim((t - 23.6) / 1.6) * 640}px`, background: DEGRADADO, borderRadius: 5, boxShadow: "0 0 20px rgba(204,35,40,0.8)" }} />
        </AbsoluteFill>
      ) : null}

      {/* 6. pregunta */}
      {t >= 25.8 && !enRemate ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
          <div style={{ width: 960 }}>
            <TituloMascara texto="¿Tu familia tuvo uno?" resaltar={["uno?"]} t={t} t0={25.9} t1={29.1} tamano={100} />
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= 27.6 && !enRemate ? <ChipVidrio t={t} t0={27.6} t1={29.15} texto="Cuéntanos en los comentarios 👇" x={200} y={1500} tamano={40} /> : null}

      {/* remate */}
      <Sequence from={fin}>
        <AbsoluteFill style={{ filter: "blur(26px) brightness(0.35) grayscale(0.3)", transform: "scale(1.2)" }}>
          <Img src={staticFile("vocho/ultima-1.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.35) 0%, rgba(0,0,0,0) 60%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
          <Kicker texto="DE CUALQUIER AÑO" frame={frame} fps={fps} t0={DUR_VOZ + 0.1} />
          <div style={{ width: 920 }}>
            <TituloMascara texto="Tu auto merece al Doctor" resaltar={["Doctor"]} t={t} t0={DUR_VOZ + 0.3} t1={99} tamano={100} />
          </div>
        </AbsoluteFill>
        <ChipVidrio t={t} t0={DUR_VOZ + 0.9} t1={99} texto="Sucursales en CDMX 🔧" x={300} y={1300} tamano={40} />
      </Sequence>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.9} />

      <Sequence durationInFrames={fin}>
        <Audio src={staticFile("audio/vocho/voz.wav")} />
      </Sequence>
      <Audio
        src={staticFile("audio/vocho/musica.mp3")}
        volume={(f) => {
          const s = f / fps;
          const bajo = s < DUR_VOZ ? 0.13 : 0.3;
          return bajo * interpolate(s, [0, 0.6, DUR_VOZ + DUR_REMATE - 1.2, DUR_VOZ + DUR_REMATE], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        }}
      />
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={20}>
          <Audio src={staticFile("sfx/mk-whoosh-slide.wav")} volume={0.1} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
