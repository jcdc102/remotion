import { loadFont } from "@remotion/google-fonts/Poppins";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin"] });

// Formato del video top de la cuenta: clip que por sí solo da risa + una línea de meme + marca chica arriba.
type Toma = { archivo: string; dur: number; texto: string; zoom: [number, number]; desde: number };
type Sonido = { archivo: string; t: number; volumen: number };
export type MemeProps = { tomas: Toma[]; sonidos: Sonido[] };

export const duracionMeme = (tomas: Toma[]) => Math.round(tomas.reduce((s, t) => s + t.dur, 0) * 30);

export const Meme: React.FC<MemeProps> = ({ tomas, sonidos }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let inicio = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {tomas.map((toma, i) => {
        const de = Math.round(inicio * fps);
        const largo = Math.round(toma.dur * fps);
        inicio += toma.dur;
        const local = frame - de;
        const golpe = i === 0 ? 0 : spring({ frame: local, fps, config: { damping: 12, mass: 0.5 } });
        const escala = interpolate(local, [0, largo], toma.zoom, { extrapolateRight: "clamp" }) * (1 + 0.08 * (1 - golpe) * (i === 0 ? 0 : 1));
        const entraTexto = spring({ frame: local - 2, fps, config: { damping: 14 } });
        return (
          <Sequence key={i} from={de} durationInFrames={largo}>
            <AbsoluteFill style={{ transform: `scale(${escala})` }}>
              <OffthreadVideo src={staticFile(toma.archivo)} muted startFrom={Math.round(toma.desde * fps)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </AbsoluteFill>
            <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1180 }}>
              <div
                style={{
                  fontFamily,
                  fontWeight: 800,
                  fontSize: 70,
                  lineHeight: 1.15,
                  color: "white",
                  textAlign: "center",
                  padding: "0 70px",
                  textShadow: "0 0 10px rgba(0,0,0,0.9), 0 4px 0 rgba(0,0,0,0.85), 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000",
                  opacity: entraTexto,
                  transform: `translateY(${(1 - entraTexto) * 30}px)`,
                  whiteSpace: "pre-line",
                }}
              >
                {toma.texto}
              </div>
            </AbsoluteFill>
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 64, color: "rgba(255,255,255,0.78)", letterSpacing: -1, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>doctor auto</div>
      </AbsoluteFill>
      {sonidos.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * fps)}>
          <Audio src={staticFile(s.archivo)} volume={s.volumen} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const MEME_RUIDITO: MemeProps = {
  tomas: [
    { archivo: "real/a3-conductor.mp4", desde: 0.5, dur: 3.4, zoom: [1.0, 1.06], texto: "Yo: nomás hace\nun ruidito, ahorita\nse le quita 🙂" },
    { archivo: "real/v4-freno.mp4", desde: 0, dur: 4.6, zoom: [1.12, 1.25], texto: "El ruidito:" },
  ],
  sonidos: [
    { archivo: "sfx/memes/rechinido.wav", t: 0.9, volumen: 0.6 },
    { archivo: "sfx/memes/rechinido.wav", t: 2.3, volumen: 0.6 },
    { archivo: "sfx/mk-hit.wav", t: 3.4, volumen: 0.8 },
    { archivo: "sfx/memes/frenos.wav", t: 3.4, volumen: 0.9 },
    { archivo: "sfx/mk-chispazo.wav", t: 3.5, volumen: 0.6 },
  ],
};

export const MEME_QUINCENA: MemeProps = {
  tomas: [
    { archivo: "real/m1-calentar.mp4", desde: 0.3, dur: 3.4, zoom: [1.0, 1.06], texto: "Yo: el servicio\nlo hago en la quincena 🤞" },
    { archivo: "real/v1-varado.mp4", desde: 0, dur: 3.2, zoom: [1.1, 1.2], texto: "Mi carro a los 3 días:" },
    { archivo: "real/k4-radiador.mp4", desde: 1, dur: 2.4, zoom: [1.15, 1.3], texto: "Mi carro a los 3 días:" },
  ],
  sonidos: [
    { archivo: "sfx/mk-hit.wav", t: 3.4, volumen: 0.8 },
    { archivo: "sfx/memes/vapor.wav", t: 3.4, volumen: 0.7 },
    { archivo: "sfx/mk-whoosh-zoom.wav", t: 6.45, volumen: 0.6 },
    { archivo: "sfx/memes/vapor.wav", t: 6.6, volumen: 0.8 },
  ],
};
