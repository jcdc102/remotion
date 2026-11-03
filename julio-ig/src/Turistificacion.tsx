import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bloque, C, Reel, SANS, SERIF } from "./comun";
import { Mundo } from "./mundo";

// Turistificación en Puerto Vallarta. Datos: Huízar Sánchez, López Ramos y Baños Francia (2020), PASOS 18(5), pp. 836-840.
// Escenas alineadas con las pausas de public/voz-turistificacion.mp3 (44,4 s).
export const DURACION_TURISTIFICACION = 1350;

const SONIDOS: [number, string, number][] = [
  [0, "whoosh", 0.4],
  [90, "pop", 0.45], // 33 restaurantes
  [152, "pop", 0.45], // 24 bares
  [212, "golpe", 0.55], // 1 tortillería
  [262, "whoosh", 0.4], // escena 2
  [310, "pop", 0.4],
  [372, "golpe", 0.4], // suben las torres
  [492, "whoosh", 0.4], // escena 3
  [503, "pop", 0.4],
  [661, "pop", 0.5], // 70%
  [748, "whoosh", 0.4], // escena 4
  [802, "pop", 0.45],
  [832, "pop", 0.45],
  [865, "pop", 0.45],
  [909, "pop", 0.45],
  [957, "whoosh", 0.4], // escena 5
  [1017, "pop", 0.45], // Versalles
  [1047, "pop", 0.45], // El Pitillal
  [1071, "whoosh", 0.4], // escena 6
  [1140, "ding", 0.35], // balanza en equilibrio
  [1236, "whoosh", 0.4], // cierre
  [1250, "notificacion", 0.45],
];

const sp = (frame: number, fps: number, desde: number, damping = 12) => spring({ frame: frame - desde, fps, config: { damping, mass: 0.6 } });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Emoji: React.FC<{ e: string; tam: number }> = ({ e, tam }) => <span style={{ fontSize: tam, lineHeight: 1, display: "inline-block" }}>{e}</span>;

// x/y en null: la pastilla se acomoda dentro de su contenedor (por ejemplo, centrada).
const Pastilla: React.FC<{ children: React.ReactNode; x: number | null; y: number | null; s: number; fondo: string; color: string; tam: number }> = ({ children, x, y, s, fondo, color, tam }) => (
  <div
    style={{
      position: x === null ? "relative" : "absolute",
      left: x ?? undefined,
      top: y ?? undefined,
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "12px 28px",
      borderRadius: 999,
      background: fondo,
      color,
      fontFamily: SANS,
      fontWeight: 600,
      fontSize: tam,
      opacity: s,
      transform: `translateY(${(1 - s) * 40}px) scale(${0.7 + s * 0.3})`,
      boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </div>
);

const Fuente: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: 60,
      right: 60,
      top: 1392,
      padding: "8px 16px",
      borderRadius: 14,
      background: "rgba(14,27,46,0.75)",
      textAlign: "center",
      fontFamily: SANS,
      fontWeight: 500,
      fontSize: 20,
      color: "rgba(255,244,230,0.75)",
    }}
  >
    Fuente: Huízar Sánchez, López Ramos y Baños Francia (2020), revista PASOS · datos del estudio
  </div>
);

// ---------- 1. Gancho: una calle de la Zona Romántica ----------
const NEGOCIOS: [string, string, string, number][] = [
  ["#FFF4E6", "🍽️", "Restaurante", 360],
  ["#F2C14E", "🍹", "Bar", 330],
  ["#FFFFFF", "🛍️", "Souvenirs", 390],
  ["#E98A6B", "🍽️", "Restaurante", 350],
  ["#FFF4E6", "💆", "Spa", 370],
  ["#7FB7BE", "🍹", "Bar", 340],
  ["#F2C14E", "🫓", "Tortillería", 330],
  ["#FFFFFF", "🖼️", "Galería", 380],
  ["#E98A6B", "🍽️", "Restaurante", 350],
  ["#FFF4E6", "🍹", "Bar", 360],
];
const BASE = 1440;

const Fachada: React.FC<{ x: number; ancho: number; alto: number; pared: string; icono: string; nombre: string; brillo: number; resalte: number }> = ({
  x,
  ancho,
  alto,
  pared,
  icono,
  nombre,
  brillo,
  resalte,
}) => (
  <div style={{ position: "absolute", left: x, top: BASE - alto, width: ancho, height: alto, filter: `brightness(${brillo})`, zIndex: resalte > 0 ? 2 : 1 }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 30, bottom: 0, background: pared, borderLeft: "3px solid rgba(0,0,0,0.12)", boxShadow: resalte > 0 ? `0 0 ${resalte * 80}px ${C.naranja}` : "none" }} />
    <div style={{ position: "absolute", left: -8, right: -8, top: 0, height: 36, borderRadius: "8px 8px 0 0", background: "repeating-linear-gradient(90deg, #B5452F 0 20px, #8E3322 20px 24px)" }} />
    {[0, 1].map((i) => (
      <div key={i} style={{ position: "absolute", left: ancho / 2 - 70 + i * 82, top: 62, width: 58, height: 70, borderRadius: 6, background: "#2A3A5A", border: "5px solid #F7E9D7" }} />
    ))}
    <div style={{ position: "absolute", left: 14, right: 14, top: alto - 205, height: 58, borderRadius: 12, background: "#1E1B40", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: SANS, fontWeight: 600, fontSize: 22, color: C.crema }}>
      <Emoji e={icono} tam={30} />
      {nombre}
    </div>
    <div style={{ position: "absolute", left: 6, right: 6, top: alto - 138, height: 38, background: "repeating-linear-gradient(90deg, #FF6B5B 0 22px, #FFF4E6 22px 44px)", clipPath: "polygon(0 0, 100% 0, 95% 100%, 5% 100%)" }} />
    <div style={{ position: "absolute", left: ancho / 2 - 34, bottom: 0, width: 68, height: 96, borderRadius: "34px 34px 0 0", background: "#5A3A2A" }} />
  </div>
);

const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ancho = 230;
  const pan = interpolate(frame, [0, 200], [0, -860], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const foco = interpolate(frame, [205, 216], [0, 1], clamp);
  const latido = 1 + Math.max(0, Math.sin((frame - 212) / 5)) * 0.06 * (frame > 212 ? 1 : 0);
  return (
    <>
      <Bloque n={null} titulo="En 19 manzanas de la Zona Romántica hay…" texto={null} resaltar={["Zona", "Romántica"]} tTitulo={2} tTexto={0} />
      {/* Banqueta y calle */}
      <div style={{ position: "absolute", left: 0, right: 0, top: BASE, height: 40, background: "#B9A898" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: BASE + 40, height: 80, background: "#3A3550" }} />
      {NEGOCIOS.map(([pared, icono, nombre, alto], i) => {
        const esTortilleria = nombre === "Tortillería";
        return (
          <Fachada
            key={i}
            x={i * ancho + pan + 40}
            ancho={ancho}
            alto={alto}
            pared={pared}
            icono={icono}
            nombre={nombre}
            brillo={esTortilleria ? 1 : 1 - foco * 0.6}
            resalte={esTortilleria ? foco : 0}
          />
        );
      })}
      <Pastilla x={70} y={640} s={sp(frame, fps, 90, 10)} fondo={C.crema} color={C.noche} tam={40}>
        <Emoji e="🍽️" tam={44} />
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 56 }}>33</span> restaurantes
      </Pastilla>
      <Pastilla x={500} y={760} s={sp(frame, fps, 152, 10)} fondo={C.crema} color={C.noche} tam={40}>
        <Emoji e="🍹" tam={44} />
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 56 }}>24</span> bares
      </Pastilla>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", transform: `scale(${latido})` }}>
        <Pastilla x={null} y={null} s={sp(frame, fps, 212, 8)} fondo={`linear-gradient(90deg, ${C.naranja}, ${C.coral})`} color={C.noche} tam={44}>
          <Emoji e="🫓" tam={52} />
          una sola <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 64 }}>tortillería</span>
        </Pastilla>
      </div>
    </>
  );
};

// ---------- 2. Concepto: las casitas se vuelven torres para turistas ----------
const Concepto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hunde = interpolate(frame, [100, 125], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const torres = [480, 380, 560, 420, 500];
  const etiqueta = sp(frame, fps, 60, 12);
  return (
    <>
      <Bloque
        n={null}
        titulo="Eso tiene nombre: turistificación."
        texto="Cuando un lugar se transforma para el turista y deja de pensarse para quien vive ahí."
        resaltar={["turistificación"]}
        tTitulo={0}
        tTexto={45}
      />
      {/* Casitas blancas de teja roja */}
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 25 + i * 150, top: BASE - 150, width: 130, height: 150, transform: `translateY(${hunde * 170}px)`, opacity: 1 - hunde }}>
          <div style={{ position: "absolute", left: -10, right: -10, top: 0, height: 56, background: "#B5452F", clipPath: "polygon(50% 0, 100% 100%, 0 100%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 56, bottom: 0, background: "#FFFDF7" }} />
          <div style={{ position: "absolute", left: 47, bottom: 0, width: 36, height: 54, borderRadius: "18px 18px 0 0", background: "#6B4A35" }} />
          <div style={{ position: "absolute", left: 14, top: 70, width: 26, height: 26, background: "#2A3A5A" }} />
          <div style={{ position: "absolute", right: 14, top: 70, width: 26, height: 26, background: "#2A3A5A" }} />
        </div>
      ))}
      {/* Torres de departamentos turísticos */}
      {torres.map((alto, i) => {
        const s = sp(frame, fps, 105 + i * 6, 14);
        const h = alto * s;
        return (
          <div key={i} style={{ position: "absolute", left: 30 + i * 208, top: BASE - h, width: 176, height: h, overflow: "hidden", borderRadius: "10px 10px 0 0" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(90deg, transparent 0 34px, rgba(255,255,255,0.10) 34px 40px), repeating-linear-gradient(0deg, #2B3F66 0 30px, #1B2A48 30px 38px)",
              }}
            />
            {Array.from({ length: 10 }).map((_, j) => (
              <div
                key={j}
                style={{
                  position: "absolute",
                  left: 8 + ((j * 53 + i * 31) % 140),
                  bottom: 20 + ((j * 97 + i * 13) % Math.max(40, alto - 60)),
                  width: 28,
                  height: 20,
                  background: "#FFC27A",
                  opacity: 0.8 * Math.max(0, Math.sin(frame / 10 + j + i)),
                }}
              />
            ))}
          </div>
        );
      })}
      {torres.map((alto, i) => {
        const s = sp(frame, fps, 125 + i * 8, 9);
        const flota = Math.sin(frame / 10 + i) * 8;
        return (
          <div key={`m${i}`} style={{ position: "absolute", left: 30 + i * 208 + 58, top: BASE - alto - 90 + flota, opacity: s, transform: `scale(${s})` }}>
            <Emoji e={i % 2 ? "🔑" : "🧳"} tam={60} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, display: "flex", justifyContent: "center" }}>
        <Pastilla x={null} y={null} s={etiqueta} fondo={hunde < 0.5 ? C.crema : `linear-gradient(90deg, ${C.naranja}, ${C.coral})`} color={C.noche} tam={40}>
          <Emoji e={hunde < 0.5 ? "🏠" : "🧳"} tam={46} />
          {hunde < 0.5 ? "Para quien vive ahí" : "Para el turista"}
        </Pastilla>
      </div>
    </>
  );
};

// ---------- 3. El estudio: 19 manzanas, 305 negocios, ~70% para el turista ----------
const Estudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plano = sp(frame, fps, 0, 16);
  const pinta = sp(frame, fps, 164, 20);
  const contador = Math.round(interpolate(frame, [6, 120], [0, 305], { ...clamp, easing: Easing.out(Easing.cubic) }));
  const lupaX = interpolate(frame, [10, 150], [40, 760], clamp);
  let n = 0;
  return (
    <>
      <Bloque n={null} titulo="Investigadores de la UdeG contaron 305 negocios" texto={null} resaltar={["305"]} tTitulo={6} tTexto={0} />
      <div style={{ position: "absolute", left: 40, top: 830, width: 1000, height: 560, perspective: 1400 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            background: "#2A2340",
            transform: `rotateX(${48 - (1 - plano) * 30}deg) rotateZ(-8deg) scale(${0.85 + plano * 0.15})`,
            opacity: plano,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(4, 1fr)",
            gap: 26,
            padding: 30,
            boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
          }}
        >
          {Array.from({ length: 20 }).map((_, b) => {
            if (b === 12) {
              return (
                <div key={b} style={{ borderRadius: 10, background: "#4C8C5A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Emoji e="🌳" tam={50} />
                </div>
              );
            }
            const enManzana = b === 0 ? 17 : 16;
            return (
              <div key={b} style={{ borderRadius: 10, background: "#E9D8C4", padding: 8, display: "flex", flexWrap: "wrap", gap: 5, alignContent: "flex-start" }}>
                {Array.from({ length: enManzana }).map(() => {
                  const i = n++;
                  const aparece = interpolate(frame, [6 + i * 0.37, 12 + i * 0.37], [0, 1], clamp);
                  const turistico = (i * 37) % 100 < 70;
                  return (
                    <div
                      key={i}
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        background: turistico && pinta > 0.05 ? C.coral : "#8A7A9A",
                        opacity: aparece,
                        transform: `scale(${aparece * (turistico ? 1 + pinta * 0.15 : 1)})`,
                      }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: lupaX, top: 160 + Math.sin(frame / 8) * 40, opacity: interpolate(frame, [10, 20, 140, 155], [0, 1, 1, 0], clamp) }}>
          <Emoji e="🔍" tam={110} />
        </div>
      </div>
      <Pastilla x={70} y={720} s={sp(frame, fps, 6, 12)} fondo={C.crema} color={C.noche} tam={36}>
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 60, fontVariantNumeric: "tabular-nums" }}>{contador}</span> negocios
      </Pastilla>
      <Pastilla x={500} y={720} s={pinta} fondo={`linear-gradient(90deg, ${C.naranja}, ${C.coral})`} color={C.noche} tam={34}>
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 60 }}>≈70%</span> para el turista
      </Pastilla>
      <Fuente />
    </>
  );
};

// ---------- 4. El contraste: lluvia de negocios turísticos frente a 5 negocios para vecinos ----------
// Categorías y cantidades de la p. 839 (además hay gimnasios e inmobiliarias).
const TURISTICOS: [string, number][] = [
  ["🏢", 38],
  ["🍽️", 33],
  ["🍹", 24],
  ["🛍️", 24],
  ["💆", 15],
  ["👗", 15],
  ["🖼️", 14],
  ["💎", 11],
  ["💇", 10],
];
const ICONOS = TURISTICOS.flatMap(([e, k]) => Array.from({ length: k }, () => e));

const Contraste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vecinos: [string, string, number][] = [
    ["🥩", "Carnicería", 49],
    ["🫓", "Tortillería", 79],
    ["🔧", "Ferretería", 112],
    ["🛒🛒", "2 abarrotes", 156],
  ];
  return (
    <>
      <Bloque n={null} titulo="¿Y para los vecinos?" texto={null} resaltar={["vecinos"]} tTitulo={6} tTexto={0} />
      <div style={{ position: "absolute", left: 40, top: 560, width: 660, height: 820, borderRadius: 30, background: "rgba(14,27,46,0.72)", border: "2px solid rgba(255,244,230,0.15)" }}>
        <div style={{ position: "absolute", left: 28, top: 22, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.coral }}>Negocios para el turista</div>
        <div style={{ position: "absolute", left: 22, top: 90, display: "grid", gridTemplateColumns: "repeat(15, 40px)", gap: 1 }}>
          {ICONOS.map((e, i) => {
            const s = sp(frame, fps, i * 0.3, 14);
            return (
              <div key={i} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - s) * -500}px)`, opacity: s }}>
                <Emoji e={e} tam={32} />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 28, bottom: 22, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "rgba(255,244,230,0.6)" }}>
          departamentos, restaurantes, bares, souvenirs, spas, boutiques, galerías, joyerías, estéticas…
        </div>
      </div>
      <div style={{ position: "absolute", left: 720, top: 560, width: 320, height: 820, borderRadius: 30, background: "rgba(91,214,160,0.16)", border: `2px solid ${C.verde}` }}>
        <div style={{ position: "absolute", left: 22, top: 22, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.verde }}>Para vecinos</div>
        {vecinos.map(([e, nombre, t], i) => {
          const s = sp(frame, fps, t, 9);
          return (
            <div key={nombre} style={{ position: "absolute", left: 22, top: 110 + i * 150, opacity: s, transform: `scale(${0.5 + s * 0.5})`, transformOrigin: "left center" }}>
              <Emoji e={e} tam={64} />
              <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.crema, marginTop: 6 }}>{nombre}</div>
            </div>
          );
        })}
      </div>
      <Fuente />
    </>
  );
};

// ---------- 5. Se extiende: mapa ilustrativo de Puerto Vallarta ----------
const SeExtiende: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panel = sp(frame, fps, 0, 16);
  const zonas: [string, number, number, number][] = [
    ["Zona Romántica", 330, 560, -30],
    ["Versalles", 540, 320, 55],
    ["El Pitillal", 760, 160, 85],
  ];
  const ondas = (x: number, y: number, t: number) =>
    [0, 1, 2].map((k) => {
      const ciclo = ((frame - t - k * 15) % 45) / 45;
      return frame >= t ? (
        <circle key={k} cx={x} cy={y} r={30 + ciclo * 110} fill="none" stroke={C.coral} strokeWidth={4} opacity={(1 - ciclo) * 0.8} />
      ) : null;
    });
  return (
    <>
      <Bloque n={null} titulo="Primeros signos en Versalles y El Pitillal" texto={null} resaltar={["Versalles", "Pitillal"]} tTitulo={4} tTexto={0} />
      <div style={{ position: "absolute", left: 60, top: 620, width: 960, height: 760, borderRadius: 34, overflow: "hidden", opacity: panel, transform: `scale(${0.9 + panel * 0.1})`, boxShadow: "0 40px 80px rgba(0,0,0,0.45)" }}>
        <svg width={960} height={760}>
          <defs>
            <pattern id="olas" width="80" height="30" patternUnits="userSpaceOnUse">
              <path d="M0 15 Q 20 5 40 15 T 80 15" stroke="rgba(255,255,255,0.12)" strokeWidth="3" fill="none" />
            </pattern>
          </defs>
          <rect width={960} height={760} fill="#1F3B66" />
          <rect width={960} height={760} fill="url(#olas)" transform={`translate(${(frame * 0.6) % 80} 0)`} />
          <path d="M 960 0 L 420 0 Q 300 170 380 330 Q 450 470 300 610 L 250 760 L 960 760 Z" fill="#E9D8C4" />
          <path d="M 960 0 L 420 0 Q 300 170 380 330 Q 450 470 300 610 L 250 760" fill="none" stroke="#FFF4E6" strokeWidth={6} />
          <path d="M 700 520 Q 560 540 420 520" stroke="#7FB7BE" strokeWidth={8} fill="none" opacity={0.8} />
          <text x={70} y={380} fill="rgba(255,244,230,0.55)" fontFamily={SANS} fontWeight={600} fontSize={30} fontStyle="italic">
            Bahía de Banderas
          </text>
          <text x={560} y={510} fill="#4A7F86" fontFamily={SANS} fontWeight={500} fontSize={20}>
            río Cuale
          </text>
          {zonas.slice(1).map(([nombre, x, y, t]) => {
            const linea = interpolate(frame, [t - 25, t], [0, 1], clamp);
            const [x0, y0] = [330, 560];
            return (
              <line
                key={nombre}
                x1={x0}
                y1={y0}
                x2={x0 + (x - x0) * linea}
                y2={y0 + (y - y0) * linea}
                stroke={C.coral}
                strokeWidth={5}
                strokeDasharray="14 12"
                opacity={0.8}
              />
            );
          })}
          {zonas.map(([nombre, x, y, t]) => {
            const s = t < 0 ? 1 : sp(frame, fps, t, 9);
            return (
              <g key={nombre}>
                {ondas(x, y, Math.max(0, t))}
                <circle cx={x} cy={y} r={34 * s} fill={C.coral} opacity={t < 0 ? 0.95 : 0.85} />
                <text x={x} y={y + 74} textAnchor="middle" fill="#1E1B40" fontFamily={SANS} fontWeight={600} fontSize={30} opacity={s}>
                  {nombre}
                </text>
              </g>
            );
          })}
          <text x={940} y={740} textAnchor="end" fill="rgba(30,27,64,0.5)" fontFamily={SANS} fontWeight={500} fontSize={18}>
            mapa ilustrativo, no a escala
          </text>
        </svg>
      </div>
      <Fuente />
    </>
  );
};

// ---------- 6. Mirada profesional: plano de planeación y balanza ----------
const Mirada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panel = sp(frame, fps, 0, 16);
  const equilibrio = sp(frame, fps, 64, 7);
  const angulo = -16 * (1 - equilibrio);
  const sello = sp(frame, fps, 95, 8);
  const trazo = interpolate(frame, [5, 60], [0, 1], clamp);
  const rad = (angulo * Math.PI) / 180;
  const Plato: React.FC<{ lado: number; iconos: string; texto: string; color: string }> = ({ lado, iconos, texto, color }) => (
    <div style={{ position: "absolute", left: 480 + lado * 270 - 130, top: 250 + lado * Math.sin(rad) * 270, width: 260, textAlign: "center" }}>
      <div style={{ height: 70, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <Emoji e={iconos} tam={52} />
      </div>
      <div style={{ height: 14, borderRadius: 7, background: C.crema }} />
      <div style={{ marginTop: 10, fontFamily: SANS, fontWeight: 600, fontSize: 34, color }}>{texto}</div>
    </div>
  );
  return (
    <>
      <Bloque
        n={null}
        titulo="El turismo no es el enemigo."
        texto="El reto es planearlo pensando también en quienes vivimos aquí."
        resaltar={["enemigo"]}
        tTitulo={4}
        tTexto={64}
      />
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 700,
          width: 960,
          height: 680,
          borderRadius: 34,
          overflow: "hidden",
          opacity: panel,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 48px), repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0 2px, transparent 2px 48px), #133A5E",
          boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
        }}
      >
        <svg style={{ position: "absolute", inset: 0 }} width={960} height={680}>
          <rect x={60} y={60} width={840 * trazo} height={560} fill="none" stroke="rgba(255,244,230,0.35)" strokeWidth={3} strokeDasharray="16 10" />
        </svg>
        <div style={{ position: "absolute", left: 60 + 840 * trazo - 30, top: 20, opacity: trazo < 1 ? 1 : 0 }}>
          <Emoji e="✏️" tam={56} />
        </div>
        <div style={{ position: "absolute", left: 480 - 9, top: 250, width: 18, height: 300, borderRadius: 9, background: "rgba(255,244,230,0.7)" }} />
        <div style={{ position: "absolute", left: 480 - 120, top: 540, width: 240, height: 24, borderRadius: 12, background: "rgba(255,244,230,0.7)" }} />
        <div style={{ position: "absolute", left: 480 - 290, top: 312, width: 580, height: 14, borderRadius: 7, background: C.crema, transform: `rotate(${angulo}deg)` }} />
        <Plato lado={-1} iconos="🧳🧳🧳" texto="turistas" color={C.naranja} />
        <Plato lado={1} iconos="🏠🏠🏠" texto="residentes" color={C.verde} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", opacity: sello, transform: `scale(${0.6 + sello * 0.4})` }}>
          <div style={{ padding: "12px 30px", borderRadius: 999, background: C.verde, color: C.noche, fontFamily: SANS, fontWeight: 600, fontSize: 36 }}>✓ planeación turística</div>
        </div>
      </div>
    </>
  );
};

// ---------- 7. Cierre: atardecer y comentarios ----------
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globo = sp(frame, fps, 8, 7);
  const flota = Math.sin(frame / 8) * 8;
  const burbujas = ["💬", "❤️", "💬", "🏝️", "❤️", "💬"];
  return (
    <>
      <Bloque n={null} titulo="¿Lo has notado en tu colonia?" texto="Te leo en los comentarios." resaltar={["colonia"]} tTitulo={2} tTexto={45} />
      {burbujas.map((e, i) => {
        const ciclo = ((frame + i * 18) % 90) / 90;
        return (
          <div key={i} style={{ position: "absolute", left: 120 + i * 150, top: 1250 - ciclo * 500, opacity: Math.sin(ciclo * Math.PI) * globo }}>
            <Emoji e={e} tam={54} />
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 540 - 160,
          top: 820 + flota,
          width: 320,
          height: 220,
          borderRadius: 70,
          background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})`,
          transform: `scale(${globo})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 26,
          boxShadow: `0 30px 80px ${C.coral}88`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 18, background: C.crema, opacity: 0.4 + 0.6 * Math.max(0, Math.sin(frame / 6 - i)) }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, display: "flex", justifyContent: "center" }}>
        <Pastilla x={null} y={null} s={sp(frame, fps, 30, 12)} fondo="rgba(14,27,46,0.8)" color={C.crema} tam={34}>
          Sígueme para entender el turismo
        </Pastilla>
      </div>
    </>
  );
};

export const Turistificacion: React.FC = () => (
  <Reel
    duracion={DURACION_TURISTIFICACION}
    fondo={<Mundo duracion={DURACION_TURISTIFICACION} />}
    etiqueta={null}
    voz="voz-turistificacion.mp3"
    musica="musica-turistificacion.mp3"
    sonidos={SONIDOS}
    escenas={[
      { desde: 0, dur: 267, Pieza: Gancho },
      { desde: 267, dur: 230, Pieza: Concepto },
      { desde: 497, dur: 256, Pieza: Estudio },
      { desde: 753, dur: 209, Pieza: Contraste },
      { desde: 962, dur: 114, Pieza: SeExtiende },
      { desde: 1076, dur: 165, Pieza: Mirada },
      { desde: 1241, dur: 109, Pieza: Cierre },
    ]}
  />
);
