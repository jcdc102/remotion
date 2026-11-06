import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Video } from "@remotion/media";

// Piezas de acabado «cine» para reels con tomas reales.
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Toma real a pantalla completa con zoom lento, color cálido, viñeta y entrada con desenfoque.
export const Toma: React.FC<{ src: string; desde: number; dur: number; zoom: [number, number]; mover: number }> = ({ src, desde, dur, zoom, mover }) => {
  const frame = useCurrentFrame();
  const escala = interpolate(frame, [0, dur], zoom);
  const x = interpolate(frame, [0, dur], [0, mover]);
  const entrada = interpolate(frame, [0, 9], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${escala + entrada * 0.12}) translateX(${x}px)`, filter: `blur(${entrada * 14}px) contrast(1.08) saturate(1.12) brightness(0.96)` }}>
        <Video src={staticFile(`tomas/${src}`)} muted trimBefore={desde * 30} objectFit="cover" style={{ width: "100%", height: "100%" }} />
      </AbsoluteFill>
      {/* Tono cálido de atardecer, como el resto de la cuenta */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(14,27,46,0.10), rgba(255,138,80,0.10))", mixBlendMode: "soft-light" }} />
      {/* Oscurecer arriba para el texto y abajo para la interfaz */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(8,10,24,0.88) 0%, rgba(8,10,24,0.55) 30%, rgba(8,10,24,0) 52%, rgba(8,10,24,0) 70%, rgba(8,10,24,0.7) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// Destello de luz cálida que cruza la pantalla en cada cambio de toma.
export const Destello: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, 14], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${-20 + p * 140}% 30%, rgba(255,190,120,0.75) 0%, rgba(255,120,80,0.35) 22%, transparent 45%)`,
        mixBlendMode: "screen",
        opacity: Math.sin(p * Math.PI),
        pointerEvents: "none",
      }}
    />
  );
};

// Grano de película fino en todo el video.
export const Grano: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width={1080} height={1920}>
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={frame % 30} />
        </filter>
        <rect width={1080} height={1920} filter="url(#grano)" />
      </svg>
    </AbsoluteFill>
  );
};

