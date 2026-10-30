import {
  AbsoluteFill,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { tituloFont, versoFont } from "./fonts";

const useSalida = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({ frame, fps, config: { damping: 11 } });
  const calavera = spring({ frame: frame - 12, fps, config: { damping: 8 } });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity: useSalida(),
        fontFamily: tituloFont,
        textAlign: "center",
      }}
    >
      <div style={{ transform: `scale(${entrada})` }}>
        <div
          style={{
            fontSize: 170,
            lineHeight: 1,
            color: "#ffb703",
            textShadow: "0 8px 0 #9d0208, 0 18px 40px rgba(0,0,0,0.5)",
          }}
        >
          Calaveritas
        </div>
        <div
          style={{
            fontSize: 120,
            color: "#fff4e0",
            textShadow: "0 6px 0 #5a189a",
            marginTop: 10,
          }}
        >
          del taller
        </div>
        <div
          style={{
            fontSize: 150,
            marginTop: 20,
            transform: `scale(${calavera}) rotate(${(1 - calavera) * -40}deg)`,
          }}
        >
          💀
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Verso: React.FC<{
  numero: number;
  linea1: string;
  linea2: string;
  icono: string;
  inicioLinea2: number;
}> = ({ numero, linea1, linea2, icono, inicioLinea2 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tarjeta = spring({ frame, fps, config: { damping: 14 } });
  const l1 = spring({ frame: frame - 6, fps, config: { damping: 16 } });
  const l2 = spring({ frame: frame - inicioLinea2, fps, config: { damping: 16 } });
  const brinco = Math.abs(Math.sin(frame / 8)) * -14;
  const linea = (p: number): React.CSSProperties => ({
    opacity: p,
    transform: `translateY(${(1 - p) * 40}px)`,
  });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: "0 80px",
        opacity: useSalida(),
      }}
    >
      <div
        style={{
          transform: `scale(${0.85 + tarjeta * 0.15})`,
          opacity: tarjeta,
          background: "rgba(20, 6, 36, 0.78)",
          border: "6px solid #ff9f1c",
          borderRadius: 48,
          padding: "70px 60px 80px",
          textAlign: "center",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          width: "100%",
        }}
      >
        <div style={{ fontSize: 120, transform: `translateY(${brinco}px)` }}>
          {icono}
        </div>
        <div
          style={{
            fontFamily: tituloFont,
            fontSize: 48,
            color: "#ff9f1c",
            letterSpacing: 4,
            margin: "10px 0 30px",
          }}
        >
          CALAVERITA {numero}
        </div>
        <div
          style={{
            fontFamily: versoFont,
            fontWeight: 800,
            fontSize: 74,
            lineHeight: 1.2,
            color: "#fff4e0",
          }}
        >
          <div style={linea(l1)}>{linea1}</div>
          <div style={{ ...linea(l2), color: "#ffd166", marginTop: 30 }}>
            {linea2}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pregunta = spring({ frame, fps, config: { damping: 12 } });
  const logo = spring({ frame: frame - 15, fps, config: { damping: 10 } });
  const flecha = Math.sin(frame / 5) * 14;
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        gap: 70,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: tituloFont,
          fontSize: 110,
          color: "#fff4e0",
          transform: `scale(${pregunta})`,
          textShadow: "0 6px 0 #9d0208",
        }}
      >
        ¿Cuál es la tuya?
        <div style={{ transform: `translateY(${flecha}px)`, marginTop: 10 }}>
          👇
        </div>
      </div>
      <div
        style={{
          transform: `scale(${logo})`,
          background: "#cc2328",
          borderRadius: 48,
          padding: "90px 70px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
          border: "8px solid #fff4e0",
        }}
      >
        <Img src={staticFile("logo-doctor-auto.png")} style={{ width: 760 }} />
      </div>
    </AbsoluteFill>
  );
};
