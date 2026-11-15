import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { Grano } from "./cine";

// Humor: «POV: estudias Turismo» y la familia cree que eres agencia de viajes. Chat familiar que se va llenando.
// Paleta propia de este video: turquesa tropical con dibujos de viaje. Gancho en el fotograma 0 (según las estadísticas de Julio).
// Voz «Julio»: gancho en 0 s y remate en 9 s (public/voz-pov-turismo.mp3).
export const DURACION_POV = 461;

const { fontFamily: F } = loadFont("normal", { weights: ["500", "600", "800", "900"], subsets: ["latin", "latin-ext"] });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const m = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const TINTA = "#06334A";
const AMARILLO = "#FFD23F";

const MENSAJES = [
  { quien: "Tía Lupe", color: "#E76F51", texto: "Mijo, ¿me consigues un vuelo barato a Cancún? ✈️", f: 84 },
  { quien: "Primo Beto", color: "#2A9D8F", texto: "¿Cuánto me cobras por planear mi boda? 💍", f: 136 },
  { quien: "Mamá", color: "#9B5DE5", texto: "Dile a tu maestra que nos haga descuento en el hotel 🏨", f: 188 },
  { quien: "Abuelita", color: "#F15BB5", texto: "¿Y ya trabajas en el aeropuerto, mijito? 🛫", f: 236 },
];
const RESPUESTA = { texto: "Familia… estudio Turismo, no soy agencia de viajes 😭", tiempos: [276, 315, 332, 361, 365, 371, 381, 387, 392] };

const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const DIBUJOS = ["✈️", "🏝️", "🧳", "🌴", "📍", "🗺️", "🎓", "☀️"];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(165deg, #0096C7 0%, #00B4D8 40%, #48CAE4 70%, #90E0EF 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -160, top: 140, width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,226,120,0.85) 0%, rgba(255,210,63,0.35) 40%, transparent 70%)" }} />
      {Array.from({ length: 28 }).map((_, i) => {
        const x = (i * 197) % 1080;
        const y = ((i * 263 + frame * (0.6 + (i % 4) * 0.2)) % 2100) - 100;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 1920 - y, fontSize: 46 + (i % 3) * 14, opacity: 0.22, transform: `rotate(${(i % 2 ? 1 : -1) * (10 + frame * 0.3)}deg)` }}>
            {DIBUJOS[i % DIBUJOS.length]}
          </div>
        );
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,40,70,0.35) 100%)" }} />
    </AbsoluteFill>
  );
};

// Gancho: entra de golpe en el fotograma 0.
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pov = spring({ frame, fps, config: { damping: 9, mass: 0.6 } });
  const sub = spring({ frame: frame - 30, fps, config: { damping: 11 } });
  const sube = m(frame, 66, 84);
  return (
    <div style={{ position: "absolute", left: 70, right: 140, top: 340 - sube * 6, opacity: 1 - sube * 0.0, transform: `scale(${1 - sube * 0.45})`, transformOrigin: "0 0" }}>
      <div style={{ display: "inline-block", padding: "10px 28px", borderRadius: 20, background: TINTA, color: AMARILLO, fontFamily: F, fontWeight: 900, fontSize: 120, transform: `scale(${pov}) rotate(${(1 - pov) * -8}deg)`, transformOrigin: "0 50%", boxShadow: "0 18px 40px rgba(0,0,0,0.25)" }}>POV:</div>
      <div style={{ marginTop: 18, fontFamily: F, fontWeight: 900, fontSize: 92, lineHeight: 1.05, color: "#fff", textShadow: "0 6px 24px rgba(0,50,80,0.45)", opacity: Math.min(1, sub * 1.5), transform: `translateY(${(1 - sub) * 40}px)` }}>
        estudias <span style={{ color: AMARILLO }}>Turismo</span> 🎓
      </div>
    </div>
  );
};

const Escribiendo: React.FC<{ desde: number }> = ({ desde }) => {
  const frame = useCurrentFrame();
  if (frame < desde - 18 || frame >= desde) return null;
  return (
    <div style={{ display: "flex", gap: 10, padding: "18px 26px", borderRadius: 30, background: "#fff", width: "fit-content", boxShadow: "0 6px 16px rgba(0,0,0,0.12)" }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: "#9AA7B0", transform: `translateY(${Math.sin((frame + i * 5) / 3) * 5}px)` }} />)}
    </div>
  );
};

const Chat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame: frame - 70, fps, config: { damping: 16 } });
  const visibles = MENSAJES.filter((x) => frame >= x.f).length + (frame >= RESPUESTA.tiempos[0] - 4 ? 1 : 0);
  const desplaza = interpolate(visibles, [0, 3, 4, 5], [0, 0, 60, 300], clamp);
    return (
    <div style={{ position: "absolute", left: 60, right: 140, top: 560, height: 770, borderRadius: 40, background: "rgba(240,248,252,0.96)", boxShadow: "0 30px 70px rgba(0,40,70,0.35)", overflow: "hidden", opacity: frame < 64 ? 0 : 1, transform: `translateY(${(1 - entra) * 1400}px)` }}>
      <div style={{ height: 110, background: TINTA, display: "flex", alignItems: "center", gap: 20, padding: "0 30px" }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: AMARILLO, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>👨‍👩‍👧‍👦</div>
        <div style={{ fontFamily: F }}>
          <div style={{ fontWeight: 800, fontSize: 36, color: "#fff" }}>Familia ❤️</div>
          <div style={{ fontWeight: 500, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>Tía Lupe, Primo Beto, Mamá, Abuelita, tú</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 110, bottom: 0, overflow: "hidden" }}><div style={{ position: "absolute", left: 26, right: 26, top: 26, display: "flex", flexDirection: "column", gap: 22, transform: `translateY(${-desplaza}px)`, transition: "none" }}>
        {MENSAJES.map((x, k) => {
          if (frame < x.f - 18) return null;
          if (frame < x.f) return <Escribiendo key={k} desde={x.f} />;
          const e = spring({ frame: frame - x.f, fps, config: { damping: 13, mass: 0.6 } });
          return (
            <div key={k} style={{ alignSelf: "flex-start", maxWidth: "86%", padding: "16px 24px 18px", borderRadius: "8px 30px 30px 30px", background: "#fff", boxShadow: "0 6px 16px rgba(0,0,0,0.10)", transform: `scale(${e})`, transformOrigin: "0 0" }}>
              <div style={{ fontFamily: F, fontWeight: 800, fontSize: 24, color: x.color }}>{x.quien}</div>
              <div style={{ fontFamily: F, fontWeight: 600, fontSize: 36, lineHeight: 1.25, color: "#1D2B33" }}>{x.texto}</div>
            </div>
          );
        })}
        {frame >= RESPUESTA.tiempos[0] - 4 ? (
          <div style={{ alignSelf: "flex-end", maxWidth: "88%", padding: "18px 26px 20px", borderRadius: "30px 8px 30px 30px", background: AMARILLO, boxShadow: "0 8px 20px rgba(0,0,0,0.15)", transform: `scale(${spring({ frame: frame - RESPUESTA.tiempos[0] + 4, fps, config: { damping: 12, mass: 0.6 } })})`, transformOrigin: "100% 0" }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 24, color: TINTA }}>Tú</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
              {RESPUESTA.texto.split(" ").map((p, k) => (
                <span key={k} style={{ fontFamily: F, fontWeight: 800, fontSize: 40, lineHeight: 1.22, color: TINTA, opacity: frame >= RESPUESTA.tiempos[k] - 2 ? 1 : 0.15 }}>{p}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div></div>
    </div>
  );
};

const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - 404, fps, config: { damping: 12 } });
  return (
    <>
      {frame >= 392
        ? ["😂", "😭", "🤣", "😂", "💀"].map((r, i) => {
            const t = (frame - 392 - i * 5) / 60;
            return t > 0 ? <div key={i} style={{ position: "absolute", left: 200 + i * 150, top: 1380 - t * 600, fontSize: 80, opacity: Math.max(0, 1 - t) }}>{r}</div> : null;
          })
        : null}
      <div style={{ position: "absolute", left: 60, right: 140, top: 1352, display: "flex", justifyContent: "center", transform: `scale(${e})`, opacity: Math.min(1, e * 1.5) }}>
        <div style={{ padding: "16px 30px", borderRadius: 40, background: TINTA, fontFamily: F, fontWeight: 800, fontSize: 36, color: "#fff" }}>Etiqueta a ese familiar 👇</div>
      </div>
    </>
  );
};

export const PovTurismo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Fondo />
      <Gancho />
      <Chat />
      <Cierre />
      <div style={{ position: "absolute", left: 80, right: 80, top: 270, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.3)" }}>
        <div style={{ width: `${(frame / DURACION_POV) * 100}%`, height: "100%", borderRadius: 3, background: AMARILLO }} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 288, fontFamily: F, fontWeight: 600, fontSize: 24, color: "rgba(255,255,255,0.85)" }}>@julio.chaidez1</div>
      <Audio src={staticFile("voz-pov-turismo.mp3")} />
      <Audio src={staticFile("musica-vuelos.mp3")} volume={(f) => 0.13 * interpolate(f, [0, 8, DURACION_POV - 40, DURACION_POV], [0.6, 1, 1, 0], clamp)} />
      <Sequence from={0} durationInFrames={40}><Audio src={staticFile("sfx/golpe.wav")} volume={0.35} /></Sequence>
      <Sequence from={66} durationInFrames={40}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.3} /></Sequence>
      {MENSAJES.map((x, k) => (
        <Sequence key={k} from={x.f} durationInFrames={40}><Audio src={staticFile("sfx/notificacion.wav")} volume={0.32} /></Sequence>
      ))}
      <Sequence from={RESPUESTA.tiempos[0] - 4} durationInFrames={40}><Audio src={staticFile("sfx/pop.wav")} volume={0.35} /></Sequence>
      <Sequence from={392} durationInFrames={40}><Audio src={staticFile("sfx/ding.wav")} volume={0.3} /></Sequence>
      <Grano />
    </AbsoluteFill>
  );
};
