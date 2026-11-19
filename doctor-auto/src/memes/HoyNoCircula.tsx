import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, Estudio, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// Serie "Autos que hicieron historia en México" #2: el Hoy No Circula cumple 37 años.
// Mismo lenguaje que el Vocho: fotos reales en tarjeta sobre fondo desenfocado,
// fechas y cifras animadas, pregunta al final y remate de marca.
const DUR_VOZ = 34.24;
const DUR_REMATE = 3.2;
export const DURACION_HOY_NO_CIRCULA = Math.round((DUR_VOZ + DUR_REMATE) * 30);

type Plano = { src: string; t0: number; t1: number; zoom: [number, number]; pan: [number, number]; bn?: boolean };
const PLANOS: Plano[] = [
  { src: "hnc/insurgentes.jpg", t0: 0, t1: 3.8, zoom: [1.0, 1.12], pan: [-20, 20] },
  { src: "hnc/smog1985.jpg", t0: 3.8, t1: 10.9, zoom: [1.0, 1.18], pan: [20, -20] },
  { src: "hnc/cielo2019.jpg", t0: 15.0, t1: 20.8, zoom: [1.0, 1.14], pan: [15, -15] },
];
const CORTES = [3.8, 10.9, 15.0, 20.8];

// colores del engomado por día (terminación de placa)
const DIAS = [
  { dia: "LUNES", color: "#f5c518", tinta: "#1a1400", placas: "5 y 6", t: 21.6 },
  { dia: "MARTES", color: "#ff6fae", tinta: "#2a0016", placas: "7 y 8", t: 23.46 },
  { dia: "MIÉRCOLES", color: "#e53935", tinta: "#ffffff", placas: "3 y 4", t: 25.34 },
  { dia: "JUEVES", color: "#2fb35a", tinta: "#ffffff", placas: "1 y 2", t: 27.2 },
  { dia: "VIERNES", color: "#2f6fe0", tinta: "#ffffff", placas: "9 y 0", t: 29.02 },
];

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 14, stiffness = 190) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const PlanoFoto: React.FC<{ p: Plano; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const k = lim(l / (p.t1 - p.t0));
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

const Kicker: React.FC<{ texto: string; frame: number; fps: number; t0: number }> = ({ texto, frame, fps, t0 }) => (
  <div style={{ overflow: "hidden" }}>
    <div style={{ transform: `translateY(${(1 - resorte(frame, fps, t0)) * 110}%)`, fontFamily: POPPINS, fontWeight: 700, fontSize: 30, letterSpacing: "0.35em", color: "rgba(255,255,255,0.88)" }}>{texto}</div>
  </div>
);

// Silueta de auto vectorial (vista lateral).
const Auto: React.FC<{ color: string; ancho: number }> = ({ color, ancho }) => (
  <svg width={ancho} height={ancho * 0.45} viewBox="0 0 200 90">
    <path d="M10 62 Q12 44 34 40 L62 20 Q70 14 84 14 L128 14 Q140 14 148 22 L168 40 Q190 43 192 62 L192 70 L10 70 Z" fill={color} />
    <path d="M70 24 L84 20 L118 20 L118 40 L56 40 Z M126 20 L140 22 L156 40 L126 40 Z" fill="rgba(255,255,255,0.35)" />
    <circle cx="52" cy="70" r="15" fill="#111" stroke="#ddd" strokeWidth="4" />
    <circle cx="152" cy="70" r="15" fill="#111" stroke="#ddd" strokeWidth="4" />
  </svg>
);

const SFX: [number, string, number][] = [
  [0.05, "sfx/kit/whoosh.wav", 0.25],
  [4.4, "sfx/kit/click.wav", 0.5],
  [4.6, "sfx/kit/click.wav", 0.5],
  [4.8, "sfx/kit/click.wav", 0.5],
  [8.3, "sfx/kit/click.wav", 0.45],
  [13.98, "sfx/mk-error.wav", 0.25],
  [15.84, "sfx/mitos/sello.wav", 0.6],
  ...DIAS.map((d): [number, string, number] => [d.t, "sfx/kit/click.wav", 0.5]),
  [30.9, "sfx/kit/magic.mp3", 0.45],
  [DUR_VOZ, "sfx/kit/shutter.mp3", 0.45],
  [DUR_VOZ + 0.4, "sfx/kit/magic.mp3", 0.5],
];

export const HoyNoCircula: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fin = Math.round(DUR_VOZ * fps);
  const enRemate = frame >= fin;
  const marca = resorte(frame, fps, 0.1);
  const anios = Math.round(interpolate(t, [18.0, 19.4], [1990, 2026], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const flash = Math.max(0, 1 - Math.abs(t - DUR_VOZ) / 0.12);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {!enRemate
        ? PLANOS.map((p) => (
            <Sequence key={p.src} from={Math.round(p.t0 * fps)} durationInFrames={Math.round((p.t1 - p.t0) * fps)}>
              <PlanoFoto p={p} t={t} />
            </Sequence>
          ))
        : null}

      {/* fondo de estudio para "1 de cada 5 autos" */}
      {t >= 10.9 && t < 15.0 ? <Estudio t={t} tono={["#1a0b10", "#050507"]} acento={ROJO_DA} /> : null}

      {/* fondo de la parte de los colores */}
      {t >= 20.8 && !enRemate ? (
        <AbsoluteFill style={{ transform: `scale(${1.3 + 0.05 * lim((t - 20.8) / 13)})`, filter: "blur(30px) brightness(0.32) saturate(1.2)" }}>
          <Img src={staticFile("hnc/insurgentes.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}

      {!enRemate ? <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 66%, rgba(0,0,0,0.7) 100%)" }} /> : null}
      {!enRemate ? <Destello t={t} cortes={CORTES} /> : null}

      {/* 1. gancho */}
      {t < 3.8 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 16 }}>
          <Kicker texto="¿SABÍAS QUE...?" frame={frame} fps={fps} t0={0.1} />
          <div style={{ width: 960 }}>
            <TituloMascara texto="El Hoy No Circula cumple 37 años" resaltar={["37"]} t={t} t0={0.3} t1={3.6} tamano={92} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 2. la fecha de inicio */}
      {t >= 3.8 && t < 10.9 ? (
        <>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 18 }}>
            <Kicker texto="EMPEZÓ EL" frame={frame} fps={fps} t0={3.9} />
            <div style={{ display: "flex", gap: 16 }}>
              {["20", "11", "1989"].map((x, i) => {
                const e = resorte(frame, fps, 4.4 + i * 0.2, 12);
                return (
                  <div key={x} style={{ overflow: "hidden", borderRadius: 18 }}>
                    <div style={{ transform: `translateY(${(1 - e) * 110}%)`, background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.25)", borderRadius: 18, padding: "8px 26px 14px", fontFamily: ANTON, fontSize: 110, color: "#fff" }}>{x}</div>
                  </div>
                );
              })}
            </div>
          </AbsoluteFill>
          <ChipVidrio t={t} t0={4.2} t1={10.8} texto="📷 CDMX vista desde el espacio, 1985" x={60} y={1640} tamano={30} />
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 340 }}>
            <div style={{ width: 960, display: "flex", justifyContent: "center" }}>
              <TituloMascara texto="Medida temporal: solo para el invierno" resaltar={["temporal:"]} t={t} t0={8.3} t1={10.7} tamano={84} />
            </div>
          </AbsoluteFill>
        </>
      ) : null}

      {/* 3. uno de cada cinco autos */}
      {t >= 10.9 && t < 15.0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40, paddingTop: 300 }}>
          <div style={{ background: "rgba(10,10,14,0.72)", border: "2px solid rgba(255,255,255,0.18)", borderRadius: 30, padding: "40px 40px 34px", display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
            <div style={{ display: "flex", gap: 14 }}>
              {[0, 1, 2, 3, 4].map((i) => {
                const e = resorte(frame, fps, 11.2 + i * 0.12, 13);
                const fuera = i === 4 ? lim((t - 13.98) / 0.35) : 0;
                return (
                  <div key={i} style={{ transform: `translateY(${(1 - e) * 60}px) translateX(${fuera * 60}px)`, opacity: e * (1 - fuera * 0.75) }}>
                    <Auto color={i === 4 ? (fuera > 0 ? "#e53935" : "#ffffff") : "#ffffff"} ancho={160} />
                  </div>
                );
              })}
            </div>
            <div style={{ fontFamily: ANTON, fontSize: 100, color: "#fff", lineHeight: 1, opacity: resorte(frame, fps, 12.7) }}>
              1 DE CADA <span style={{ background: DEGRADADO, padding: "0 0.18em", borderRadius: "0.12em" }}>5</span> AUTOS
            </div>
            <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 32, color: "rgba(255,255,255,0.8)", opacity: resorte(frame, fps, 13.2) }}>fuera de circulación cada día hábil</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* 4. permanente y 37 años */}
      {t >= 15.0 && t < 20.8 ? (
        <>
          <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 16 }}>
            <Kicker texto="EN 1990" frame={frame} fps={fps} t0={15.1} />
            <div style={{ transform: `scale(${interpolate(resorte(frame, fps, 15.84, 11, 260), [0, 1], [2.2, 1])}) rotate(-4deg)`, opacity: lim(resorte(frame, fps, 15.84, 11, 260) * 3), border: "8px solid #ff4d55", borderRadius: 22, padding: "4px 30px 10px", fontFamily: ANTON, fontSize: 100, color: "#ff4d55", background: "rgba(0,0,0,0.35)" }}>PERMANENTE</div>
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 300 }}>
            <div style={{ fontFamily: ANTON, fontSize: 220, color: "#fff", lineHeight: 1, opacity: resorte(frame, fps, 17.9), fontVariantNumeric: "tabular-nums", textShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>{anios}</div>
            <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 40, color: "#fff", opacity: resorte(frame, fps, 19.4) }}>37 años después… aquí seguimos</div>
          </AbsoluteFill>
        </>
      ) : null}

      {/* 5. calendario de colores */}
      {t >= 20.8 && t < 30.9 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250, gap: 22 }}>
          <Kicker texto="¿TE SABES LOS COLORES?" frame={frame} fps={fps} t0={20.9} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 900, marginTop: 30 }}>
            {DIAS.map((d) => {
              const e = resorte(frame, fps, d.t, 13, 200);
              return (
                <div key={d.dia} style={{ display: "flex", alignItems: "center", gap: 24, transform: `translateX(${(1 - e) * -140}px)`, opacity: lim(e * 2) }}>
                  <div style={{ width: 150, height: 150, borderRadius: 28, background: d.color, boxShadow: `0 0 40px ${d.color}88`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 58, color: d.tinta }}>{d.placas}</div>
                  <div style={{ fontFamily: ANTON, fontSize: 96, color: "#fff", letterSpacing: "0.02em" }}>{d.dia}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: POPPINS, fontWeight: 600, fontSize: 28, color: "rgba(255,255,255,0.7)", opacity: resorte(frame, fps, 21.8) }}>Terminación de placa · hologramas 1 y 2</div>
        </AbsoluteFill>
      ) : null}

      {/* 6. pregunta */}
      {t >= 30.9 && !enRemate ? (
        <>
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 18 }}>
            <div style={{ display: "flex", gap: 12 }}>
              {DIAS.map((d, i) => (
                <div key={d.dia} style={{ width: 120, height: 120, borderRadius: 24, background: d.color, transform: `scale(${resorte(frame, fps, 30.95 + i * 0.06, 12)})` }} />
              ))}
            </div>
            <div style={{ width: 960, marginTop: 30 }}>
              <TituloMascara texto="¿Qué día no circula el tuyo?" resaltar={["tuyo?"]} t={t} t0={31.0} t1={34.0} tamano={100} />
            </div>
          </AbsoluteFill>
          <ChipVidrio t={t} t0={32.6} t1={34.1} texto="Cuéntanos en los comentarios 👇" x={200} y={1400} tamano={40} />
        </>
      ) : null}

      {/* remate */}
      <Sequence from={fin}>
        <AbsoluteFill style={{ filter: "blur(26px) brightness(0.32) grayscale(0.3)", transform: "scale(1.2)" }}>
          <Img src={staticFile("hnc/cielo2019.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.35) 0%, rgba(0,0,0,0) 60%)" }} />
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
          <Kicker texto="¿TE TOCA VERIFICAR?" frame={frame} fps={fps} t0={DUR_VOZ + 0.1} />
          <div style={{ width: 920 }}>
            <TituloMascara texto="Haz tu pre-verificación con el Doctor" resaltar={["Doctor"]} t={t} t0={DUR_VOZ + 0.3} t1={99} tamano={94} />
          </div>
        </AbsoluteFill>
        <ChipVidrio t={t} t0={DUR_VOZ + 0.9} t1={99} texto="Sucursales en CDMX 🔧" x={300} y={1320} tamano={40} />
      </Sequence>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.9} />
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}

      <Sequence durationInFrames={fin}>
        <Audio src={staticFile("audio/hnc/voz.wav")} />
      </Sequence>
      {/* misma música de la serie (la del Vocho) */}
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
          <Audio src={staticFile("sfx/kit/whoosh.wav")} volume={0.12} />
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
