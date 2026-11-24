import { AbsoluteFill, Audio, Freeze, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio } from "../doctor-auto/pro";
import { Escena } from "./Escenas";

// Meme: la señora que lleva agua bendita para que arranque su Renault 12 (video viral de
// TikTok @lomejordelared, marcas de agua intactas). Recorte: 0–14.85 s y 31.5–38.32 s.
const A_FIN = 14.85;
const B_DESDE = 31.5;
const B_FIN = A_FIN + (38.32 - B_DESDE); // 21.67
const T_OUTRO = 23.6;
const DUR = 28.6;
export const DURACION_AGUA = Math.round(DUR * 30);

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 12, stiffness = 220) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const FRASES: [number, number, string, string[]][] = [
  [0.05, 2.0, "¿Agua bendita… para su auto? 🙏", ["auto?"]],
  [2.1, 4.65, "“Para mi auto”", ["auto”"]],
  [4.76, 6.38, "4 AÑOS sin arrancar 😳", ["AÑOS"]],
  [6.46, 7.4, "Un Renault 12", ["Renault"]],
  [7.46, 10.5, "“Pero tengo fe” 🙏", ["fe”"]],
  [10.6, 14.8, "Agua BIEN bendita ✨", ["bendita"]],
  [14.9, 17.0, "Vino caminando de muy lejos 🚶‍♀️", ["lejos"]],
  [17.1, 19.5, "¿Cuánto caminó?", ["caminó?"]],
  [19.6, 21.6, "Un sacrificio… 🙏", ["sacrificio…"]],
];
const GOLPES = [0.6, 4.9, 6.6, 11.6, 18.6];

const Tarjeta: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const golpe = GOLPES.reduce((a, g) => a + (t >= g ? 0.07 * Math.max(0, 1 - (t - g) / 0.35) : 0), 0);
  const zoomLento = 1 + 0.06 * lim((t % 7) / 7);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 330 }}>
      <div style={{ width: 1080, height: 1350, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
        <div style={{ width: "100%", height: "100%", transform: `scale(${zoomLento + golpe})`, transformOrigin: "50% 30%" }}>{children}</div>
      </div>
    </AbsoluteFill>
  );
};

export const AguaBendita: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const fA = Math.round(A_FIN * fps);
  const fB = Math.round(B_FIN * fps);
  const fO = Math.round(T_OUTRO * fps);
  const km = Math.round(interpolate(t, [18.5, 19.2], [0, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const anios = Math.round(interpolate(t, [4.8, 5.6], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const santo = t >= 7.46 && t < A_FIN ? lim((t - 7.46) / 0.5) * (t > A_FIN - 0.3 ? (A_FIN - t) / 0.3 : 1) : 0;
  const halo = t >= 10.6 && t < A_FIN ? lim((t - 10.6) / 0.6) : 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {/* fondo desenfocado */}
      {t < T_OUTRO ? (
        <AbsoluteFill style={{ filter: "blur(40px) brightness(0.35)", transform: "scale(1.4)" }}>
          <Sequence durationInFrames={fA}>
            <OffthreadVideo src={staticFile("refs2/agua.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Sequence>
          <Sequence from={fA}>
            <Freeze frame={0}>
              <OffthreadVideo src={staticFile("refs2/agua.mp4")} muted startFrom={Math.round(34 * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Freeze>
          </Sequence>
        </AbsoluteFill>
      ) : null}

      {/* video original */}
      {t < T_OUTRO ? (
        <Tarjeta t={t}>
          <Sequence durationInFrames={fA}>
            <OffthreadVideo src={staticFile("refs2/agua.mp4")} style={{ width: "100%", height: "100%" }} />
          </Sequence>
          <Sequence from={fA} durationInFrames={fB - fA}>
            <OffthreadVideo src={staticFile("refs2/agua.mp4")} startFrom={Math.round(B_DESDE * fps)} style={{ width: "100%", height: "100%" }} />
          </Sequence>
          <Sequence from={fB} durationInFrames={fO - fB}>
            <Freeze frame={0}>
              <OffthreadVideo src={staticFile("refs2/agua.mp4")} muted startFrom={Math.round(38.2 * fps)} style={{ width: "100%", height: "100%", filter: "grayscale(0.6) brightness(0.55)" }} />
            </Freeze>
          </Sequence>
          {/* luz celestial */}
          {halo > 0 ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(255,230,150,0.55) 0%, rgba(255,230,150,0) 55%)", opacity: halo, mixBlendMode: "screen" }} /> : null}
          {santo > 0
            ? Array.from({ length: 26 }).map((_, k) => {
                const v = 60 + random(`v${k}`) * 90;
                const y = 1350 - ((t * v + random(`y${k}`) * 1350) % 1350);
                const x = random(`x${k}`) * 1080;
                const r = 4 + random(`r${k}`) * 8;
                return <div key={k} style={{ position: "absolute", left: x, top: y, width: r * 2, height: r * 2, borderRadius: r, background: "#ffe28a", boxShadow: "0 0 14px #ffd54a", opacity: santo * (0.4 + 0.6 * Math.abs(Math.sin(t * 4 + k))) }} />;
              })
            : null}
        </Tarjeta>
      ) : null}

      {/* frases arriba */}
      {t < B_FIN
        ? FRASES.map(([a, b, texto, res], i) =>
            t >= a && t < b + 0.1 ? (
              <AbsoluteFill key={i} style={{ alignItems: "center", paddingTop: 175 }}>
                <div style={{ width: 1020 }}>
                  <TituloMascara texto={texto} resaltar={res} t={t} t0={a} t1={b} tamano={66} />
                </div>
              </AbsoluteFill>
            ) : null,
          )
        : null}

      {/* contadores abajo */}
      {t >= 4.8 && t < 7.4 ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-end", padding: "380px 30px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, background: "rgba(10,10,14,0.88)", borderRadius: 24, padding: "14px 34px", transform: `scale(${resorte(frame, fps, 4.8)})`, border: "2px solid rgba(255,255,255,0.15)" }}>
            <div style={{ fontFamily: ANTON, fontSize: 110, color: "#fff", lineHeight: 1 }}>{anios}</div>
            <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 36, color: "#fff", lineHeight: 1.1 }}>
              AÑOS PARADO
              <br />
              <span style={{ color: "#ff6b6b" }}>Renault 12 🚗</span>
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      {t >= 18.5 && t < B_FIN ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "flex-end", padding: "380px 30px 0 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, background: DEGRADADO, borderRadius: 24, padding: "14px 34px", transform: `scale(${resorte(frame, fps, 18.5)})` }}>
            <div style={{ fontFamily: ANTON, fontSize: 110, color: "#fff", lineHeight: 1 }}>{km} KM</div>
            <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 36, color: "#fff", lineHeight: 1.1 }}>
              A PIE 🚶‍♀️
              <br />
              (el auto no arranca)
            </div>
          </div>
        </AbsoluteFill>
      ) : null}

      {/* congelado */}
      {t >= B_FIN && t < T_OUTRO ? (
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", gap: 40, paddingTop: 420 }}>
          <div style={{ width: 960 }}>
            <TituloMascara texto="Con todo respeto, señora… 🙏" resaltar={["señora…"]} t={t} t0={B_FIN + 0.05} t1={99} tamano={82} />
          </div>
          <div style={{ width: 960, opacity: t >= B_FIN + 0.9 ? 1 : 0 }}>
            <TituloMascara texto="Fe sí… pero también afinación 😅🔧" resaltar={["afinación"]} t={t} t0={B_FIN + 0.95} t1={99} tamano={82} />
          </div>
        </AbsoluteFill>
      ) : null}

      {/* cierre */}
      <Sequence from={fO}>
        <Escena nombre="cta" l={t - T_OUTRO} d={DUR - T_OUTRO} t={t} />
        <AbsoluteFill style={{ background: "rgba(0,0,0,0.35)" }} />
        <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 300, gap: 30 }}>
          <div style={{ width: 960 }}>
            <TituloMascara texto="La fe mueve montañas 🙏" resaltar={["montañas"]} t={t} t0={T_OUTRO + 0.1} t1={99} tamano={92} />
          </div>
        </AbsoluteFill>
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 470 }}>
          <div style={{ width: 960, opacity: t >= T_OUTRO + 1.2 ? 1 : 0 }}>
            <TituloMascara texto="El Doctor mueve motores 🔧" resaltar={["Doctor"]} t={t} t0={T_OUTRO + 1.25} t1={99} tamano={100} />
          </div>
        </AbsoluteFill>
        <ChipVidrio t={t} t0={T_OUTRO + 2.0} t1={99} texto="Doctor Auto · Sucursales en CDMX" x={200} y={1560} tamano={40} />
      </Sequence>

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 12, height: 12, borderRadius: 6, background: ROJO_DA, boxShadow: "0 0 16px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 28, letterSpacing: "0.32em", color: "rgba(255,255,255,0.9)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>
      <AcabadoPremium frame={frame} calidez={0.5} />

      {(
        [
          [0.0, "sfx/kit/fahhh.mp3", 0.3],
          [0.6, "sfx/mk-hit.wav", 0.35],
          [4.9, "sfx/mk-hit.wav", 0.4],
          [5.8, "sfx/memes/trombon.mp3", 0.35],
          [6.6, "sfx/ding.wav", 0.35],
          [7.6, "sfx/kit/magic.mp3", 0.3],
          [11.6, "sfx/kit/magic.mp3", 0.45],
          [A_FIN - 0.05, "sfx/kit/whoosh.wav", 0.3],
          [18.5, "sfx/conteo.wav", 0.35],
          [19.25, "sfx/mk-hit.wav", 0.4],
          [B_FIN, "sfx/memes/scratch.mp3", 0.5],
          [B_FIN + 0.95, "sfx/kit/click.wav", 0.4],
          [T_OUTRO, "sfx/kit/shutter.mp3", 0.4],
          [T_OUTRO + 1.25, "sfx/kit/magic.mp3", 0.5],
        ] as [number, string, number][]
      ).map(([s, src, v], i) => (
        <Sequence key={i} from={Math.round(s * fps)} durationInFrames={90}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
      <Sequence from={fO - 15}>
        <Audio src={staticFile("musica.mp3")} volume={(f) => 0.22 * interpolate(f / fps, [0, 0.5, DUR - T_OUTRO - 0.5, DUR - T_OUTRO + 0.5], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      </Sequence>
    </AbsoluteFill>
  );
};
