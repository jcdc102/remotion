import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, Estudio, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// Serie "Autos que hicieron historia en México" #3: el Tsuru. Mismo lenguaje que el Vocho:
// fotos reales en tarjeta con fondo desenfocado, contadores y fechas animadas.
// Fotos: JLaw45 (CC BY 2.0) y dave_7 (CC BY-SA 2.0), Flickr.
const DUR_VOZ = 29.85;
const DUR_REMATE = 3.0;
export const DURACION_TSURU = Math.round((DUR_VOZ + DUR_REMATE) * 30);

type Foto = { src: string; t0: number; t1: number; zoom: [number, number]; pan: [number, number]; bn?: boolean };
const FOTOS: Foto[] = [
  { src: "tsuru/d.jpg", t0: 0, t1: 4.84, zoom: [1.0, 1.14], pan: [-20, 20] },
  { src: "tsuru/c.jpg", t0: 4.84, t1: 8.46, zoom: [1.0, 1.15], pan: [30, -30], bn: true },
  { src: "tsuru/f.jpg", t0: 8.46, t1: 9.76, zoom: [1.04, 1.12], pan: [20, -10] },
  { src: "tsuru/b.jpg", t0: 9.76, t1: 10.82, zoom: [1.04, 1.12], pan: [-20, 10] },
  { src: "tsuru/e.jpg", t0: 10.82, t1: 12.6, zoom: [1.02, 1.12], pan: [10, -20] },
];
const MOSAICO = ["tsuru/b.jpg", "tsuru/c.jpg", "tsuru/d.jpg", "tsuru/e.jpg", "tsuru/f.jpg"];
const CORTES = [4.84, 8.46, 9.76, 10.82, 12.6, 14.38, 16.64, 21.92, 26.7];

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 190) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const PlanoFoto: React.FC<{ p: Foto; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const k = lim(l / (p.t1 - p.t0));
  const entra = Math.max(0, 1 - l / 0.22);
  const z = interpolate(k, [0, 1], p.zoom) * (1 + 0.06 * entra);
  const x = interpolate(k, [0, 1], p.pan);
  const filtro = p.bn ? "grayscale(1) contrast(1.15) sepia(0.25)" : "contrast(1.08) saturate(1.1)";
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.35 + k * 0.1})`, filter: `blur(40px) brightness(0.45) ${filtro}` }}>
        <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 200 }}>
        <div style={{ width: 980, height: 900, borderRadius: 34, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 0 2px rgba(255,255,255,0.12)", transform: `translateY(${entra * 40}px)`, filter: `blur(${entra * entra * 8}px)` }}>
          <Img src={staticFile(p.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${z}) translateX(${x}px)`, filter: filtro }} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Kicker: React.FC<{ texto: string; frame: number; fps: number; t0: number }> = ({ texto, frame, fps, t0 }) => (
  <div style={{ overflow: "hidden" }}>
    <div style={{ transform: `translateY(${(1 - resorte(frame, fps, t0)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, letterSpacing: "0.35em", color: "rgba(255,255,255,0.88)", textAlign: "center" }}>{texto}</div>
  </div>
);

// Silueta simple de sedán 3 volúmenes para los gráficos.
const Sedan: React.FC<{ color: string; ancho: number }> = ({ color, ancho }) => (
  <svg width={ancho} height={ancho * 0.38} viewBox="0 0 400 150">
    <path d="M20 112 L28 86 Q34 74 60 72 L110 68 L150 36 Q160 28 180 28 L262 30 Q280 31 292 44 L318 70 L368 76 Q384 80 384 96 L384 112 Z" fill={color} />
    <path d="M122 68 L156 40 L206 38 L206 68 Z M216 38 L268 38 Q276 39 282 46 L304 68 L216 68 Z" fill="rgba(190,225,255,0.85)" />
    <circle cx="98" cy="114" r="26" fill="#15161a" />
    <circle cx="98" cy="114" r="12" fill="#9aa0ab" />
    <circle cx="312" cy="114" r="26" fill="#15161a" />
    <circle cx="312" cy="114" r="12" fill="#9aa0ab" />
  </svg>
);

export const Tsuru: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fin = Math.round(DUR_VOZ * fps);
  const enRemate = frame >= fin;
  const marca = resorte(frame, fps, 0.1);
  const cifra = Math.round(interpolate(t, [14.6, 16.0], [0, 2000000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const anio = Math.round(interpolate(t, [16.9, 18.3], [1984, 2017], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const sello = resorte(frame, fps, 19.3, 9, 260);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {FOTOS.map((p) => (
        <Sequence key={p.src} from={Math.round(p.t0 * fps)} durationInFrames={Math.round((p.t1 - p.t0) * fps)}>
          <PlanoFoto p={p} t={t} />
        </Sequence>
      ))}
      {t >= 12.6 && t < 14.38 ? <Estudio t={t} tono={["#0d2a1a", "#040806"]} acento="#2fbf6a" /> : null}
      {t >= 14.38 && t < 16.64 ? <Estudio t={t} tono={["#1a0b10", "#050507"]} acento={ROJO_DA} /> : null}
      {t >= 16.64 && t < 21.92 ? <Estudio t={t} tono={["#16161c", "#050507"]} acento={ROJO_DA} /> : null}
      {t >= 21.92 && t < 26.7 ? (
        <AbsoluteFill style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr 1fr", gap: 8, padding: 8 }}>
          {[...MOSAICO, null].map((src, i) => {
            const e = resorte(frame, fps, 21.95 + i * 0.12, 13);
            return (
              <div key={i} style={{ borderRadius: 18, overflow: "hidden", transform: `scale(${e})`, background: src ? undefined : DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {src ? <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.75)", transform: `scale(${1.05 + 0.05 * Math.sin(t + i)})` }} /> : <div style={{ fontFamily: ANTON, fontSize: 110, color: "#fff" }}>TSURU</div>}
              </div>
            );
          })}
        </AbsoluteFill>
      ) : null}
      {t >= 26.7 && !enRemate ? <Estudio t={t} tono={["#1a0b10", "#050507"]} acento={ROJO_DA} /> : null}

      {!enRemate ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.7) 100%)" }} /> : null}
      {!enRemate ? <Destello t={t} cortes={CORTES} /> : null}

      {/* 1. gancho */}
      {t < 4.84 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 16 }}>
          <Kicker texto="AUTOS QUE HICIERON HISTORIA" frame={frame} fps={fps} t0={0.1} />
          <div style={{ width: 960 }}>
            <TituloMascara texto="El Tsuru: rey de las calles por 30 años" resaltar={["rey"]} t={t} t0={0.3} t1={4.7} tamano={88} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 2. llegada */}
      {t >= 4.84 && t < 8.46 ? (
        <>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
            <Kicker texto="HECHO EN MORELOS" frame={frame} fps={fps} t0={4.95} />
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
            <div style={{ fontFamily: ANTON, fontSize: 260, color: "#fff", lineHeight: 1, transform: `scale(${0.7 + 0.3 * resorte(frame, fps, 5.3, 10)})`, opacity: resorte(frame, fps, 5.3), textShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>1984</div>
          </AbsoluteFill>
        </>
      ) : null}

      {/* 3. papeles */}
      {t >= 8.46 && t < 12.6 ? (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
          <div style={{ width: 980, display: "flex", justifyContent: "center" }}>
            {t < 9.76 ? <TituloMascara texto="Taxi" resaltar={["Taxi"]} t={t} t0={8.5} t1={9.7} tamano={150} /> : null}
            {t >= 9.76 && t < 10.82 ? <TituloMascara texto="Patrulla" resaltar={["Patrulla"]} t={t} t0={9.78} t1={10.78} tamano={150} /> : null}
            {t >= 10.82 ? <TituloMascara texto="Auto de escuela de manejo" resaltar={["escuela"]} t={t} t0={10.85} t1={12.5} tamano={100} /> : null}
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= 12.6 && t < 14.38 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", width: 900, justifyContent: "center" }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const e = resorte(frame, fps, 12.65 + i * 0.1, 12);
              return (
                <div key={i} style={{ transform: `translateY(${(1 - e) * 80}px)`, opacity: e }}>
                  <Sedan color={i % 3 === 0 ? "#2fbf6a" : i % 3 === 1 ? "#f2f2f2" : "#d7262c"} ancho={270} />
                </div>
              );
            })}
          </div>
          <div style={{ width: 960 }}>
            <TituloMascara texto="El primer auto de medio país" resaltar={["primer"]} t={t} t0={12.7} t1={14.3} tamano={96} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 4. cifra */}
      {t >= 14.38 && t < 16.64 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 20 }}>
          <Kicker texto="UNIDADES VENDIDAS" frame={frame} fps={fps} t0={14.45} />
          <div style={{ fontFamily: ANTON, fontSize: 190, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>+{cifra.toLocaleString("es-MX")}</div>
          <div style={{ height: 10, width: `${lim((t - 14.6) / 1.4) * 700}px`, background: DEGRADADO, borderRadius: 5, boxShadow: "0 0 20px rgba(204,35,40,0.8)" }} />
        </AbsoluteFill>
      ) : null}

      {/* 5. fin de producción */}
      {t >= 16.64 && t < 21.92 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
          <Kicker texto="FIN DE PRODUCCIÓN" frame={frame} fps={fps} t0={16.7} />
          <div style={{ fontFamily: ANTON, fontSize: 240, color: "#fff", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{anio}</div>
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,0.8)", opacity: resorte(frame, fps, 18.4) }}>33 AÑOS FABRICÁNDOSE</div>
          <div style={{ marginTop: 40, transform: `scale(${interpolate(sello, [0, 1], [2.4, 1])}) rotate(-8deg)`, opacity: lim(sello * 3), border: "10px solid #ff4d55", borderRadius: 20, padding: "6px 30px 14px", fontFamily: ANTON, fontSize: 84, color: "#ff4d55", textAlign: "center", lineHeight: 1.05 }}>
            NUEVAS NORMAS
            <br />
            DE SEGURIDAD
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 6. jubilado */}
      {t >= 21.92 && t < 26.7 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 960, background: "rgba(0,0,0,0.55)", borderRadius: 30, padding: "30px 0" }}>
            {t < 24.5 ? <TituloMascara texto="No se murió… se jubiló" resaltar={["jubiló"]} t={t} t0={22.0} t1={24.4} tamano={100} /> : <TituloMascara texto="Lo ves en cada esquina" resaltar={["esquina"]} t={t} t0={24.55} t1={26.6} tamano={100} />}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 7. pregunta */}
      {t >= 26.7 && !enRemate ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
          <Sedan color="#2fbf6a" ancho={700} />
          <div style={{ width: 960 }}>
            <TituloMascara texto="¿Tuviste uno… o te subiste de taxi?" resaltar={["taxi?"]} t={t} t0={26.75} t1={29.8} tamano={92} />
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= 27.4 && !enRemate ? <ChipVidrio t={t} t0={27.4} t1={29.8} texto="Cuéntanos en los comentarios 👇" x={200} y={1500} tamano={40} /> : null}

      {/* remate */}
      <Sequence from={fin}>
        <AbsoluteFill style={{ filter: "blur(26px) brightness(0.35)", transform: "scale(1.2)" }}>
          <Img src={staticFile("tsuru/d.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.35) 0%, rgba(0,0,0,0) 60%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
          <Kicker texto="TODAVÍA DA GUERRA" frame={frame} fps={fps} t0={DUR_VOZ + 0.1} />
          <div style={{ width: 920 }}>
            <TituloMascara texto="Que el Doctor lo mantenga así" resaltar={["Doctor"]} t={t} t0={DUR_VOZ + 0.3} t1={99} tamano={96} />
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
        <Audio src={staticFile("audio/tsuru/voz.wav")} />
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
      {([[0, "sfx/kit/fahhh.mp3", 0.4], [5.3, "sfx/mk-hit.wav", 0.4], [14.6, "sfx/mk-hit.wav", 0.4], [19.3, "sfx/hit.wav", 0.45], [22.0, "sfx/memes/boing.mp3", 0.25], [DUR_VOZ, "sfx/kit/magic.mp3", 0.5]] as [number, string, number][]).map(([s, src, v], i) => (
        <Sequence key={i} from={Math.round(s * fps)} durationInFrames={75}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
