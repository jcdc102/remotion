import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as cargarSans } from "@remotion/google-fonts/Poppins";
import { Audio } from "@remotion/media";

export const { fontFamily: SERIF } = cargarSerif("normal", { weights: ["700", "800"], subsets: ["latin"] });
export const { fontFamily: SANS } = cargarSans("normal", { weights: ["500", "600"], subsets: ["latin"] });

// Colores de atardecer, los mismos de las frases de la cuenta.
export const C = {
  noche: "#0E1B2E",
  morado: "#3A1F4A",
  coral: "#FF6B5B",
  naranja: "#FFA552",
  crema: "#FFF4E6",
  verde: "#5BD6A0",
  tarjeta: "rgba(255,244,230,0.08)",
};

// Zonas: texto desde y=330; visual entre y=930 y y=1430. Libres el 15% superior y el 25% inferior.
export const ZONA_TEXTO = 330;
export const ZONA_VISUAL = 930;

export const useEntrada = (retraso = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - retraso, fps, config: { damping, mass: 0.6 } });
};

export const Palabras: React.FC<{
  texto: string;
  tam: number;
  fuente: string;
  peso: number;
  retraso: number;
  resaltar: string[] | null;
  color: string;
}> = ({ texto, tam, fuente, peso, retraso, resaltar, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palabras = texto.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `${tam * 0.12}px ${tam * 0.26}px` }}>
      {palabras.map((p, i) => {
        const s = spring({ frame: frame - retraso - i * 2, fps, config: { damping: 13, mass: 0.5 } });
        const limpia = p.replace(/[.,:]/g, "");
        const clave = resaltar?.includes(limpia) ?? false;
        const signo = clave ? p.slice(limpia.length) : "";
        const letra = { fontFamily: fuente, fontWeight: peso, fontSize: tam, lineHeight: 1.15 };
        return (
          <span
            key={i}
            style={{
              ...letra,
              color,
              opacity: s,
              transform: `translateY(${(1 - s) * 30}px) scale(${clave ? 0.85 + s * 0.15 : 1})`,
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            {clave ? (
              <span
                style={{
                  color: C.noche,
                  background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`,
                  borderRadius: tam * 0.25,
                  padding: `0 ${tam * 0.18}px`,
                }}
              >
                {limpia}
              </span>
            ) : (
              p
            )}
            {signo}
          </span>
        );
      })}
    </div>
  );
};

const Fondo: React.FC<{ duracion: number }> = ({ duracion }) => {
  const frame = useCurrentFrame();
  const sol = interpolate(frame, [0, duracion], [1500, 1380]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.noche} 0%, ${C.morado} 55%, #8A3B4E 85%, ${C.coral} 100%)` }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 450,
          top: sol,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.naranja}55 0%, ${C.coral}22 45%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Encabezado: React.FC<{ duracion: number; etiqueta: string | null }> = ({ duracion, etiqueta }) => {
  const frame = useCurrentFrame();
  const avance = frame / duracion;
  return (
    <>
      <div style={{ position: "absolute", left: 80, right: 80, top: 270, height: 6, borderRadius: 3, background: "rgba(255,244,230,0.18)" }}>
        <div style={{ width: `${avance * 100}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})` }} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 288, fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.crema, opacity: 0.6 }}>
        @julio.chaidez1{etiqueta ? ` · ${etiqueta}` : null}
      </div>
    </>
  );
};

export const Bloque: React.FC<{ n: number | null; titulo: string; texto: string | null; resaltar: string[] | null; tTitulo: number; tTexto: number }> = ({
  n,
  titulo,
  texto,
  resaltar,
  tTitulo,
  tTexto,
}) => {
  const insignia = useEntrada(0, 10);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: ZONA_TEXTO + 40, display: "flex", flexDirection: "column", gap: 28 }}>
      {n !== null ? (
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 56,
            color: C.noche,
            transform: `scale(${insignia})`,
          }}
        >
          {n}
        </div>
      ) : null}
      <Palabras texto={titulo} tam={78} fuente={SERIF} peso={800} retraso={tTitulo} resaltar={resaltar} color={C.crema} />
      {texto ? <Palabras texto={texto} tam={42} fuente={SANS} peso={500} retraso={tTexto} resaltar={null} color="rgba(255,244,230,0.85)" /> : null}
    </div>
  );
};

export const Visual: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const s = useEntrada(8);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: ZONA_VISUAL,
        height: 500,
        borderRadius: 40,
        background: C.tarjeta,
        border: "2px solid rgba(255,244,230,0.12)",
        overflow: "hidden",
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
      }}
    >
      {children}
    </div>
  );
};


const CORTE = 6;

const Escena: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  // Corte seco con un pequeño empuje al entrar y al salir.
  const entra = interpolate(frame, [0, CORTE], [1.04, 1], { extrapolateRight: "clamp" });
  const sale = interpolate(frame, [dur - CORTE, dur], [1, 0], { extrapolateLeft: "clamp" });
  return <AbsoluteFill style={{ transform: `scale(${entra})`, opacity: sale }}>{children}</AbsoluteFill>;
};

// Un reel completo: fondo, voz, música, efectos, escenas y encabezado.
// fondo: un fondo propio (por ejemplo <Mundo />); con null se usa el degradado de atardecer.
export const Reel: React.FC<{
  duracion: number;
  fondo: React.ReactNode | null;
  etiqueta: string | null;
  voz: string;
  musica: string;
  sonidos: [number, string, number][];
  escenas: { desde: number; dur: number; Pieza: React.FC }[];
}> = ({ duracion, fondo, etiqueta, voz, musica, sonidos, escenas }) => (
  <AbsoluteFill>
    {fondo ?? <Fondo duracion={duracion} />}
    <Audio src={staticFile(voz)} />
    <Audio
      src={staticFile(musica)}
      volume={(f) =>
        0.14 * interpolate(f, [0, 15, duracion - 45, duracion], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
      }
    />
    {sonidos.map(([desde, archivo, volumen], i) => (
      <Sequence key={i} from={desde} durationInFrames={45}>
        <Audio src={staticFile(`sfx/${archivo}.wav`)} volume={volumen} />
      </Sequence>
    ))}
    {escenas.map(({ desde, dur, Pieza }, i) => (
      <Sequence key={i} from={desde} durationInFrames={dur}>
        <Escena dur={i === escenas.length - 1 ? dur + CORTE : dur}>
          <Pieza />
        </Escena>
      </Sequence>
    ))}
    <Encabezado duracion={duracion} etiqueta={etiqueta} />
  </AbsoluteFill>
);
