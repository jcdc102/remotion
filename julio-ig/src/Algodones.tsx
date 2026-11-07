import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { Destello, Grano } from "./cine";
import { C, Reel, SANS, SERIF } from "./comun";
import { Camara, TextoMascara, Transformar } from "./edicion";

// Los Algodones, Baja California: turismo de salud. Un solo recorrido continuo con las 5 indicaciones de edición:
// entradas sincronizadas con la voz, cámara que sigue lo importante, objetos que se transforman en la escena siguiente,
// movimientos encadenados y títulos revelados desde una máscara. Ritmo pausado.
// Datos: INEGI, DENUE (consulta del 7 nov 2026) y Rodríguez Blanco, A. (2020), Contexto Odontológico, 10(19), 50-58 (UNAM).
// Voz con pausas: public/voz-algodones.mp3 (52 s). Tiempos de cada palabra estimados dentro de cada frase medida.
export const DURACION_ALGODONES = 1560;

const FUENTE_UNAM = "Fuente: Rodríguez Blanco (2020), Contexto Odontológico, UNAM";
const FUENTE_INEGI = "Fuente: INEGI, DENUE (consulta del 7 de noviembre de 2026)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const mezcla = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);

// Tramos (fotogramas, 30 fps).
const T = { gancho: 0, mapa: 175, visitantes: 410, historia: 640, manzanas: 830, temporada: 995, salud: 1270, cierre: 1410 };

const SONIDOS: [number, string, number][] = [
  [20, "pop", 0.25],
  [97, "whoosh", 0.3], // los dientes se juntan
  [128, "pop", 0.4], // 311
  [178, "whoosh", 0.35], // 311 → pin
  [353, "brillo", 0.3], // Molar City
  [456, "pop", 0.3],
  [488, "pop", 0.3],
  [645, "whoosh", 0.35], // maleta → cartel
  [835, "whoosh", 0.35], // cartel → gráfica
  [910, "pop", 0.35],
  [957, "pop", 0.3],
  [1000, "whoosh", 0.35], // barra → termómetro
  [1044, "tachar", 0.2],
  [1205, "brillo", 0.3], // pájaros de la nieve
  [1262, "whoosh", 0.35], // pájaros → insignia
  [1307, "ding", 0.3],
  [1415, "whoosh", 0.35], // insignia → globo
  [1440, "notificacion", 0.35],
];

// Vidrio esmerilado para los paneles.
const VIDRIO: React.CSSProperties = {
  background: "linear-gradient(160deg, rgba(46,50,92,0.62), rgba(14,18,40,0.78))",
  backdropFilter: "blur(18px) saturate(140%)",
  border: "1.5px solid rgba(255,244,230,0.16)",
  boxShadow: "0 50px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.22)",
};

const Desierto: React.FC = () => {
  const frame = useCurrentFrame();
  const solY = interpolate(frame, [0, DURACION_ALGODONES], [1080, 1170]);
  const deriva = interpolate(frame, [0, DURACION_ALGODONES], [0, -60]);
  // Profundidad de campo: el fondo se desenfoca mientras hay paneles al frente.
  const enfoque = interpolate(frame, [150, 200, 1395, 1440], [0, 6, 6, 2], clamp);
  const Cactus: React.FC<{ x: number; y: number; e: number }> = ({ x, y, e }) => (
    <svg style={{ position: "absolute", left: x + deriva * 1.6, top: y }} width={90 * e} height={160 * e} viewBox="0 0 90 160">
      <path d="M38 160 L38 30 Q45 10 52 30 L52 160 Z M38 90 L22 90 Q12 90 12 75 L12 55 Q17 45 22 55 L22 78 L38 78 Z M52 70 L66 70 L66 45 Q71 35 76 45 L76 66 Q76 82 66 82 L52 82 Z" fill="#1E0F24" />
    </svg>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `blur(${enfoque}px)`, transform: `scale(${1 + enfoque * 0.004})` }}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, #070B1C 0%, #1C1A44 26%, #5E2A55 46%, #C4544E 58%, #FF9A5C 65%, #FFC98A 69%)" }} />
        {Array.from({ length: 70 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: (i * 157) % 1080, top: (i * 89) % 820, width: i % 7 === 0 ? 4 : 2, height: i % 7 === 0 ? 4 : 2, borderRadius: 2, background: "#FFF4E6", opacity: (0.25 + 0.6 * Math.abs(Math.sin(frame / 30 + i))) * interpolate((i * 89) % 820, [0, 820], [1, 0.1]) }} />
        ))}
        {/* Rayos de sol que giran muy despacio */}
        <div style={{ position: "absolute", left: 300 - 900, top: solY - 900, width: 1800, height: 1800, borderRadius: "50%", background: "repeating-conic-gradient(from 0deg, rgba(255,214,150,0.14) 0deg 4deg, transparent 4deg 14deg)", transform: `rotate(${frame * 0.04}deg)`, mixBlendMode: "screen", WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 60%)" }} />
        <div style={{ position: "absolute", left: 0, top: solY - 300, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.55) 0%, rgba(255,150,90,0.15) 40%, transparent 70%)" }} />
        <div style={{ position: "absolute", left: 190, top: solY - 110, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, #FFF6DC 0%, #FFC98A 55%, #FF8F5A 100%)", boxShadow: "0 0 120px rgba(255,190,120,0.7)" }} />
        <svg style={{ position: "absolute", left: deriva * 0.4, top: 0 }} width={1200} height={1920}>
          <defs>
            <linearGradient id="bruma" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFB98A" stopOpacity="0.35" />
              <stop offset="1" stopColor="#FFB98A" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M-20 1300 L-20 1140 L90 1070 L170 1120 L280 1040 L380 1110 L520 1060 L640 1130 L760 1050 L880 1120 L1000 1070 L1220 1130 L1220 1300 Z" fill="#4A2550" opacity={0.85} />
          <rect x={-20} y={1150} width={1240} height={160} fill="url(#bruma)" />
          <path d="M-20 1320 Q 200 1220 420 1270 Q 640 1200 860 1270 Q 1040 1230 1220 1260 L1220 1920 L-20 1920 Z" fill="#A9573B" />
          <path d="M-20 1400 Q 260 1330 520 1390 Q 780 1340 1220 1380 L1220 1920 L-20 1920 Z" fill="#7E3D2E" />
          <path d="M-20 1520 Q 300 1470 620 1510 Q 900 1480 1220 1500 L1220 1920 L-20 1920 Z" fill="#4A2424" />
        </svg>
        <Cactus x={70} y={1250} e={0.9} />
        <Cactus x={880} y={1300} e={1.2} />
        <Cactus x={600} y={1360} e={0.6} />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 1240 + i * 14, height: 3, background: "rgba(255,210,160,0.12)", transform: `translateX(${Math.sin(frame / 14 + i) * 20}px)` }} />
        ))}
      </AbsoluteFill>
      {/* Polvo flotando con desenfoque (bokeh), delante del paisaje */}
      {Array.from({ length: 26 }).map((_, i) => {
        const t = ((frame * (0.3 + (i % 5) * 0.08) + i * 97) % 2100) / 2100;
        const tam = 4 + (i % 6) * 3;
        return (
          <div key={i} style={{ position: "absolute", left: (i * 211) % 1080 + Math.sin(frame / 40 + i) * 30, top: 1900 - t * 2000, width: tam, height: tam, borderRadius: tam, background: "#FFD9A8", filter: `blur(${(i % 4) * 1.5}px)`, opacity: 0.18 + (i % 3) * 0.1 }} />
        );
      })}
      {/* Destellos de lente */}
      {[0.25, 0.45, 0.7].map((k, i) => (
        <div key={i} style={{ position: "absolute", left: 300 + (540 - 300) * k * 2 - 40, top: solY + (700 - solY) * k * 2 - 40, width: 80 + i * 30, height: 80 + i * 30, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,200,150,0.18), transparent 70%)", mixBlendMode: "screen" }} />
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// Degradados compartidos (dientes brillantes, barras, vidrio del termómetro).
const Degradados: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="gDiente" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFFFFF" />
        <stop offset="0.55" stopColor="#F3E8D8" />
        <stop offset="1" stopColor="#CDBBA2" />
      </linearGradient>
      <linearGradient id="gDienteNaranja" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFD29A" />
        <stop offset="1" stopColor="#FF6B5B" />
      </linearGradient>
    </defs>
  </svg>
);

const Diente: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path fill={color === "brillo" ? "url(#gDiente)" : color === "brilloNaranja" ? "url(#gDienteNaranja)" : color} d="M7 2C4.2 2 2.5 4.3 2.8 7.4c.3 2.6 1.4 4.3 1.9 6.8.5 2.6.7 7.8 2.8 7.8 1.9 0 1.9-4.6 3-6.4.4-.7.9-.7 1.4-.7s1 0 1.4.7c1.1 1.8 1.1 6.4 3 6.4 2.1 0 2.3-5.2 2.8-7.8.5-2.5 1.6-4.2 1.9-6.8C21.3 4.3 19.6 2 16.8 2c-2 0-3 1-4.8 1S9 2 7 2z" />
  </svg>
);

// Fuente: entra y sale con su tramo.
const Fuente: React.FC<{ texto: string; desde: number; hasta: number }> = ({ texto, desde, hasta }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [desde, desde + 15, hasta - 12, hasta], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 1392, padding: "8px 16px", borderRadius: 14, background: "rgba(14,27,46,0.78)", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 21, color: "rgba(255,244,230,0.8)", opacity: o }}>
      {texto}
    </div>
  );
};

// Título revelado desde una máscara y sincronizado palabra por palabra; sale subiendo antes del siguiente.
const Titulo: React.FC<{ texto: string; tiempos: number[]; resaltar: string[] | null; frase: string | null; tiemposFrase: number[] | null; hasta: number }> = ({
  texto,
  tiempos,
  resaltar,
  frase,
  tiemposFrase,
  hasta,
}) => {
  const frame = useCurrentFrame();
  const desde = tiempos[0] - 2;
  if (frame < desde - 2 || frame > hasta + 2) return null;
  const sale = mezcla(frame, hasta - 14, hasta);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: 330, opacity: 1 - sale, transform: `translateY(${-sale * 40}px)`, textShadow: "0 4px 30px rgba(0,0,0,0.55)" }}>
      <TextoMascara texto={texto} desde={desde} tiempos={tiempos} tam={84} fuente={SERIF} peso={800} color={C.crema} resaltar={resaltar} />
      {frase && tiemposFrase ? (
        <div style={{ marginTop: 20 }}>
          <TextoMascara texto={frase} desde={tiemposFrase[0]} tiempos={tiemposFrase} tam={40} fuente={SANS} peso={500} color="rgba(255,244,230,0.88)" resaltar={null} />
        </div>
      ) : null}
    </div>
  );
};

// Reparte palabras entre dos fotogramas (inicio y fin de una frase medida en la voz).
const repartir = (n: number, a: number, b: number) => Array.from({ length: n }, (_, i) => Math.round(a + ((b - a) * i) / n));

// ---------- Mundo del mapa (coordenadas propias, la cámara lo recorre) ----------
// Geografía según el mapa que mandó Julio: el pueblo es un triángulo pegado a la línea fronteriza,
// la garita (Andrade, California) está en su esquina noreste, el río Colorado corre por el este
// (del otro lado, Arizona y Yuma) y Mexicali queda al oeste, a unos 70 km (Rodríguez Blanco, 2020, p. 57).
const LINEA = 420; // línea fronteriza
const PIN = { x: 960, y: 550 }; // centro del pueblo
const GARITA = { x: 1090, y: LINEA };
const RIO = "M 1300 0 Q 1230 220 1180 420 Q 1150 520 1110 610 Q 1060 720 1010 820 Q 950 960 900 1100";
const PUEBLO = "M 750 420 L 1150 420 L 1112 560 L 1045 680 L 935 705 L 862 625 L 745 520 Z";
const Mapa: React.FC<{ visible: number }> = ({ visible }) => {
  const frame = useCurrentFrame();
  const pulso = (frame % 50) / 50;
  const eua = mezcla(frame, 290, 310);
  const mx = mezcla(frame, 234, 252);
  const molar = mezcla(frame, 353, 372);
  const banderas = [mezcla(frame, 456, 470), mezcla(frame, 488, 502)];
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1600, height: 1100, opacity: visible }}>
      <svg width={1600} height={1100}>
        <defs>
          <filter id="ruido">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={7} />
            <feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.6  0 0 0 0 0.85  0 0 0 0.22 0" />
          </filter>
          <filter id="brillo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
          <clipPath id="tarjetaMapa">
            <rect x={0} y={0} width={1600} height={1100} rx={60} />
          </clipPath>
          <linearGradient id="haz" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FFB3A8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFB3A8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <g clipPath="url(#tarjetaMapa)">
          {/* México (oeste del río, abajo de la línea) y Estados Unidos (arriba de la línea y al este del río) */}
          <rect x={0} y={0} width={1600} height={1100} fill="#0F1529" />
          <path d={`M 0 ${LINEA} L 1180 ${LINEA} Q 1150 520 1110 610 Q 1060 720 1010 820 Q 950 960 900 1100 L 0 1100 Z`} fill="#161E3A" />
          <rect x={0} y={0} width={1600} height={1100} filter="url(#ruido)" />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={i * 200} y1={0} x2={i * 200} y2={1100} stroke="rgba(255,244,230,0.05)" strokeWidth={2} />
          ))}
          {/* El pueblo */}
          <path d={PUEBLO} fill="rgba(255,179,168,0.16)" stroke="rgba(255,179,168,0.6)" strokeWidth={4} strokeDasharray="10 8" />
          {/* Río Colorado */}
          <path d={RIO} fill="none" stroke="#5FD3E0" strokeWidth={30} filter="url(#brillo)" opacity={0.6} />
          <path d={RIO} fill="none" stroke="#9BE8F0" strokeWidth={10} />
          {/* Línea fronteriza */}
          <path d={`M 0 ${LINEA} L 1180 ${LINEA}`} stroke={C.coral} strokeWidth={22} fill="none" filter="url(#brillo)" opacity={0.7} />
          <path d={`M 0 ${LINEA} L 1180 ${LINEA}`} stroke="#FFB3A8" strokeWidth={5} strokeDasharray="30 16" strokeDashoffset={-frame * 1.2} fill="none" />
        </g>
        <rect x={1} y={1} width={1598} height={1098} rx={60} fill="none" stroke="rgba(255,244,230,0.18)" strokeWidth={3} />
        <text x={90} y={LINEA - 70} fill="rgba(255,244,230,0.75)" fontFamily={SANS} fontWeight={600} fontSize={44} letterSpacing={10} opacity={eua}>ESTADOS UNIDOS</text>
        <text x={90} y={LINEA - 20} fill="rgba(255,244,230,0.5)" fontFamily={SANS} fontWeight={500} fontSize={32} letterSpacing={6} opacity={eua}>California</text>
        <text x={1240} y={780} fill="rgba(255,244,230,0.5)" fontFamily={SANS} fontWeight={600} fontSize={36} letterSpacing={8} opacity={eua}>ARIZONA</text>
        <text x={1300} y={560} fill="rgba(255,244,230,0.6)" fontFamily={SANS} fontWeight={500} fontSize={34} letterSpacing={3} opacity={eua}>Yuma →</text>
        <text x={1150} y={300} fill="rgba(255,244,230,0.55)" fontFamily={SANS} fontWeight={500} fontSize={30} letterSpacing={3} opacity={eua} transform="rotate(-72 1150 300)">río Colorado</text>
        <text x={90} y={LINEA + 90} fill="rgba(255,244,230,0.75)" fontFamily={SANS} fontWeight={600} fontSize={44} letterSpacing={10} opacity={mx}>MÉXICO</text>
        <text x={90} y={LINEA + 140} fill="rgba(255,244,230,0.5)" fontFamily={SANS} fontWeight={500} fontSize={32} letterSpacing={6} opacity={mx}>Baja California</text>
        <text x={90} y={1000} fill="rgba(255,244,230,0.6)" fontFamily={SANS} fontWeight={500} fontSize={34} letterSpacing={3} opacity={mx}>← Mexicali · 70 km</text>
        {/* Garita: esquina noreste del pueblo, frente a Andrade, California */}
        <circle cx={GARITA.x} cy={GARITA.y} r={16} fill="#FFF4E6" stroke={C.coral} strokeWidth={5} />
        <text x={GARITA.x + 26} y={GARITA.y - 24} fill="rgba(255,244,230,0.75)" fontFamily={SANS} fontWeight={600} fontSize={30}>garita · Andrade</text>
        <rect x={PIN.x - 6} y={PIN.y - 420} width={12} height={420} fill="url(#haz)" opacity={0.9} />
        <circle cx={PIN.x} cy={PIN.y} r={30 + pulso * 70} fill="none" stroke={C.coral} strokeWidth={6} opacity={1 - pulso} />
        <circle cx={PIN.x} cy={PIN.y} r={60} fill={C.coral} filter="url(#brillo)" opacity={0.8} />
        <circle cx={PIN.x} cy={PIN.y} r={30} fill={C.coral} stroke={C.crema} strokeWidth={6} />
        <text x={762} y={738} fill="rgba(255,244,230,0.7)" fontFamily={SANS} fontWeight={600} fontSize={28} letterSpacing={6}>VICENTE GUERRERO · nombre oficial</text>
        <text x={760} y={790} fill="#FFF4E6" fontFamily={SERIF} fontWeight={800} fontSize={58}>Los Algodones</text>
        <text x={1560} y={1070} textAnchor="end" fill="rgba(255,244,230,0.4)" fontFamily={SANS} fontSize={28}>mapa ilustrativo, no a escala</text>
      </svg>
      {/* «Molar City» revelado desde una máscara bajo el nombre */}
      <div style={{ position: "absolute", left: 760, top: 810, overflow: "hidden", padding: "0 6px" }}>
        <div style={{ transform: `translateY(${(1 - molar) * 110}%)`, fontFamily: SERIF, fontWeight: 800, fontStyle: "italic", fontSize: 72, color: "#FFB3A8", textShadow: "0 0 30px rgba(255,107,91,0.8)" }}>«Molar City»</div>
      </div>
      {/* Banderas del lado de Estados Unidos y visitantes que cruzan por la garita hacia el pueblo */}
      <div style={{ position: "absolute", left: GARITA.x - 330, top: LINEA - 170, fontSize: 90, opacity: banderas[0], transform: `scale(${0.6 + banderas[0] * 0.4})` }}>🇺🇸</div>
      <div style={{ position: "absolute", left: GARITA.x - 210, top: LINEA - 170, fontSize: 90, opacity: banderas[1], transform: `scale(${0.6 + banderas[1] * 0.4})` }}>🇨🇦</div>
      {Array.from({ length: 10 }).map((_, i) => {
        const ciclo = ((frame - 440 + i * 23) % 150) / 150;
        const activo = frame > 440 + i * 4;
        const x = GARITA.x - 30 + (i % 3) * 22 - ciclo * 90;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: LINEA - 160 + ciclo * 320, fontSize: 50, opacity: activo ? Math.sin(ciclo * Math.PI) : 0 }}>
            {["🧳", "🚶", "🧓", "🚶‍♀️", "🧳"][i % 5]}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Mundo de la gráfica de manzanas (coordenadas de pantalla; la cámara se acerca) ----------
const MANZANAS = [60, 31, 30, 27, 25, 18, 18, 16, 14, 12, 11, 9, 9, 7, 4, 4, 4, 3, 2, 2, 1, 1, 1, 1, 1];
const BARRA = (i: number, n: number) => ({ x: 130 + i * 34, y: 1140 - (n / 60) * 280, w: 26, h: (n / 60) * 280 });
const Grafica: React.FC<{ visible: number }> = ({ visible }) => {
  const frame = useCurrentFrame();
  const resalta = mezcla(frame, 910, 930);
  const garita = mezcla(frame, 957, 972);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: visible }}>
      <div style={{ position: "absolute", left: 100, top: 720, width: 880, height: 470, borderRadius: 30, ...VIDRIO }} />
      {[0, 1, 2, 3].map((k) => (
        <div key={k} style={{ position: "absolute", left: 130, width: 820, top: 860 + k * 70, height: 1, background: "rgba(255,244,230,0.08)" }} />
      ))}
      <div style={{ position: "absolute", left: 100, top: 720, width: 880, height: 56, borderRadius: "30px 30px 0 0", background: "repeating-linear-gradient(90deg, #C9C2B8 0 14px, transparent 14px 26px)", opacity: 0.4 + garita * 0.5 }} />
      <div style={{ position: "absolute", left: 100, width: 880, top: 728, display: "flex", justifyContent: "center", opacity: garita, transform: `scale(${0.8 + garita * 0.2})` }}>
        <div style={{ padding: "4px 18px", borderRadius: 10, background: C.crema, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.noche }}>🛂 Frontera · garita de Andrade</div>
      </div>
      {MANZANAS.map((n, i) => {
        const b = BARRA(i, n);
        const crece = interpolate(frame, [845 + i * 2, 875 + i * 2], [0, 1], clamp);
        const top5 = i < 5;
        return (
          <div key={i}>
            {top5 ? (
              <div style={{ position: "absolute", left: b.x - 10, width: 46, top: b.y - 30, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.crema, opacity: resalta }}>{n}</div>
            ) : null}
            <div
              style={{
                position: "absolute",
                left: b.x,
                top: 1140 - b.h * crece,
                width: b.w,
                height: b.h * crece + 4,
                borderRadius: 6,
                background: top5 ? `linear-gradient(180deg, ${C.naranja}, ${C.coral})` : "linear-gradient(180deg, #A99BC0, #6E6290)",
                opacity: top5 ? 0.55 + resalta * 0.45 : 0.9,
                boxShadow: top5 ? `0 0 ${10 + resalta * 30}px ${C.coral}, inset 0 2px 0 rgba(255,255,255,0.5)` : "inset 0 2px 0 rgba(255,255,255,0.35)",
                ...(i === 0 && frame >= T.temporada ? { opacity: 0 } : {}),
              }}
            />
            {/* Reflejo de la barra */}
            <div style={{ position: "absolute", left: b.x, top: 1146, width: b.w, height: b.h * crece * 0.35, borderRadius: 6, background: top5 ? C.coral : "#8A7A9A", opacity: 0.16, WebkitMaskImage: "linear-gradient(180deg, black, transparent)", ...(i === 0 && frame >= T.temporada ? { display: "none" } : {}) }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 130, top: 1150, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "rgba(255,244,230,0.7)" }}>Consultorios por manzana · las 5 primeras suman 173 de 311</div>
    </div>
  );
};

const DESTELLOS = [118, 176, 645, 832, 997, 1262, 1412];

const Escena: React.FC = () => (
  <CameraMotionBlur shutterAngle={160} samples={5}>
    <Recorrido />
  </CameraMotionBlur>
);

const Recorrido: React.FC = () => {
  const frame = useCurrentFrame();

  // 1. Gancho: 311 dientes que se juntan y se vuelven el número 311.
  const junta = interpolate(frame, [97, 126], [0, 1], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const dientes =
    frame < 132 ? (
      <div style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 311 }).map((_, i) => {
          const x0 = 90 + (i % 25) * 36;
          const y0 = 760 + Math.floor(i / 25) * 36;
          const aparece = mezcla(frame, 20 + i * 0.22, 32 + i * 0.22);
          return (
            <div key={i} style={{ position: "absolute", left: x0 + (525 - x0) * junta, top: y0 + (985 - y0) * junta, opacity: aparece * (1 - junta * 0.6), transform: `scale(${aparece * (1 - junta * 0.7)})` }}>
              <Diente tam={30} color={i % 9 === 0 ? "brilloNaranja" : "brillo"} />
            </div>
          );
        })}
      </div>
    ) : null;

  // 2. El 311 se transforma en el pin del mapa; la cámara sigue al pin y se aleja para mostrar la frontera.
  const mapaVisible = interpolate(frame, [T.mapa + 5, T.mapa + 30, T.historia, T.historia + 25], [0, 1, 1, 0], clamp);
  const pinPantallaY = 1000;
  const camMapa = [
    { f: T.mapa, x: PIN.x, y: PIN.y - (pinPantallaY - 960) / 3, s: 3 },
    { f: 230, x: PIN.x, y: PIN.y - (pinPantallaY - 960) / 3, s: 3 },
    { f: 300, x: 800, y: 560, s: 0.62 },
    { f: 400, x: 840, y: 560, s: 0.66 },
    { f: 450, x: GARITA.x - 60, y: GARITA.y + 100, s: 1.1 }, // se acerca a la garita, donde cruzan los visitantes
    { f: 620, x: GARITA.x - 70, y: GARITA.y + 110, s: 1.14 },
  ];

  // 4. Una maleta de los visitantes se transforma en el cartel de los años 70.
  const cartelContenido = (
    <div style={{ position: "relative", width: "100%", height: "100%", background: "radial-gradient(ellipse at 50% 40%, #F6E8CC 0%, #E8D2A6 70%, #C9A877 100%)", padding: 40, textAlign: "center", boxSizing: "border-box", filter: "sepia(0.25)" }}>
      <svg style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.35 }} width="100%" height="100%">
        <filter id="papel">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={3} />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.2  0 0 0 0.6 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#papel)" />
      </svg>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#6B3A22" }}>— 197X —</div>
      <div style={{ margin: "18px auto", width: 150 }}>
        <Diente tam={150} color="#6B3A22" />
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 64, color: "#3A1F14" }}>DENTISTA</div>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontStyle: "italic", fontSize: 40, color: "#6B3A22" }}>en Los Algodones</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "#6B3A22", marginTop: 24, opacity: 0.8 }}>ilustración</div>
    </div>
  );
  const flota = Math.sin(frame / 18) * 6;

  // 5. El cartel se encoge y se vuelve la primera barra de la gráfica; la cámara se acerca a las 5 manzanas y luego a la garita.
  const graficaVisible = interpolate(frame, [T.manzanas + 20, T.manzanas + 40, T.temporada + 30, T.temporada + 50], [0, 1, 1, 0], clamp);
  const camGrafica = [
    { f: T.manzanas, x: 540, y: 960, s: 1 },
    { f: 900, x: 540, y: 960, s: 1 },
    { f: 935, x: 230, y: 1010, s: 1.45 }, // «cinco manzanas»
    { f: 955, x: 330, y: 900, s: 1.3 },
    { f: 975, x: 540, y: 900, s: 1.05 }, // «garita de Andrade»
    { f: 992, x: 540, y: 960, s: 1 },
  ];

  // 6. La barra más alta se transforma en un termómetro.
  const barra0 = BARRA(0, 60);
  const tubo = { x: 495, y: 760, w: 90, h: 470, radio: 45 };
  const verano = mezcla(frame, 1012, 1030);
  const invierno = mezcla(frame, 1044, 1075);
  const nivel = 0.9 - invierno * 0.62;
  const muchos = mezcla(frame, 1142, 1160);
  // Los pájaros cruzan y la cámara los sigue (todo el escenario se desliza con ellos).
  const avesX = interpolate(frame, [1200, 1262], [-260, 760], clamp);
  const sigue = interpolate(frame, [1205, 1262], [0, -160], { ...clamp, easing: (t) => t * t * (3 - 2 * t) });
  const termoVisible = interpolate(frame, [T.temporada, T.temporada + 5, T.salud - 10, T.salud + 5], [0, 1, 1, 0], clamp);

  // 7. Los pájaros se juntan y se transforman en la insignia del turismo de salud.
  const juntan = mezcla(frame, 1262, 1290);
  const latido = 1 + Math.max(0, Math.sin(frame / 10)) * 0.05;

  return (
    <AbsoluteFill>
      <Degradados />
      {/* ---------- 1 ---------- */}
      {dientes}
      {frame >= 120 && frame < T.mapa + 30 ? (
        <Transformar
          de={{ x: 510, y: 970, w: 60, h: 60, radio: 30, color: C.coral }}
          a={{ x: 360, y: 925, w: 360, h: 150, radio: 75, color: C.coral }}
          desde={120}
          dur={22}
        >
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 800, fontSize: 100, color: C.noche, background: `linear-gradient(160deg, #FFD29A, ${C.coral})`, boxShadow: "inset 0 3px 0 rgba(255,255,255,0.6), 0 0 80px rgba(255,107,91,0.6)" }}>311</div>
        </Transformar>
      ) : null}
      <Fuente texto={FUENTE_INEGI} desde={110} hasta={T.mapa} />

      {/* ---------- 2 y 3: mapa con cámara ---------- */}
      {frame >= T.mapa && frame < T.historia + 30 ? (
        <Camara puntos={camMapa}>
          <Mapa visible={mapaVisible} />
        </Camara>
      ) : null}
      {/* El 311 se encoge hasta volverse el pin (encima del mapa mientras aparece) */}
      {frame >= T.mapa && frame < T.mapa + 32 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - mezcla(frame, T.mapa + 22, T.mapa + 32) }}>
          <Transformar de={{ x: 360, y: 925, w: 360, h: 150, radio: 75, color: C.coral }} a={{ x: 450, y: 910, w: 180, h: 180, radio: 90, color: C.coral }} desde={T.mapa} dur={24}>
            {null}
          </Transformar>
        </div>
      ) : null}
      <Fuente texto={FUENTE_UNAM} desde={T.visitantes} hasta={T.historia} />

      {/* ---------- 4: maleta → cartel ---------- */}
      {frame >= T.historia && frame < T.manzanas + 40 ? (
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${flota}px) perspective(1600px) rotateY(${interpolate(frame, [T.historia, T.manzanas], [-10, 6])}deg) rotateX(4deg)`, filter: "drop-shadow(0 50px 60px rgba(0,0,0,0.6))" }}>
          <Transformar de={{ x: 500, y: 1000, w: 80, h: 80, radio: 18, color: "#7A4A2A" }} a={{ x: 190, y: 760, w: 700, h: 520, radio: 14, color: "#F3E3C3" }} desde={T.historia + 5} dur={40}>
            {cartelContenido}
          </Transformar>
        </div>
      ) : null}
      {/* El cartel se vuelve la primera barra */}
      {frame >= T.manzanas && frame < T.manzanas + 45 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - mezcla(frame, T.manzanas + 32, T.manzanas + 45) }}>
          <Transformar de={{ x: 190, y: 760, w: 700, h: 520, radio: 14, color: "#F3E3C3" }} a={{ x: barra0.x, y: barra0.y, w: barra0.w, h: barra0.h, radio: 6, color: C.coral }} desde={T.manzanas} dur={32}>
            {null}
          </Transformar>
        </div>
      ) : null}
      <Fuente texto={FUENTE_UNAM} desde={T.historia + 20} hasta={T.manzanas} />

      {/* ---------- 5: gráfica con cámara ---------- */}
      {frame >= T.manzanas && frame < T.temporada + 55 ? (
        <Camara puntos={camGrafica}>
          <Grafica visible={graficaVisible} />
        </Camara>
      ) : null}
      {frame >= 960 && frame < T.temporada ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", gap: 16, opacity: mezcla(frame, 962, 978) * (1 - mezcla(frame, T.temporada - 10, T.temporada)) }}>
          <div style={{ padding: "12px 26px", borderRadius: 999, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.noche }}>56% en 5 manzanas</div>
          <div style={{ padding: "12px 26px", borderRadius: 999, background: C.crema, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.noche }}>77% con 0 a 5 trabajadores</div>
        </div>
      ) : null}
      <Fuente texto={FUENTE_INEGI} desde={T.manzanas + 30} hasta={T.temporada} />

      {/* ---------- 6: barra → termómetro, temporada y pájaros ---------- */}
      {frame >= T.temporada && frame < T.salud + 10 ? (
        <div style={{ position: "absolute", inset: 0, opacity: termoVisible, transform: `translateX(${sigue}px)` }}>
          <Transformar de={{ ...barra0, radio: 6, color: C.coral }} a={{ ...tubo, color: "rgba(255,244,230,0.14)" }} desde={T.temporada} dur={30}>
            <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, height: `calc(${nivel * 100}% - 20px)`, background: `linear-gradient(180deg, ${invierno > 0.5 ? "#BFF0F4" : "#FFD29A"}, ${invierno > 0.5 ? "#4FA3C7" : C.coral})`, borderRadius: 40, boxShadow: `0 0 40px ${invierno > 0.5 ? "#4FA3C7" : C.coral}` }} />
            <div style={{ position: "absolute", left: 14, top: 20, bottom: 20, width: 12, borderRadius: 6, background: "linear-gradient(180deg, rgba(255,255,255,0.7), rgba(255,255,255,0.1))" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 45, border: "2px solid rgba(255,255,255,0.4)", boxShadow: "inset 0 0 30px rgba(255,255,255,0.15)" }} />
          </Transformar>
          <div style={{ position: "absolute", left: 470, top: 1200, width: 140, height: 140, borderRadius: 70, background: `radial-gradient(circle at 35% 35%, #FFFFFF 0%, ${invierno > 0.5 ? "#4FA3C7" : C.coral} 35%, ${invierno > 0.5 ? "#2A6F9A" : "#B8392F"} 100%)`, boxShadow: `0 0 60px ${invierno > 0.5 ? "#4FA3C7" : C.coral}`, opacity: mezcla(frame, T.temporada + 22, T.temporada + 34) }} />
          <div style={{ position: "absolute", left: 120, top: 820, width: 330, textAlign: "right", opacity: verano * (1 - invierno * 0.6) }}>
            <div style={{ fontSize: 70 }}>☀️</div>
            <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 52, color: C.crema }}>Verano</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.naranja }}>35–40 °C</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: "rgba(255,244,230,0.8)" }}>menos visitantes</div>
          </div>
          <div style={{ position: "absolute", left: 630, top: 820, width: 330, opacity: invierno }}>
            <div style={{ fontSize: 70 }}>❄️</div>
            <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 52, color: C.crema }}>Invierno</div>
            <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 34, color: "#9ED6DC" }}>menos de 20 °C</div>
            <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 26, color: "rgba(255,244,230,0.8)", opacity: muchos }}>muchos más visitantes</div>
          </div>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 640 + (i * 53) % 340, top: ((frame * 2 + i * 41) % 380) + 720, width: 8, height: 8, borderRadius: 4, background: "#FFFFFF", opacity: invierno * 0.8 }} />
          ))}
          {/* «los pájaros de la nieve» desde una máscara */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center", transform: `translateX(${-sigue}px)` }}>
            <div style={{ overflow: "hidden", padding: "0 8px" }}>
              <div style={{ transform: `translateY(${(1 - mezcla(frame, 1205, 1222)) * 110}%)`, fontFamily: SERIF, fontWeight: 800, fontStyle: "italic", fontSize: 58, color: "#9ED6DC" }}>«los pájaros de la nieve»</div>
            </div>
          </div>
        </div>
      ) : null}
      {/* Pájaros que cruzan (la cámara los sigue) y luego se juntan en el centro */}
      {frame >= 1195 && frame < 1295
        ? Array.from({ length: 7 }).map((_, i) => {
            const x = avesX - i * 70 + (540 - (avesX - i * 70)) * juntan;
            const y = 700 + (i % 3) * 45 + Math.sin(frame / 6 + i) * 10 + (980 - (700 + (i % 3) * 45)) * juntan;
            return (
              <div key={i} style={{ position: "absolute", left: x - 25, top: y - 25, fontSize: 50, opacity: 1 - juntan * 0.8, transform: `scale(${1 - juntan * 0.6})` }}>
                🐦
              </div>
            );
          })
        : null}
      <Fuente texto={FUENTE_UNAM} desde={T.temporada + 20} hasta={T.salud} />

      {/* ---------- 7: insignia del turismo de salud ---------- */}
      {frame >= 1280 && frame < T.cierre ? (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${frame < T.cierre ? latido : 1})`, transformOrigin: "540px 990px" }}>
          <Transformar
            de={{ x: 520, y: 970, w: 40, h: 40, radio: 20, color: C.coral }}
            a={{ x: 370, y: 820, w: 340, h: 340, radio: 170, color: C.coral }}
            desde={1280}
            dur={26}
          >
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(circle at 35% 30%, #FFE2B8, ${C.naranja} 45%, ${C.coral})`, boxShadow: "inset 0 6px 0 rgba(255,255,255,0.5), inset 0 -20px 40px rgba(120,20,20,0.35)" }}>
              <Diente tam={180} color="brillo" />
            </div>
          </Transformar>
        </div>
      ) : null}

      {/* ---------- 8: la insignia se vuelve el globo de comentario ---------- */}
      {frame >= T.cierre ? (
        <Transformar de={{ x: 370, y: 820, w: 340, h: 340, radio: 170, color: C.coral }} a={{ x: 390, y: 900, w: 300, h: 200, radio: 60, color: C.coral }} desde={T.cierre} dur={30}>
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 24, background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})` }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: C.crema, opacity: 0.4 + 0.6 * Math.max(0, Math.sin(frame / 8 - i)) }} />
            ))}
          </div>
        </Transformar>
      ) : null}

      {DESTELLOS.map((f) => (
        <Sequence key={f} from={f} durationInFrames={16}>
          <Destello />
        </Sequence>
      ))}
      {/* Velo arriba para que los títulos se lean aunque la cámara acerque el mapa o la gráfica */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,12,28,0.92) 0%, rgba(10,12,28,0.8) 24%, rgba(10,12,28,0) 36%)", pointerEvents: "none" }} />
      {/* ---------- Títulos revelados desde una máscara, sincronizados con la voz ---------- */}
      <Titulo texto="Un pueblo con 311 consultorios dentales" tiempos={[22, 30, 70, 79, 109, 125]} resaltar={["311"]} frase={null} tiemposFrase={null} hasta={T.mapa} />
      <Titulo
        texto="Los Algodones, Baja California"
        tiempos={[182, 190, 234, 242]}
        resaltar={["Algodones,"]}
        frase="En la frontera con Estados Unidos."
        tiemposFrase={repartir(6, 262, 300)}
        hasta={T.visitantes}
      />
      <Titulo
        texto="Miles de visitantes cada año"
        tiempos={[442, 446, 452, 470, 476]}
        resaltar={["Miles"]}
        frase="De Estados Unidos y Canadá, por precios más accesibles."
        tiemposFrase={[456, 462, 470, 476, 488, 548, 553, 562, 570]}
        hasta={T.historia}
      />
      <Titulo
        texto="Todo empezó en los años 70"
        tiempos={[652, 660, 668, 672, 678, 685]}
        resaltar={["70"]}
        frase="Un dentista del pueblo se anunció en Estados Unidos."
        tiemposFrase={[710, 714, 728, 734, 748, 760, 768, 775, 782]}
        hasta={T.manzanas}
      />
      <Titulo
        texto="Más de la mitad, en solo 5 manzanas"
        tiempos={[848, 852, 858, 862, 896, 904, 910, 922]}
        resaltar={["5", "manzanas"]}
        frase="Junto a la garita de Andrade."
        tiemposFrase={[944, 948, 952, 957, 966, 970]}
        hasta={T.temporada}
      />
      <Titulo
        texto="Y tiene temporada"
        tiempos={[1004, 1008, 1014]}
        resaltar={["temporada"]}
        frase="En invierno llegan muchos más visitantes."
        tiemposFrase={[1040, 1044, 1120, 1130, 1136, 1142]}
        hasta={T.salud}
      />
      <Titulo
        texto="Esto es turismo de salud"
        tiempos={[1278, 1286, 1292, 1302, 1307]}
        resaltar={["salud"]}
        frase="Cuando el motivo del viaje es cuidarte."
        tiemposFrase={[1330, 1338, 1344, 1352, 1358, 1366, 1372]}
        hasta={T.cierre}
      />
      <Titulo
        texto="¿Tú cruzarías la frontera para ir al dentista?"
        tiempos={repartir(8, 1424, 1480)}
        resaltar={["frontera"]}
        frase="Te leo."
        tiemposFrase={[1499, 1504]}
        hasta={DURACION_ALGODONES + 20}
      />
    </AbsoluteFill>
  );
};

export const Algodones: React.FC = () => (
  <>
    <Reel
      duracion={DURACION_ALGODONES}
      fondo={<Desierto />}
      etiqueta={null}
      voz="voz-algodones.mp3"
      musica="musica-algodones.mp3"
      volumenMusica={0.16}
      sonidos={SONIDOS}
      escenas={[{ desde: 0, dur: DURACION_ALGODONES, Pieza: Escena }]}
    />
    <Grano />
  </>
);
