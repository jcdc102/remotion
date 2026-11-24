import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, Estudio, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";

// Tendencia GTA VI: el taller de Doctor Auto como el taller de modificaciones de un videojuego.
// HUD y menú propios (colores Doctor Auto, Anton/Poppins); sin logos, tipografía, música ni
// clips del juego. Tomas reales del taller (reels de FB no publicados en otros videos).
const DUR = 25;
export const DURACION_GTA = DUR * 30;

type Clip = { src: string; t0: number; t1: number; vel: number; zoom?: number; origen?: string };
const CLIPS: Clip[] = [
  { src: "entrada", t0: 0, t1: 2.6, vel: 0.54 },
  { src: "motor", t0: 4.2, t1: 6.6, vel: 0.62 },
  { src: "frenos", t0: 6.6, t1: 9.0, vel: 0.8 },
  { src: "disco", t0: 9.0, t1: 10.4, vel: 0.93 },
  { src: "pintura", t0: 10.4, t1: 14.4, vel: 1.0 },
  { src: "ppf", t0: 14.4, t1: 17.4, vel: 1.2, zoom: 1.2, origen: "50% 0%" },
  { src: "resultado", t0: 17.4, t1: 20.0, vel: 1.2, zoom: 1.2, origen: "50% 0%" },
];
const CORTES = [2.6, 4.2, 6.6, 9.0, 10.4, 14.4, 17.4, 20.0, 22.0];
// Cada compra: momento, nivel de servicio (llaves encendidas) y costo.
const COMPRAS = [
  { t: 5.4, costo: 2500 },
  { t: 8.0, costo: 1800 },
  { t: 12.2, costo: 6400 },
  { t: 15.6, costo: 4900 },
  { t: 18.4, costo: 0 },
];

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 13, stiffness = 210) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const PlanoClip: React.FC<{ c: Clip; t: number }> = ({ c, t }) => {
  const l = t - c.t0;
  const k = lim(l / (c.t1 - c.t0));
  const entra = Math.max(0, 1 - l / 0.18);
  return (
    <AbsoluteFill style={{ transform: `scale(${(c.zoom ?? 1.04) * (1 + 0.05 * k) * (1 + 0.1 * entra)})`, transformOrigin: c.origen ?? "50% 50%", filter: `blur(${entra * entra * 12}px) contrast(1.1) saturate(1.2)` }}>
      <OffthreadVideo src={staticFile(`gta/${c.src}.mp4`)} muted playbackRate={c.vel} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const Llave: React.FC<{ on: number }> = ({ on }) => (
  <svg width={54} height={54} viewBox="0 0 24 24" style={{ transform: `scale(${1 + 0.4 * on * (1 - on)})`, filter: on > 0.5 ? "drop-shadow(0 0 8px rgba(255,80,80,0.9))" : "none" }}>
    <path d="M21 6.5a5 5 0 0 1-6.8 4.7L7 18.4a2 2 0 0 1-2.8-2.8l7.2-7.2A5 5 0 0 1 17.5 3l-3 3 .9 2.6 2.6.9 3-3z" fill={on > 0.5 ? "#ff3b42" : "rgba(255,255,255,0.18)"} stroke="rgba(0,0,0,0.6)" strokeWidth={1} />
  </svg>
);

// Panel inferior de mejora: nombre, barra de nivel y compra.
const PanelMejora: React.FC<{ t: number; t0: number; t1: number; titulo: string; detalle: string; tCompra: number; costo: number; frame: number; fps: number }> = ({ t, t0, t1, titulo, detalle, tCompra, costo, frame, fps }) => {
  if (t < t0 || t > t1) return null;
  const e = resorte(frame, fps, t0, 14, 200);
  const barra = lim((t - t0 - 0.3) / (tCompra - t0 - 0.3));
  const ok = resorte(frame, fps, tCompra, 9, 260);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1100 }}>
      <div style={{ width: 920, transform: `translateY(${(1 - e) * 60}px)`, opacity: e, background: "#0b0c10", border: "2px solid rgba(255,255,255,0.14)", borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ background: DEGRADADO, padding: "12px 30px 16px", fontFamily: ANTON, fontSize: 62, color: "#fff", display: "flex", justifyContent: "space-between" }}>
          <span>{titulo}</span>
          <span style={{ fontSize: 40, alignSelf: "center", opacity: 0.85 }}>MEJORA</span>
        </div>
        <div style={{ padding: "22px 30px 26px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 36, color: "rgba(255,255,255,0.88)" }}>{detalle}</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ flex: 1, height: 26, borderRadius: 6, background: barra * 4 > i ? "#ff3b42" : "rgba(255,255,255,0.12)", boxShadow: barra * 4 > i ? "0 0 14px rgba(255,59,66,0.7)" : "none" }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 }}>
            <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.6)" }}>NIVEL {Math.min(4, Math.max(1, Math.ceil(barra * 4)))}/4</div>
            <div style={{ transform: `scale(${ok})`, background: "#1f9d55", borderRadius: 14, padding: "6px 22px 10px", fontFamily: ANTON, fontSize: 44, color: "#fff" }}>{costo ? `✓ -$${costo.toLocaleString("es-MX")}` : "✓ LISTO"}</div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const OPCIONES = ["MOTOR", "FRENOS", "PINTURA", "PROTECCIÓN PPF", "SALIR"];

export const ModoGTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const marca = resorte(frame, fps, 0.1);
  const hud = resorte(frame, fps, 2.6) * (t < 20.0 ? 1 : Math.max(0, 1 - (t - 20.0) / 0.3));
  const gastado = COMPRAS.filter((c) => t >= c.t).reduce((a, c) => a + c.costo, 0);
  const dinero = 25000 - gastado;
  const llaves = COMPRAS.map((c) => resorte(frame, fps, c.t, 9, 260));
  const enMenu = t >= 2.6 && t < 4.2;
  const cursor = interpolate(t, [3.0, 3.25, 3.5, 3.75, 3.95], [3, 2, 1, 0, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const banner = resorte(frame, fps, 20.05, 9, 220);
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {CLIPS.map((c) => (
        <Sequence key={c.src} from={Math.round(c.t0 * fps)} durationInFrames={Math.round((c.t1 - c.t0) * fps)}>
          <PlanoClip c={c} t={t} />
        </Sequence>
      ))}
      {enMenu ? <Estudio t={t} tono={["#2a0c12", "#050507"]} acento={ROJO_DA} /> : null}
      {t >= 20.0 ? (
        <AbsoluteFill style={{ filter: "blur(22px) brightness(0.4)", transform: "scale(1.25)", transformOrigin: "50% 0%" }}>
          <OffthreadVideo src={staticFile("gta/resultado.mp4")} muted startFrom={60} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      ) : null}
      {t >= 20.0 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(204,35,40,0.4) 0%, rgba(0,0,0,0) 60%)" }} /> : null}

      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.6) 100%)" }} />
      <Destello t={t} cortes={CORTES} />

      {/* gancho */}
      {t < 2.6 ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 250 }}>
          <div style={{ width: 960 }}>
            <TituloMascara texto="Doctor Auto en modo GTA 🎮" resaltar={["GTA"]} t={t} t0={0.1} t1={2.5} tamano={100} />
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= 0.9 && t < 2.6 ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1300 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, width: 900, background: "#0b0c10", borderRadius: 20, padding: "26px 34px", transform: `scale(${resorte(frame, fps, 0.9, 12, 240)})`, border: "2px solid rgba(255,255,255,0.15)" }}>
            <div style={{ width: 74, height: 74, borderRadius: 14, background: t > 2.25 ? ROJO_DA : "#fff", color: t > 2.25 ? "#fff" : "#111", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 52, transform: `scale(${t > 2.25 && t < 2.4 ? 0.85 : 1})` }}>E</div>
            <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 42, color: "#fff" }}>Entrar al taller</div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* menú del taller */}
      {enMenu ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 120 }}>
          <div style={{ width: 860, transform: `translateX(${(1 - resorte(frame, fps, 2.62, 14, 200)) * -900}px)`, background: "rgba(8,9,12,0.92)", borderRadius: 26, overflow: "hidden", border: "2px solid rgba(255,255,255,0.14)", boxShadow: "0 30px 90px rgba(0,0,0,0.7)" }}>
            <div style={{ background: DEGRADADO, padding: "16px 34px 20px", fontFamily: ANTON, fontSize: 70, color: "#fff" }}>TALLER DOCTOR AUTO</div>
            {OPCIONES.map((o, i) => {
              const sel = Math.round(cursor) === i && t >= 3.0;
              return (
                <div key={o} style={{ padding: "18px 34px", fontFamily: POPPINS, fontWeight: 800, fontSize: 46, background: sel ? "#fff" : "transparent", color: sel ? "#111" : "rgba(255,255,255,0.85)", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between" }}>
                  <span>{o}</span>
                  <span style={{ opacity: 0.5 }}>›</span>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* mejoras */}
      <PanelMejora t={t} t0={4.3} t1={6.55} titulo="MOTOR" detalle="Afinación y revisión completa" tCompra={5.4} costo={2500} frame={frame} fps={fps} />
      <PanelMejora t={t} t0={6.7} t1={10.35} titulo="FRENOS" detalle="Balatas y discos nuevos" tCompra={8.0} costo={1800} frame={frame} fps={fps} />
      {t >= 10.4 && t < 14.4 ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 590 }}>
          <div style={{ width: 960, background: "#0b0c10", borderRadius: 26, overflow: "hidden", border: "2px solid rgba(255,255,255,0.14)", transform: `scale(${0.9 + 0.1 * resorte(frame, fps, 10.45)})`, opacity: resorte(frame, fps, 10.45) }}>
            <div style={{ background: DEGRADADO, padding: "12px 30px 16px", fontFamily: ANTON, fontSize: 62, color: "#fff" }}>PINTURA</div>
            <div style={{ padding: "30px 30px 60px", display: "flex", flexDirection: "column", gap: 22 }}>
              <div style={{ display: "flex", gap: 18, justifyContent: "center" }}>
                {["#f2f2f2", "#16171c", "#2f6fe0", "#9aa0ab", "#1f9d55", "#d7262c"].map((c, i) => {
                  const sel = i === Math.min(5, Math.floor(interpolate(t, [10.8, 12.0], [0, 5.99], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
                  return <div key={c} style={{ width: 130, height: 280, borderRadius: 20, background: c, border: sel ? "8px solid #fff" : "4px solid rgba(255,255,255,0.2)", transform: `scale(${sel ? 1.12 : 1})`, boxShadow: sel ? "0 0 26px rgba(255,255,255,0.6)" : "none" }} />;
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
                <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 38, color: "#fff" }}>Hojalatería y pintura</div>
                <div style={{ transform: `scale(${resorte(frame, fps, 12.2, 9, 260)})`, background: "#1f9d55", borderRadius: 14, padding: "6px 22px 10px", fontFamily: ANTON, fontSize: 44, color: "#fff" }}>✓ -$6,400</div>
              </div>
              <div style={{ height: 100, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
                <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 30, color: "rgba(255,255,255,0.65)" }}>{t < 13.2 ? "Aplicando color…" : "Acabado de agencia ✓"}</div>
                <div style={{ height: 24, borderRadius: 12, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                  <div style={{ width: `${lim((t - 12.2) / 1.0) * 100}%`, height: "100%", background: "#d7262c" }} />
                </div>
              </div>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <PanelMejora t={t} t0={14.5} t1={17.35} titulo="PROTECCIÓN PPF" detalle="Película que protege la pintura" tCompra={15.6} costo={4900} frame={frame} fps={fps} />

      {/* estadísticas finales */}
      {t >= 17.4 && t < 20.0 ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1000 }}>
          <div style={{ width: 920, background: "rgba(8,9,12,0.9)", borderRadius: 26, padding: "26px 34px", border: "2px solid rgba(255,255,255,0.14)", display: "flex", flexDirection: "column", gap: 16, opacity: resorte(frame, fps, 17.45) }}>
            {[["MOTOR", 0.35], ["FRENOS", 0.3], ["ESTILO", 0.4], ["PROTECCIÓN", 0.2]].map(([n, a], i) => {
              const v = interpolate(t, [17.6 + i * 0.15, 18.4 + i * 0.15], [Number(a), 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={String(n)} style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{ width: 300, fontFamily: POPPINS, fontWeight: 800, fontSize: 36, color: "#fff" }}>{n}</div>
                  <div style={{ flex: 1, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                    <div style={{ width: `${v * 100}%`, height: "100%", background: v > 0.99 ? "#1f9d55" : DEGRADADO }} />
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* HUD: dinero, llaves de servicio, minimapa */}
      {hud > 0.01 ? (
        <>
          <AbsoluteFill style={{ alignItems: "flex-end", paddingTop: 230, paddingRight: 44, opacity: hud }}>
            <div style={{ fontFamily: ANTON, fontSize: 70, color: "#fff", textShadow: "0 4px 0 #000, 0 0 20px rgba(0,0,0,0.8)", fontVariantNumeric: "tabular-nums" }}>${dinero.toLocaleString("es-MX")}</div>
            <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
              {llaves.map((v, i) => (
                <Llave key={i} on={v} />
              ))}
            </div>
          </AbsoluteFill>
          <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-start", padding: "0 0 210px 44px", opacity: hud }}>
            <svg width={240} height={240} viewBox="0 0 240 240">
              <defs>
                <clipPath id="mapa">
                  <circle cx={120} cy={120} r={112} />
                </clipPath>
              </defs>
              <circle cx={120} cy={120} r={116} fill="rgba(10,14,20,0.85)" stroke="rgba(255,255,255,0.5)" strokeWidth={4} />
              <g clipPath="url(#mapa)" transform={`rotate(${-t * 6} 120 120)`}>
                {[30, 80, 130, 180, 230].map((x) => (
                  <path key={`v${x}`} d={`M${x} -20 L${x + 30} 260`} stroke="rgba(255,255,255,0.22)" strokeWidth={8} />
                ))}
                {[40, 100, 160, 220].map((y) => (
                  <path key={`h${y}`} d={`M-20 ${y} L260 ${y - 20}`} stroke="rgba(255,255,255,0.22)" strokeWidth={8} />
                ))}
                <path d="M-20 150 Q120 90 260 140" stroke="#f5c518" strokeWidth={10} fill="none" opacity={0.7} />
                <circle cx={160} cy={70} r={14} fill={ROJO_DA} />
                <text x={160} y={77} textAnchor="middle" fontFamily={ANTON} fontSize={18} fill="#fff">DA</text>
              </g>
              <path d="M120 104 L132 134 L120 128 L108 134 Z" fill="#fff" />
            </svg>
          </AbsoluteFill>
        </>
      ) : null}

      {/* auto mejorado */}
      {t >= 20.0 && t < 22.0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 24 }}>
          <div style={{ transform: `scale(${interpolate(banner, [0, 1], [2.2, 1])})`, opacity: lim(banner * 3), fontFamily: ANTON, fontSize: 150, color: "#fff", textAlign: "center", lineHeight: 0.95, textShadow: "0 8px 0 #8f1418, 0 0 40px rgba(204,35,40,0.8)" }}>
            ¡AUTO
            <br />
            MEJORADO!
          </div>
          <div style={{ fontFamily: ANTON, fontSize: 70, color: "#f5c518", opacity: resorte(frame, fps, 20.6), transform: `translateY(${(1 - resorte(frame, fps, 20.6)) * 30}px)` }}>+ RESPETO</div>
        </AbsoluteFill>
      ) : null}

      {/* cierre */}
      {t >= 22.0 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 40 }}>
          <div style={{ width: 960 }}>
            <TituloMascara texto="En el juego se arregla con dinero de mentiritas" resaltar={["mentiritas"]} t={t} t0={22.05} t1={99} tamano={76} />
          </div>
          <div style={{ width: 960, opacity: t >= 23.0 ? 1 : 0 }}>
            <TituloMascara texto="Aquí queda como nuevo de verdad" resaltar={["verdad"]} t={t} t0={23.05} t1={99} tamano={96} />
          </div>
        </AbsoluteFill>
      ) : null}
      <ChipVidrio t={t} t0={23.6} t1={99} texto="Doctor Auto · Sucursales en CDMX 🔧" x={170} y={1460} tamano={40} />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.6} />

      <Audio src={staticFile("gta/musica.mp3")} volume={(f) => 0.5 * interpolate(f / fps, [0, 0.3, DUR - 1.2, DUR], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      {CORTES.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={20}>
          <Audio src={staticFile("sfx/kit/whoosh.wav")} volume={0.2} />
        </Sequence>
      ))}
      {(
        [
          [0, "sfx/kit/fahhh.mp3", 0.3],
          [0.9, "sfx/mk-pop.wav", 0.4],
          [2.25, "sfx/mk-clic.wav", 0.6],
          [3.0, "sfx/kit/click.wav", 0.4],
          [3.25, "sfx/kit/click.wav", 0.4],
          [3.5, "sfx/kit/click.wav", 0.4],
          [3.75, "sfx/kit/click.wav", 0.4],
          [4.0, "sfx/mk-clic.wav", 0.6],
          ...COMPRAS.map((c): [number, string, number] => [c.t, "sfx/check.wav", 0.5]),
          ...COMPRAS.filter((c) => c.costo).map((c): [number, string, number] => [c.t + 0.05, "sfx/conteo.wav", 0.3]),
          [12.0, "sfx/kit/click.wav", 0.4],
          [20.05, "sfx/memes/boom.mp3", 0.35],
          [20.1, "sfx/kit/magic.mp3", 0.5],
          [22.05, "sfx/kit/click.wav", 0.4],
          [23.05, "sfx/ding.wav", 0.4],
        ] as [number, string, number][]
      ).map(([s, src, v], i) => (
        <Sequence key={i} from={Math.round(s * fps)} durationInFrames={60}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
