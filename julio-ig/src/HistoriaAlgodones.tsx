import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { Grano } from "./cine";
import { C, Reel, SANS, SERIF } from "./comun";
import { Camara, Transformar } from "./edicion";
import { Degradados, Desierto, Diente, Fuente, Titulo, VIDRIO, repartir } from "./Algodones";

// «De pueblo de cantinas a Molar City»: la historia de Vicente Guerrero (Los Algodones), contada como una línea
// del tiempo que la cámara recorre. Las épocas pasadas van en sepia; el color vuelve en «Hoy».
// Datos verificados en investigacion/los-algodones.md y fuentes.md.
// Voz con pausas: public/voz-algodones-historia.mp3 (62 s).
export const DURACION_HISTORIA_ALGODONES = 1862;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const mezcla = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const miles = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

// Centro (x del mundo) de cada estación de la línea del tiempo.
const S = [-1100, 540, 1640, 2740, 3840, 4940];
const EJE = 770;

const SONIDOS: [number, string, number][] = [
  [8, "pop", 0.25],
  [50, "pop", 0.3],
  [112, "whoosh", 0.3], // tarro → diente
  [130, "brillo", 0.3],
  [186, "whoosh", 0.3], // diente → tarjeta
  [236, "pop", 0.25],
  [318, "whoosh", 0.35], // a 1903
  [431, "guardar", 0.25],
  [495, "pop", 0.3],
  [515, "whoosh", 0.35], // sello → aduana
  [600, "golpe", 0.4],
  [640, "whoosh", 0.35], // a los años 20
  [712, "tachar", 0.25],
  [776, "ding", 0.3],
  [905, "pop", 0.25],
  [1003, "whoosh", 0.35], // a los 60
  [1125, "whoosh", 0.25], // las cantinas se vuelven dientes
  [1225, "brillo", 0.3],
  [1300, "whoosh", 0.35], // a hoy
  [1385, "pop", 0.35],
  [1450, "pop", 0.35],
  [1562, "pop", 0.35],
  [1640, "whoosh", 0.35],
  [1700, "brillo", 0.35],
  [1774, "notificacion", 0.35],
];

const DESTELLOS = [116, 186, 318, 515, 640, 1003, 1335, 1640];

const PAPEL: React.CSSProperties = {
  background: "radial-gradient(ellipse at 45% 35%, #F6E8CC 0%, #E8D2A6 65%, #C29F6C 100%)",
  boxShadow: "0 50px 120px rgba(0,0,0,0.6)",
  color: "#4A2E1C",
  overflow: "hidden",
};

// Textura de papel viejo encima de una tarjeta.
const Textura: React.FC<{ id: string }> = ({ id }) => (
  <svg style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.32 }} width="100%" height="100%">
    <filter id={id}>
      <feTurbulence type="fractalNoise" baseFrequency={0.75} numOctaves={3} seed={4} />
      <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0 0.15  0 0 0 0.9 0" />
    </filter>
    <rect width="100%" height="100%" filter={`url(#${id})`} />
  </svg>
);

// Tarro de cantina.
const Tarro: React.FC<{ tam: number }> = ({ tam }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="gCerveza" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFD27A" />
        <stop offset="1" stopColor="#D9782A" />
      </linearGradient>
    </defs>
    <path d="M16 9 h2.5 a2 2 0 0 1 2 2 v4 a2 2 0 0 1 -2 2 H16" fill="none" stroke="#F0D9B0" strokeWidth="1.8" />
    <rect x="4" y="6" width="12" height="15" rx="2" fill="url(#gCerveza)" />
    <rect x="6" y="9" width="1.4" height="9" rx="0.7" fill="rgba(255,255,255,0.55)" />
    <path d="M3.6 7.5 Q3.4 3.4 6.8 4.2 Q8 2 10.5 3.3 Q13 1.9 14.6 4.1 Q17.2 4 16.4 7.5 Z" fill="#FFF8EC" />
  </svg>
);

// Persona pequeña que cruza la frontera.
const Persona: React.FC = () => (
  <svg width={34} height={56} viewBox="0 0 34 56">
    <circle cx={17} cy={9} r={7} fill={C.crema} />
    <path d="M6 54 L8 22 Q17 16 26 22 L28 54 Z" fill={C.crema} opacity={0.85} />
  </svg>
);

const Escena: React.FC = () => (
  <CameraMotionBlur shutterAngle={160} samples={5}>
    <Recorrido />
  </CameraMotionBlur>
);

const Recorrido: React.FC = () => {
  const frame = useCurrentFrame();
  const camara = [
    { f: 0, x: S[0], y: 1010, s: 1.08 },
    { f: 170, x: S[0], y: 965, s: 1.0 },
    { f: 300, x: S[0], y: 960, s: 1.02 },
    { f: 342, x: S[1], y: 960, s: 1.0 },
    { f: 508, x: S[1], y: 960, s: 1.04 },
    { f: 556, x: S[2], y: 960, s: 1.0 },
    { f: 632, x: S[2], y: 960, s: 1.04 },
    { f: 672, x: S[3], y: 960, s: 1.0 },
    { f: 995, x: S[3], y: 960, s: 1.04 },
    { f: 1040, x: S[4], y: 960, s: 1.0 },
    { f: 1300, x: S[4], y: 960, s: 1.03 },
    { f: 1345, x: S[5], y: 960, s: 1.0 },
    { f: 1625, x: S[5], y: 960, s: 1.04 },
    { f: 1700, x: 2790, y: 1010, s: 0.185 },
    { f: DURACION_HISTORIA_ALGODONES, x: 2790, y: 1010, s: 0.175 },
  ];
  // Avance de la línea del tiempo: sigue a la cámara.
  const avance = interpolate(frame, camara.map((p) => p.f), camara.map((p) => p.x), clamp);
  const eje = mezcla(frame, 300, 340);

  // ---------- 0. Gancho: el tarro de cantina se vuelve diente; el diente, la tarjeta del pueblo ----------
  const tarroEntra = mezcla(frame, 8, 34);
  const tarroSale = mezcla(frame, 100, 122);
  const dienteEntra = mezcla(frame, 112, 142);
  const tarjeta = (
    <div style={{ position: "relative", width: "100%", height: "100%", boxSizing: "border-box", padding: "56px 60px", ...VIDRIO, borderRadius: 40 }}>
      <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: C.naranja }}>📍 NOMBRE OFICIAL</div>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 76, color: C.crema, marginTop: 12 }}>Vicente Guerrero</div>
      <div style={{ fontFamily: SERIF, fontWeight: 700, fontStyle: "italic", fontSize: 54, color: C.crema, opacity: mezcla(frame, 232, 246), marginTop: 6 }}>«Los Algodones»</div>
      <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 30, color: "rgba(255,244,230,0.8)", opacity: mezcla(frame, 263, 277), marginTop: 26 }}>Municipio de Mexicali · Baja California</div>
      <div style={{ position: "absolute", left: 60, right: 60, bottom: 48, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontWeight: 600, fontSize: 26, color: "rgba(255,244,230,0.65)", opacity: mezcla(frame, 280, 295) }}>
        <span>32° 42′ 58″ N</span>
        <span>6,796 habitantes (2020)</span>
      </div>
    </div>
  );

  // ---------- 1. 1903: documento del Juzgado de Paz ----------
  const docEntra = mezcla(frame, 322, 352);
  const trazo = mezcla(frame, 345, 430);
  const juez = mezcla(frame, 428, 442);
  const licores = mezcla(frame, 493, 508);

  // ---------- 2. 1905: el sello del documento se vuelve el sello de la aduana ----------
  const golpe = interpolate(frame, [598, 604, 616], [1, 1.12, 1], clamp);
  const selloSale = mezcla(frame, 640, 668);
  const sello = (
    <div style={{ position: "relative", width: "100%", height: "100%", transform: `scale(${golpe})` }}>
      <svg width="100%" height="100%" viewBox="0 0 500 500">
        <defs>
          <path id="arco" d="M 250 250 m -185 0 a 185 185 0 1 1 370 0 a 185 185 0 1 1 -370 0" />
        </defs>
        <circle cx={250} cy={250} r={232} fill="none" stroke="#FCE3C8" strokeWidth={8} opacity={0.9} />
        <circle cx={250} cy={250} r={150} fill="none" stroke="#FCE3C8" strokeWidth={4} opacity={0.8} />
        <text fontFamily={SANS} fontWeight={600} fontSize={38} letterSpacing={9} fill="#FCE3C8">
          <textPath href="#arco">ADUANA DE ALGODONES ★ ADUANA DE ALGODONES ★</textPath>
        </text>
        <text x={250} y={250} textAnchor="middle" fontFamily={SERIF} fontWeight={800} fontSize={104} fill="#FFF4E6">1905</text>
        <text x={250} y={312} textAnchor="middle" fontFamily={SANS} fontWeight={600} fontSize={30} letterSpacing={6} fill="#FCE3C8">B. C.</text>
      </svg>
      {/* tinta irregular */}
      <svg style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.5 }} width="100%" height="100%">
        <filter id="tinta">
          <feTurbulence type="fractalNoise" baseFrequency={0.04} numOctaves={2} seed={7} />
          <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.05  0 0 0 0 0.05  0 0 0 1.4 -0.4" />
        </filter>
        <rect width="100%" height="100%" filter="url(#tinta)" />
      </svg>
    </div>
  );

  // ---------- 3. Años 20: California prohíbe, Algodones prospera ----------
  const prohibe = mezcla(frame, 700, 716);
  const prospera = mezcla(frame, 772, 790);

  // ---------- 4. Finales de los 60: 48 cantinas, quedan 2 ----------
  const QUEDAN = [13, 34];
  const contador = mezcla(frame, 1290, 1305);

  // ---------- 5. Hoy ----------
  const DATOS = [
    { icono: "👥", desde: 1380, hasta: 1430, valor: 6796, pre: "", texto: "habitantes", fuente: "INEGI, Censo 2020" },
    { icono: "🦷", desde: 1446, hasta: 1478, valor: 311, pre: "", texto: "consultorios dentales", fuente: "INEGI, DENUE 2026" },
    { icono: "🚶", desde: 1556, hasta: 1590, valor: 6000, pre: "~", texto: "cruces al día en temporada alta", fuente: "Zermeño y Cuevas, 2020" },
  ];

  const ETIQUETAS = ["", "1903", "1905", "años 20", "finales de los 60", "hoy"];
  const sepia = interpolate(frame, [300, 345, 1325, 1365], [0, 1, 1, 0], clamp);

  return (
    <AbsoluteFill>
      <Degradados />
      <Camara puntos={camara}>
        {/* Línea del tiempo */}
        <div style={{ position: "absolute", left: S[1] - 700, top: EJE - 3, width: (S[5] - S[1] + 1200) * eje, height: 6, borderRadius: 3, background: "rgba(255,244,230,0.18)" }} />
        <div style={{ position: "absolute", left: S[1] - 700, top: EJE - 3, width: Math.max(0, avance - S[1] + 700) * eje, height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, boxShadow: "0 0 24px rgba(255,165,82,0.7)" }} />
        {S.slice(1).map((x, i) => {
          const llega = mezcla(avance, x - 300, x);
          return (
            <div key={i} style={{ position: "absolute", left: x - 18, top: EJE - 18, opacity: eje }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: llega > 0.5 ? C.naranja : "rgba(255,244,230,0.3)", boxShadow: llega > 0.5 ? "0 0 30px rgba(255,165,82,0.9)" : "none", transform: `scale(${0.7 + llega * 0.3})` }} />
              <div style={{ position: "absolute", left: 18, top: -64, transform: "translateX(-50%)", whiteSpace: "nowrap", fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: 2, color: llega > 0.5 ? C.naranja : "rgba(255,244,230,0.5)" }}>{ETIQUETAS[i + 1]}</div>
            </div>
          );
        })}

        {/* 0. Gancho */}
        <div style={{ position: "absolute", left: S[0] - 540, top: 0, width: 1080, height: 1920 }}>
          {frame < 125 ? (
            <div style={{ position: "absolute", left: 390, top: 860, opacity: tarroEntra * (1 - tarroSale), transform: `scale(${(0.6 + tarroEntra * 0.4) * (1 - tarroSale * 0.7)}) rotate(${tarroSale * 25 - (1 - tarroEntra) * 10}deg)`, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))" }}>
              <Tarro tam={300} />
            </div>
          ) : null}
          {frame >= 112 && frame < 188 ? (
            <div style={{ position: "absolute", left: 390, top: 870, opacity: dienteEntra, transform: `scale(${0.3 + dienteEntra * 0.7})`, filter: "drop-shadow(0 0 50px rgba(255,220,170,0.6))" }}>
              <Diente tam={300} color="brillo" />
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 140, right: 140, top: 1238, display: "flex", justifyContent: "center", opacity: mezcla(frame, 48, 62) * (1 - mezcla(frame, 170, 184)) }}>
            <div style={{ ...VIDRIO, borderRadius: 40, padding: "16px 30px", fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.crema }}>🧭 Extremo norte del país: 32° 43′ N</div>
          </div>
          {frame >= 186 ? (
            <Transformar de={{ x: 390, y: 870, w: 300, h: 300, radio: 150, color: "rgba(255,240,220,0.9)" }} a={{ x: 120, y: 840, w: 840, h: 480, radio: 40, color: "transparent" }} desde={186} dur={30}>
              {tarjeta}
            </Transformar>
          ) : null}
        </div>

        {/* 1. 1903 */}
        <div style={{ position: "absolute", left: S[1] - 540, top: 0, width: 1080, height: 1920 }}>
          <div style={{ position: "absolute", left: 150, top: 840, width: 780, height: 460, borderRadius: 10, ...PAPEL, opacity: docEntra, transform: `translateY(${(1 - docEntra) * 120}px) rotate(${-2 + (1 - docEntra) * 4}deg)` }}>
            <Textura id="papel1903" />
            <div style={{ position: "relative", padding: "40px 50px" }}>
              <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 46, letterSpacing: 3, color: juez > 0.5 ? "#8E2A1E" : "#4A2E1C", transform: `scale(${1 + Math.sin(juez * Math.PI) * 0.05})`, transformOrigin: "left center" }}>JUZGADO DE PAZ</div>
              <div style={{ fontFamily: SERIF, fontWeight: 700, fontStyle: "italic", fontSize: 32, marginTop: 6 }}>Algodones, Baja California</div>
              <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 24, marginTop: 10, opacity: 0.8 }}>Oficio del 26 de mayo de 1903</div>
              <svg width={680} height={170} style={{ marginTop: 18 }}>
                {[20, 62, 104, 146].map((y, i) => (
                  <path key={i} d={`M 0 ${y} q 30 -14 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 ${i === 3 ? "" : "t 60 0 t 60 0"}`} fill="none" stroke="#5A3A22" strokeWidth={3} strokeLinecap="round" opacity={0.55} strokeDasharray={700} strokeDashoffset={700 * (1 - interpolate(trazo, [i * 0.22, i * 0.22 + 0.34], [0, 1], clamp))} />
                ))}
              </svg>
            </div>
            {frame < 515 ? (
              <div style={{ position: "absolute", left: 600, top: 300, width: 120, height: 120, borderRadius: 60, border: "5px solid rgba(150,28,36,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 600, fontSize: 18, color: "rgba(150,28,36,0.85)", transform: `rotate(-14deg) scale(${mezcla(frame, 440, 450) * 1})` }}>1903</div>
            ) : null}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1318, display: "flex", justifyContent: "center", opacity: licores, transform: `translateY(${(1 - licores) * 30}px)` }}>
            <div style={{ ...PAPEL, borderRadius: 40, padding: "12px 28px", fontFamily: SANS, fontWeight: 600, fontSize: 28 }}>🥃 su primer expendio de licores</div>
          </div>
        </div>

        {/* 2. 1905: el sello vuela del documento y se vuelve la aduana */}
        {frame >= 515 && frame < 672 ? (
          <div style={{ opacity: 1 - selloSale }}>
            <Transformar
              de={{ x: S[1] - 540 + 150 + 600, y: 840 + 300, w: 120, h: 120, radio: 60, color: "rgba(150,28,36,0.85)" }}
              a={{ x: S[2] - 250, y: 830, w: 500, h: 500, radio: 250, color: "rgba(140,26,34,0.92)" }}
              desde={515}
              dur={40}
            >
              {sello}
            </Transformar>
          </div>
        ) : null}

        {/* 3. Años 20 */}
        <div style={{ position: "absolute", left: S[3] - 540, top: 0, width: 1080, height: 1920 }}>
          <div style={{ position: "absolute", left: 140, top: 830, width: 800, height: 540, borderRadius: 36, ...PAPEL, opacity: mezcla(frame, 646, 676), transform: `translateY(${(1 - mezcla(frame, 646, 676)) * 100}px)` }}>
            <Textura id="papel20" />
            <div style={{ position: "absolute", left: 0, right: 0, top: 30, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 5 }}>CALIFORNIA · EE. UU.</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 78, display: "flex", justifyContent: "center", gap: 40, fontSize: 96, opacity: mezcla(frame, 690, 705) }}>
              <span style={{ position: "relative" }}>🍸<span style={{ position: "absolute", left: 0, top: 0, opacity: prohibe, transform: `scale(${1.4 - prohibe * 0.4})` }}>🚫</span></span>
              <span style={{ position: "relative" }}>🎲<span style={{ position: "absolute", left: 0, top: 0, opacity: prohibe, transform: `scale(${1.4 - prohibe * 0.4})` }}>🚫</span></span>
            </div>
            <div style={{ position: "absolute", left: 30, right: 30, top: 268, borderTop: "4px dashed rgba(74,46,28,0.6)" }} />
            <div style={{ position: "absolute", right: 40, top: 236, fontFamily: SANS, fontWeight: 500, fontSize: 20, opacity: 0.75 }}>frontera</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", gap: 40, fontSize: 96, opacity: mezcla(frame, 745, 760), filter: `drop-shadow(0 0 ${prospera * 30}px rgba(255,190,90,0.9))` }}>
              <span>🍸</span>
              <span>🎲</span>
              <span style={{ opacity: prospera, transform: `scale(${1.5 - prospera * 0.5})` }}>✅</span>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 28, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 5 }}>ALGODONES · MÉXICO</div>
            {/* Visitantes cruzando hacia el sur desde los años 20 */}
            {Array.from({ length: 9 }).map((_, i) => {
              const t = ((frame - 900 - i * 11) % 90) / 90;
              if (frame < 900 + i * 11 || frame > 990) return null;
              return (
                <div key={i} style={{ position: "absolute", left: 90 + i * 74, top: 120 + t * 300, opacity: Math.sin(t * Math.PI), filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
                  <div style={{ filter: "brightness(0.35) sepia(1)" }}>
                    <Persona />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Finales de los 60: las cantinas se vuelven dientes */}
        <div style={{ position: "absolute", left: S[4] - 540, top: 0, width: 1080, height: 1920 }}>
          <div style={{ position: "absolute", left: 130, top: 830, width: 820, height: 500, borderRadius: 36, ...VIDRIO, opacity: mezcla(frame, 1005, 1035), filter: `sepia(${0.6 * (1 - mezcla(frame, 1120, 1200))})` }}>
            {Array.from({ length: 48 }).map((_, i) => {
              const aparece = mezcla(frame, 1012 + i * 0.9, 1026 + i * 0.9);
              const queda = QUEDAN.includes(i);
              const gira = queda ? 0 : mezcla(frame, 1125 + i * 1.1, 1137 + i * 1.1);
              const brillo = queda ? mezcla(frame, 1150, 1170) : 0;
              return (
                <div key={i} style={{ position: "absolute", left: 40 + (i % 8) * 94, top: 34 + Math.floor(i / 8) * 76, opacity: aparece * (queda ? 1 : 1 - brillo * 0), transform: `scale(${aparece * (1 + brillo * 0.25)}) rotateY(${gira < 0.5 ? gira * 180 : (gira - 1) * 180}deg)`, filter: queda ? `drop-shadow(0 0 ${brillo * 24}px rgba(255,190,90,1))` : "none" }}>
                  {gira < 0.5 ? <Tarro tam={64} /> : <Diente tam={64} color={i % 7 === 0 ? "brilloNaranja" : "brillo"} />}
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1350, display: "flex", justifyContent: "center", opacity: contador, transform: `translateY(${(1 - contador) * 30}px)` }}>
            <div style={{ ...VIDRIO, borderRadius: 40, padding: "10px 28px", fontFamily: SANS, fontWeight: 600, fontSize: 28, color: C.crema }}>🍺 48 cantinas → quedaron 2</div>
          </div>
        </div>

        {/* 5. Hoy */}
        <div style={{ position: "absolute", left: S[5] - 540, top: 0, width: 1080, height: 1920 }}>
          <div style={{ position: "absolute", left: 120, top: 840, width: 840, height: 520, borderRadius: 40, ...VIDRIO, opacity: mezcla(frame, 1330, 1360), transform: `translateY(${(1 - mezcla(frame, 1330, 1360)) * 80}px)` }}>
            {DATOS.map((d, i) => {
              const e = mezcla(frame, d.desde - 6, d.desde + 10);
              const n = interpolate(frame, [d.desde, d.hasta], [0, d.valor], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
              return (
                <div key={i} style={{ position: "absolute", left: 44, right: 44, top: 34 + i * 160, height: 140, display: "flex", alignItems: "center", gap: 30, opacity: e, transform: `translateX(${(1 - e) * 60}px)`, borderBottom: i < 2 ? "1.5px solid rgba(255,244,230,0.12)" : "none" }}>
                  <div style={{ width: 96, height: 96, borderRadius: 48, background: "linear-gradient(160deg, rgba(255,165,82,0.35), rgba(255,107,91,0.2))", border: "1.5px solid rgba(255,165,82,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50 }}>{d.icono}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
                      <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 72, color: C.crema, fontVariantNumeric: "tabular-nums" }}>
                        {d.pre}
                        {miles(n)}
                      </span>
                      <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: "rgba(255,244,230,0.85)", maxWidth: 360, lineHeight: 1.15 }}>{d.texto}</span>
                    </div>
                    <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 20, color: C.naranja, marginTop: 2 }}>{d.fuente}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Un diente de los 60 viaja a «Hoy» */}
        {frame >= 1300 && frame < 1350 ? (
          <div style={{ position: "absolute", left: interpolate(frame, [1300, 1345], [S[4] - 30, S[5] - 540 + 164 + 600], clamp), top: interpolate(frame, [1300, 1345], [1060, 1070], clamp), opacity: 1 - mezcla(frame, 1335, 1348), filter: "drop-shadow(0 0 30px rgba(255,220,170,0.9))" }}>
            <Diente tam={80} color="brillo" />
          </div>
        ) : null}
      </Camara>

      {/* Viñeta sepia de las épocas pasadas */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, transparent 45%, rgba(60,30,10,0.55) 100%)", opacity: sepia, pointerEvents: "none" }} />
      {/* Velo arriba para que los títulos se lean */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(7,9,22,0.82) 0%, rgba(7,9,22,0.55) 28%, transparent 40%)" }} />

      {DESTELLOS.map((d) =>
        frame >= d && frame < d + 16 ? (
          <AbsoluteFill key={d} style={{ pointerEvents: "none" }}>
            <DestelloEn desde={d} />
          </AbsoluteFill>
        ) : null,
      )}

      <Fuente texto="Fuente: INEGI, extremos geográficos de Baja California y Censo 2020" desde={44} hasta={316} />
      <Fuente texto="Fuente: Capó Valdivia (2014), tesis, UABC" desde={336} hasta={636} />
      <Fuente texto="Fuentes: Capó Valdivia (2014), UABC · Rodríguez Blanco (2020), UNAM" desde={650} hasta={998} />
      <Fuente texto="Fuente: Zermeño Flores y Cuevas Contreras (2020), Revista Cenário" desde={1012} hasta={1328} />

      <Titulo texto="El pueblo más al norte de México" tiempos={repartir(7, 16, 82)} resaltar={["norte"]} frase="pasó de las cantinas… a los dentistas." tiemposFrase={[86, 92, 98, 104, 128, 133, 138]} hasta={182} />
      <Titulo texto="Vicente Guerrero" tiempos={[194, 205]} resaltar={null} frase="Los Algodones, Baja California" tiemposFrase={[234, 240, 252, 265, 272]} hasta={318} />
      <Titulo texto="1903: un poblado rural de Mexicali" tiempos={[338, 372, 380, 390, 398, 405]} resaltar={["1903:"]} frase="con juez de paz… y su primer expendio de licores." tiemposFrase={[425, 431, 438, 444, 462, 467, 472, 480, 490, 495]} hasta={530} />
      <Titulo texto="1905: ya tenía aduana" tiempos={[545, 580, 588, 598]} resaltar={["1905:"]} frase={null} tiemposFrase={null} hasta={640} />
      <Titulo texto="Allá se perseguían. Aquí prosperaron." tiempos={[662, 690, 698, 752, 776]} resaltar={["prosperaron."]} frase="el alcohol y el juego" tiemposFrase={[708, 716, 724, 732, 740]} hasta={800} />
      <Titulo texto="Años 20: la prohibición en EE. UU." tiempos={[818, 826, 850, 856, 872, 880, 886]} resaltar={["prohibición"]} frase="llegaron visitantes a buscar lo prohibido" tiemposFrase={[898, 908, 925, 932, 950, 962]} hasta={1000} />
      <Titulo texto="Finales de los 60: llegan los consultorios" tiempos={[1012, 1022, 1030, 1036, 1050, 1060, 1075]} resaltar={["consultorios"]} frase={null} tiemposFrase={null} hasta={1106} />
      <Titulo texto="Después, cerraron las cantinas" tiempos={[1110, 1122, 1135, 1142]} resaltar={["cantinas"]} frase={null} tiemposFrase={null} hasta={1168} />
      <Titulo texto="«De 48 cantinas nomás dejé dos»" tiempos={[1225, 1232, 1250, 1282, 1290, 1298]} resaltar={["dos»"]} frase="Testimonio citado por Zermeño Flores y Cuevas Contreras (2020)" tiemposFrase={[1180, 1184, 1188, 1192, 1196, 1200, 1204, 1208, 1212]} hasta={1326} />
      <Titulo texto="Hoy, en números" tiempos={[1342, 1360, 1368]} resaltar={["Hoy,"]} frase={null} tiemposFrase={null} hasta={1630} />
      <Titulo texto="De pueblo de cantinas… a Molar City" tiempos={[1646, 1652, 1658, 1664, 1692, 1698, 1708]} resaltar={["Molar", "City"]} frase="¿Conocías esta historia? Sígueme para la parte 2." tiemposFrase={[1730, 1740, 1750, 1774, 1784, 1792, 1798, 1806]} hasta={DURACION_HISTORIA_ALGODONES + 20} />
      <FirmaFinal />
    </AbsoluteFill>
  );
};

// El destello de cine.tsx empieza en su fotograma 0; aquí lo desplazamos al fotograma del cambio.
const DestelloEn: React.FC<{ desde: number }> = ({ desde }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [desde, desde + 14], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at ${-20 + p * 140}% 30%, rgba(255,190,120,0.75) 0%, rgba(255,120,80,0.35) 22%, transparent 45%)`, mixBlendMode: "screen", opacity: Math.sin(p * Math.PI) }} />
  );
};

const FirmaFinal: React.FC = () => {
  const frame = useCurrentFrame();
  const o = mezcla(frame, 1772, 1792);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1300, display: "flex", justifyContent: "center", opacity: o, transform: `translateY(${(1 - o) * 30}px)` }}>
      <div style={{ ...VIDRIO, borderRadius: 40, padding: "14px 34px", fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.crema }}>Parte 2 muy pronto · @julio.chaidez1</div>
    </div>
  );
};

export const HistoriaAlgodones: React.FC = () => {
  return (
    <>
      <Reel
        duracion={DURACION_HISTORIA_ALGODONES}
        fondo={<FondoHistoria />}
        etiqueta={null}
        voz="voz-algodones-historia.mp3"
        musica="musica-algodones-historia.mp3"
        volumenMusica={0.16}
        sonidos={SONIDOS}
        escenas={[{ desde: 0, dur: DURACION_HISTORIA_ALGODONES, Pieza: Escena }]}
      />
      <Grano />
    </>
  );
};

// El desierto de siempre, en sepia mientras se cuenta el pasado.
const FondoHistoria: React.FC = () => {
  const frame = useCurrentFrame();
  const sepia = interpolate(frame, [300, 345, 1325, 1365], [0, 0.85, 0.85, 0], clamp);
  return (
    <AbsoluteFill style={{ filter: `sepia(${sepia}) saturate(${1 - sepia * 0.3}) brightness(${1 - sepia * 0.12})` }}>
      <Desierto duracion={DURACION_HISTORIA_ALGODONES} enfoque={[[0, 40, 1640, 1700], [3, 6, 6, 1]]} />
    </AbsoluteFill>
  );
};

