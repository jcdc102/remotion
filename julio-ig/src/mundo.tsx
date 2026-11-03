import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// Paisaje animado de la bahía al atardecer: cielo, sol que baja, nubes, aves, montañas y mar con olas.
// El horizonte del mar está en y=1330; las ilustraciones de cada escena se apoyan cerca de y=1420.
export const HORIZONTE = 1330;

const ola = (frame: number, fase: number, amp: number, y: number, largo: number) => {
  let d = `M -20 ${y}`;
  for (let x = -20; x <= 1100; x += 20) {
    d += ` L ${x} ${y + Math.sin((x / largo) * Math.PI * 2 + frame / 12 + fase) * amp}`;
  }
  return `${d} L 1100 1920 L -20 1920 Z`;
};

const Ave: React.FC<{ x: number; y: number; tam: number; aleteo: number }> = ({ x, y, tam, aleteo }) => (
  <svg style={{ position: "absolute", left: x, top: y }} width={tam} height={tam} viewBox="0 0 40 20">
    <path d={`M 2 ${10 - aleteo * 6} Q 11 ${2 + aleteo * 4} 20 10 Q 29 ${2 + aleteo * 4} 38 ${10 - aleteo * 6}`} stroke="#1A1230" strokeWidth={2.6} fill="none" strokeLinecap="round" />
  </svg>
);

export const Mundo: React.FC<{ duracion: number }> = ({ duracion }) => {
  const frame = useCurrentFrame();
  const solY = interpolate(frame, [0, duracion], [1110, 1215]);
  const deriva = (v: number) => ((frame * v) % 1400) - 200;
  const aves: [number, number, number, number][] = [
    [0.9, 520, 46, 0],
    [1.1, 470, 34, 40],
    [0.8, 590, 38, 90],
    [1.3, 540, 28, 160],
  ];
  return (
    <AbsoluteFill>
      {/* Cielo */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, #0E1B2E 0%, #1E1E45 22%, #3A1F4A 40%, #7A3358 56%, #D2604F 66%, #FF9A5C 71%, #FFC27A 74%)",
        }}
      />
      {/* Sol con resplandor */}
      <div
        style={{
          position: "absolute",
          left: 720 - 330,
          top: solY - 330,
          width: 660,
          height: 660,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,214,140,0.55) 0%, rgba(255,150,90,0.18) 40%, transparent 70%)",
        }}
      />
      <div style={{ position: "absolute", left: 720 - 120, top: solY - 120, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, #FFF1C9 0%, #FFC27A 55%, #FF8F5A 100%)" }} />
      {/* Nubes */}
      {[
        [0.35, 760, 300, 70, 0.35],
        [0.22, 900, 420, 90, 0.25],
        [0.5, 690, 220, 50, 0.3],
      ].map(([v, y, w, h, o], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: ((frame * v + i * 420) % 1500) - 300,
            top: y,
            width: w,
            height: h,
            borderRadius: h,
            background: `rgba(255,190,170,${o})`,
            filter: "blur(6px)",
          }}
        />
      ))}
      {/* Aves */}
      {aves.map(([v, y, tam, desfase], i) => (
        <Ave key={i} x={deriva(v * 2.2 + desfase / 100) + desfase} y={y + Math.sin(frame / 20 + i) * 12} tam={tam} aleteo={(Math.sin(frame / 3 + i) + 1) / 2} />
      ))}
      {/* Montañas (Sierra Madre) en tres capas */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1080} height={1920}>
        <path
          d={`M -20 ${HORIZONTE} L -20 1150 Q 120 1060 260 1130 Q 380 1040 520 1120 Q 650 1070 760 1140 Q 900 1050 1100 1120 L 1100 ${HORIZONTE} Z`}
          fill="#5A2E58"
          opacity={0.75}
        />
        <path
          d={`M -20 ${HORIZONTE} L -20 1220 Q 150 1160 300 1215 Q 460 1150 620 1225 Q 800 1170 960 1230 Q 1040 1210 1100 1220 L 1100 ${HORIZONTE} Z`}
          fill="#3F2348"
        />
        <path d={`M -20 ${HORIZONTE} L -20 1290 Q 220 1250 420 1290 Q 650 1260 860 1295 Q 980 1280 1100 1290 L 1100 ${HORIZONTE} Z`} fill="#2A1A3A" />
        {/* Mar en capas con olas */}
        <path d={ola(frame, 0, 4, HORIZONTE, 360)} fill="#3B2A5C" />
        <path d={ola(frame, 1.5, 6, HORIZONTE + 60, 300)} fill="#2C2350" />
        <path d={ola(frame, 3, 8, HORIZONTE + 150, 260)} fill="#1E1B40" />
        <path d={ola(frame, 4.5, 10, HORIZONTE + 280, 220)} fill="#141634" />
      </svg>
      {/* Reflejo del sol en el agua */}
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 720 - (140 - i * 12) / 1 + Math.sin(frame / 9 + i) * 14,
            top: HORIZONTE + 14 + i * 26,
            width: (140 - i * 12) * 2,
            height: 6,
            borderRadius: 3,
            background: "#FFC27A",
            opacity: (0.55 - i * 0.05) * (0.6 + 0.4 * Math.sin(frame / 6 + i * 1.7)),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};
