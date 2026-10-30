import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

export const Petalos: React.FC<{ cantidad: number }> = ({ cantidad }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(cantidad).fill(true).map((_, i) => {
        const tam = 16 + random(`tam-${i}`) * 22;
        const velocidad = 2.5 + random(`vel-${i}`) * 3.5;
        const recorrido = height + 200;
        const y = ((random(`ini-${i}`) * recorrido + frame * velocidad) % recorrido) - 100;
        const x =
          random(`x-${i}`) * width +
          Math.sin(frame / 25 + random(`fase-${i}`) * 10) * 40;
        const giro = frame * (2 + random(`giro-${i}`) * 4) + random(`r-${i}`) * 360;
        const tono = random(`tono-${i}`) > 0.5 ? "#ff9f1c" : "#f77f00";
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: tam,
              height: tam * 1.3,
              background: `linear-gradient(135deg, #ffd166, ${tono})`,
              borderRadius: "60% 0 60% 0",
              transform: `rotate(${giro}deg) rotateX(${giro * 1.5}deg)`,
              opacity: 0.9,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
