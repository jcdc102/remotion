import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

const COLORES = ["#ff3e9a", "#ff8c1a", "#ffd23f", "#2ec4b6", "#3a86ff", "#c77dff"];
const ANCHO = 150;
const ALTO = 190;

// Bandera con orilla en zigzag y figuras recortadas (calavera, flores, rombos).
export const Bandera: React.FC<{ color: string; id: string }> = ({ color, id }) => {
  const dientes = 8;
  const paso = ANCHO / dientes;
  let orilla = `M0 0 H${ANCHO} V${ALTO - 14}`;
  for (let i = dientes; i > 0; i--) {
    orilla += ` L${(i - 0.5) * paso} ${ALTO} L${(i - 1) * paso} ${ALTO - 14}`;
  }
  orilla += " Z";
  return (
    <svg width={ANCHO} height={ALTO} viewBox={`0 0 ${ANCHO} ${ALTO}`}>
      <defs>
        <mask id={id}>
          <path d={orilla} fill="white" />
          {/* calavera */}
          <circle cx={75} cy={82} r={32} fill="black" />
          <rect x={58} y={100} width={34} height={24} rx={6} fill="black" />
          <circle cx={63} cy={80} r={9} fill="white" />
          <circle cx={87} cy={80} r={9} fill="white" />
          <path d="M75 92 L70 101 H80 Z" fill="white" />
          <rect x={66} y={112} width={3} height={12} fill="white" />
          <rect x={74} y={112} width={3} height={12} fill="white" />
          <rect x={82} y={112} width={3} height={12} fill="white" />
          {/* adornos */}
          {[22, 128].map((x) => (
            <g key={x}>
              <circle cx={x} cy={30} r={9} fill="black" />
              <path d={`M${x} 140 l10 14 l-10 14 l-10 -14 Z`} fill="black" />
            </g>
          ))}
          {[45, 75, 105].map((x) => (
            <circle key={x} cx={x} cy={22} r={5} fill="black" />
          ))}
        </mask>
      </defs>
      <rect width={ANCHO} height={ALTO} fill={color} mask={`url(#${id})`} />
    </svg>
  );
};

const Guirnalda: React.FC<{ y: number; desfase: number; escala: number }> = ({
  y,
  desfase,
  escala,
}) => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();
  const t = frame / fps;
  const cantidad = 7;
  const separacion = width / cantidad;
  const caida = 40;
  return (
    <>
      <svg
        width={width}
        height={y + caida + 10}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path
          d={`M-20 ${y} Q${width / 2} ${y + caida * 2} ${width + 20} ${y}`}
          stroke="#f6e7c8"
          strokeWidth={3}
          fill="none"
        />
      </svg>
      {new Array(cantidad).fill(true).map((_, i) => {
        const x = separacion * (i + 0.5);
        const u = x / width;
        const yCuerda = y + caida * 4 * u * (1 - u);
        const giro = Math.sin(t * 2.2 + i * 0.9 + desfase) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - (ANCHO * escala) / 2,
              top: yCuerda,
              transform: `scale(${escala}) rotate(${giro}deg)`,
              transformOrigin: "top center",
              width: ANCHO,
              filter: "drop-shadow(0 8px 10px rgba(0,0,0,0.35))",
            }}
          >
            <Bandera
              color={COLORES[(i + Math.round(desfase)) % COLORES.length]}
              id={`papel-${y}-${i}`}
            />
          </div>
        );
      })}
    </>
  );
};

export const PapelPicado: React.FC = () => {
  return (
    <AbsoluteFill>
      <Guirnalda y={-6} desfase={0} escala={0.95} />
      <Guirnalda y={150} desfase={3} escala={0.8} />
    </AbsoluteFill>
  );
};
