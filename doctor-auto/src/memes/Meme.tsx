import { loadFont } from "@remotion/google-fonts/Poppins";
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const { fontFamily } = loadFont("normal", { weights: ["800"], subsets: ["latin"] });

// Formato del video top de la cuenta: clip que por sí solo da risa + una línea de meme + marca chica arriba.
type Toma = { archivo: string; dur: number; texto: string; zoom: [number, number]; desde: number };
type Sonido = { archivo: string; t: number; volumen: number };
export type MemeProps = { tomas: Toma[]; sonidos: Sonido[]; musica: string | null; corte: number | null };

export const duracionMeme = (tomas: Toma[]) => Math.round(tomas.reduce((s, t) => s + t.dur, 0) * 30);

export const Meme: React.FC<MemeProps> = ({ tomas, sonidos, musica, corte }) => {
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
        const temblor = i === 0 ? 0 : Math.max(0, 1 - local / 12) * 18;
        const dx = Math.sin(local * 2.7) * temblor;
        const dy = Math.cos(local * 3.3) * temblor;
        const flash = i === 0 ? 0 : interpolate(local, [0, 3], [0.85, 0], { extrapolateRight: "clamp" });
        return (
          <Sequence key={i} from={de} durationInFrames={largo}>
            <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${escala})` }}>
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
            <AbsoluteFill style={{ backgroundColor: "white", opacity: flash }} />
          </Sequence>
        );
      })}
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 300 }}>
        <div style={{ fontFamily, fontWeight: 800, fontSize: 64, color: "rgba(255,255,255,0.78)", letterSpacing: -1, textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>doctor auto</div>
      </AbsoluteFill>
      {musica ? (
        <Audio
          src={staticFile(musica)}
          volume={(f) => {
            const t = f / fps;
            const fin = tomas.reduce((a, b) => a + b.dur, 0);
            const base = corte === null ? 0.3 : t < corte ? 0.32 : interpolate(t, [corte, corte + 0.05, corte + 1.2, corte + 1.6], [0.32, 0, 0, 0.14], { extrapolateRight: "clamp" });
            return base * interpolate(t, [0, 0.2, fin - 0.6, fin], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          }}
        />
      ) : null}
      {sonidos.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * fps)}>
          <Audio src={staticFile(s.archivo)} volume={s.volumen} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export const MEME_RUIDITO: MemeProps = {
  musica: "sfx/memes/musica.mp3",
  corte: 3.4,
  tomas: [
    { archivo: "real/a3-conductor.mp4", desde: 0.5, dur: 3.4, zoom: [1.0, 1.06], texto: "Yo: nomás hace\nun ruidito, ahorita\nse le quita 🙂" },
    { archivo: "real/v4-freno.mp4", desde: 0, dur: 5.4, zoom: [1.12, 1.28], texto: "El ruidito: 💀" },
  ],
  sonidos: [
    { archivo: "sfx/memes/boing.mp3", t: 0.05, volumen: 0.35 },
    { archivo: "sfx/memes/voz-a.wav", t: 0.35, volumen: 1 },
    { archivo: "sfx/memes/rechinido.wav", t: 1.2, volumen: 0.5 },
    { archivo: "sfx/memes/scratch.mp3", t: 3.15, volumen: 0.8 },
    { archivo: "sfx/memes/boom.mp3", t: 3.4, volumen: 0.9 },
    { archivo: "sfx/memes/frenos.wav", t: 3.45, volumen: 0.55 },
    { archivo: "sfx/memes/voz-b.wav", t: 3.6, volumen: 1 },
    { archivo: "sfx/memes/frenos.wav", t: 5.4, volumen: 0.4 },
    { archivo: "sfx/memes/trombon.mp3", t: 5.7, volumen: 0.8 },
  ],
};

export const MEME_QUINCENA: MemeProps = {
  musica: "sfx/memes/musica.mp3",
  corte: 3.4,
  tomas: [
    { archivo: "real/m1-calentar.mp4", desde: 0.3, dur: 3.4, zoom: [1.0, 1.06], texto: "Yo: el servicio\nlo hago en la quincena 🤞" },
    { archivo: "real/v1-varado.mp4", desde: 0, dur: 3.0, zoom: [1.1, 1.2], texto: "Mi carro a los 3 días: 💀" },
    { archivo: "real/k4-radiador.mp4", desde: 1, dur: 3.2, zoom: [1.15, 1.32], texto: "Mi carro a los 3 días: 💀" },
  ],
  sonidos: [
    { archivo: "sfx/memes/boing.mp3", t: 0.05, volumen: 0.35 },
    { archivo: "sfx/memes/voz-c.wav", t: 0.4, volumen: 1 },
    { archivo: "sfx/memes/scratch.mp3", t: 3.15, volumen: 0.8 },
    { archivo: "sfx/memes/boom.mp3", t: 3.4, volumen: 0.9 },
    { archivo: "sfx/memes/vapor.wav", t: 3.45, volumen: 0.5 },
    { archivo: "sfx/memes/voz-d.wav", t: 3.6, volumen: 1 },
    { archivo: "sfx/memes/boom.mp3", t: 6.4, volumen: 0.6 },
    { archivo: "sfx/memes/vapor.wav", t: 6.45, volumen: 0.6 },
    { archivo: "sfx/memes/trombon.mp3", t: 6.7, volumen: 0.8 },
  ],
};

export const MEME_COFRE: MemeProps = {
  musica: "sfx/memes/musica.mp3",
  corte: 2.7,
  tomas: [
    { archivo: "real/v6-cofre.mp4", desde: 0.2, dur: 2.7, zoom: [1.0, 1.08], texto: "Cuando abren el cofre\nde tu carro..." },
    { archivo: "real/a3-conductor.mp4", desde: 0.3, dur: 4.4, zoom: [1.0, 1.4], texto: "...y nadie dice nada 😶" },
  ],
  sonidos: [
    { archivo: "sfx/memes/boing.mp3", t: 0.05, volumen: 0.3 },
    { archivo: "sfx/memes/voz-e1.wav", t: 0.3, volumen: 1 },
    { archivo: "sfx/memes/scratch.mp3", t: 2.45, volumen: 0.8 },
    { archivo: "sfx/memes/voz-e2.wav", t: 2.95, volumen: 1 },
    { archivo: "sfx/memes/grillos-largo.wav", t: 3.6, volumen: 0.9 },
    { archivo: "sfx/memes/boom.mp3", t: 6.3, volumen: 0.8 },
  ],
};

export const MEME_FRIO: MemeProps = {
  musica: "sfx/memes/musica.mp3",
  corte: 3.0,
  tomas: [
    { archivo: "real/v5-bateria-frio.mp4", desde: 0, dur: 3.0, zoom: [1.0, 1.08], texto: "Mi carro en las mañanas\nde diciembre:" },
    { archivo: "real/v5-bateria-frio.mp4", desde: 1.6, dur: 3.3, zoom: [1.25, 1.45], texto: "Ay no... 5 minutitos\nmás, jefe 😴" },
    { archivo: "real/m1-calentar.mp4", desde: 0.2, dur: 3.2, zoom: [1.05, 1.15], texto: "Yo, esperando afuera\na que despierte 🥶" },
  ],
  sonidos: [
    { archivo: "sfx/memes/voz-f1.wav", t: 0.2, volumen: 1 },
    { archivo: "sfx/viaje/marcha-falla.wav", t: 1.2, volumen: 0.8 },
    { archivo: "sfx/memes/scratch.mp3", t: 2.85, volumen: 0.8 },
    { archivo: "sfx/memes/voz-f2.wav", t: 3.2, volumen: 1 },
    { archivo: "sfx/memes/ronquido.mp3", t: 5.95, volumen: 0.9 },
    { archivo: "sfx/memes/boing.mp3", t: 6.3, volumen: 0.3 },
    { archivo: "sfx/memes/voz-f3.wav", t: 6.5, volumen: 1 },
    { archivo: "sfx/memes/trombon.mp3", t: 8.1, volumen: 0.75 },
  ],
};
