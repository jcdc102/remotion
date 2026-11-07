import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Grano } from "./cine";
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

const Desierto: React.FC = () => {
  const frame = useCurrentFrame();
  const solY = interpolate(frame, [0, DURACION_ALGODONES], [1080, 1170]);
  const deriva = interpolate(frame, [0, DURACION_ALGODONES], [0, -60]);
  const Cactus: React.FC<{ x: number; y: number; e: number }> = ({ x, y, e }) => (
    <svg style={{ position: "absolute", left: x + deriva * 1.6, top: y }} width={90 * e} height={160 * e} viewBox="0 0 90 160">
      <path d="M38 160 L38 30 Q45 10 52 30 L52 160 Z M38 90 L22 90 Q12 90 12 75 L12 55 Q17 45 22 55 L22 78 L38 78 Z M52 70 L66 70 L66 45 Q71 35 76 45 L76 66 Q76 82 66 82 L52 82 Z" fill="#2A1630" />
    </svg>
  );
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0E1B2E 0%, #2B1F4A 30%, #7A3358 50%, #D2604F 60%, #FF9A5C 66%, #FFC27A 69%)" }} />
      <div style={{ position: "absolute", left: 0, top: solY - 300, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.5) 0%, rgba(255,150,90,0.15) 40%, transparent 70%)" }} />
      <div style={{ position: "absolute", left: 190, top: solY - 110, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, #FFF1C9 0%, #FFC27A 55%, #FF8F5A 100%)" }} />
      <svg style={{ position: "absolute", left: deriva * 0.4, top: 0 }} width={1200} height={1920}>
        <path d="M-20 1300 L-20 1140 L90 1070 L170 1120 L280 1040 L380 1110 L520 1060 L640 1130 L760 1050 L880 1120 L1000 1070 L1220 1130 L1220 1300 Z" fill="#5A2E58" opacity={0.8} />
        <path d="M-20 1320 Q 200 1220 420 1270 Q 640 1200 860 1270 Q 1040 1230 1220 1260 L1220 1920 L-20 1920 Z" fill="#B5603F" />
        <path d="M-20 1400 Q 260 1330 520 1390 Q 780 1340 1220 1380 L1220 1920 L-20 1920 Z" fill="#8E4532" />
        <path d="M-20 1520 Q 300 1470 620 1510 Q 900 1480 1220 1500 L1220 1920 L-20 1920 Z" fill="#5E2E2A" />
      </svg>
      <Cactus x={70} y={1250} e={0.9} />
      <Cactus x={880} y={1300} e={1.2} />
      <Cactus x={600} y={1360} e={0.6} />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 1240 + i * 14, height: 3, background: "rgba(255,210,160,0.12)", transform: `translateX(${Math.sin(frame / 14 + i) * 20}px)` }} />
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,12,28,0.8) 0%, rgba(10,12,28,0.3) 32%, rgba(10,12,28,0) 45%)" }} />
    </AbsoluteFill>
  );
};

const Diente: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path fill={color} d="M7 2C4.2 2 2.5 4.3 2.8 7.4c.3 2.6 1.4 4.3 1.9 6.8.5 2.6.7 7.8 2.8 7.8 1.9 0 1.9-4.6 3-6.4.4-.7.9-.7 1.4-.7s1 0 1.4.7c1.1 1.8 1.1 6.4 3 6.4 2.1 0 2.3-5.2 2.8-7.8.5-2.5 1.6-4.2 1.9-6.8C21.3 4.3 19.6 2 16.8 2c-2 0-3 1-4.8 1S9 2 7 2z" />
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
    <div style={{ position: "absolute", left: 80, right: 80, top: 330, opacity: 1 - sale, transform: `translateY(${-sale * 40}px)` }}>
      <TextoMascara texto={texto} desde={desde} tiempos={tiempos} tam={80} fuente={SERIF} peso={800} color={C.crema} resaltar={resaltar} />
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
const PIN = { x: 1000, y: 520 };
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
        <rect x={0} y={0} width={1600} height={1100} rx={60} fill="#E9D8C4" />
        <rect x={0} y={0} width={1600} height={PIN.y} rx={60} fill="#DCC8B0" />
        <path d={`M 860 1100 Q 900 900 950 760 Q 980 650 ${PIN.x} ${PIN.y}`} fill="none" stroke="#7FB7BE" strokeWidth={22} />
        <path d={`M ${PIN.x} ${PIN.y} Q 1060 380 1180 200 Q 1240 110 1300 0`} fill="none" stroke="#7FB7BE" strokeWidth={22} />
        <path d={`M 0 ${PIN.y} L ${PIN.x} ${PIN.y} L 1600 260`} stroke={C.coral} strokeWidth={8} strokeDasharray="26 18" fill="none" />
        <text x={120} y={PIN.y - 60} fill="#5A3A2A" fontFamily={SANS} fontWeight={600} fontSize={52} opacity={eua}>Estados Unidos</text>
        <text x={120} y={PIN.y + 100} fill="#5A3A2A" fontFamily={SANS} fontWeight={600} fontSize={52} opacity={mx}>México · Baja California</text>
        <circle cx={330} cy={760} r={12} fill="#5A3A2A" opacity={mx} />
        <text x={360} y={772} fill="rgba(90,58,42,0.75)" fontFamily={SANS} fontWeight={500} fontSize={38} opacity={mx}>Mexicali</text>
        <text x={1320} y={140} fill="rgba(90,58,42,0.75)" fontFamily={SANS} fontWeight={500} fontSize={38} opacity={eua}>Arizona</text>
        <text x={PIN.x + 50} y={PIN.y + 70} fill="#1E1B40" fontFamily={SERIF} fontWeight={800} fontSize={58}>Los Algodones</text>
        <circle cx={PIN.x} cy={PIN.y} r={30 + pulso * 70} fill="none" stroke={C.coral} strokeWidth={6} opacity={1 - pulso} />
        <circle cx={PIN.x} cy={PIN.y} r={30} fill={C.coral} stroke={C.crema} strokeWidth={6} />
        <text x={1560} y={1070} textAnchor="end" fill="rgba(30,27,64,0.45)" fontFamily={SANS} fontSize={28}>mapa ilustrativo, no a escala</text>
      </svg>
      {/* «Molar City» revelado desde una máscara junto al pin */}
      <div style={{ position: "absolute", left: PIN.x + 50, top: PIN.y + 100, overflow: "hidden", padding: "0 6px" }}>
        <div style={{ transform: `translateY(${(1 - molar) * 110}%)`, fontFamily: SERIF, fontWeight: 800, fontStyle: "italic", fontSize: 72, color: C.coral }}>«Molar City»</div>
      </div>
      {/* Banderas y visitantes que cruzan la frontera hacia el pueblo */}
      <div style={{ position: "absolute", left: PIN.x - 260, top: PIN.y - 300, fontSize: 90, opacity: banderas[0], transform: `scale(${0.6 + banderas[0] * 0.4})` }}>🇺🇸</div>
      <div style={{ position: "absolute", left: PIN.x - 140, top: PIN.y - 300, fontSize: 90, opacity: banderas[1], transform: `scale(${0.6 + banderas[1] * 0.4})` }}>🇨🇦</div>
      {Array.from({ length: 10 }).map((_, i) => {
        const ciclo = ((frame - 440 + i * 23) % 150) / 150;
        const activo = frame > 440 + i * 4;
        return (
          <div key={i} style={{ position: "absolute", left: PIN.x - 120 + (i % 5) * 50, top: PIN.y - 260 + ciclo * 420, fontSize: 54, opacity: activo ? Math.sin(ciclo * Math.PI) : 0 }}>
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
      <div style={{ position: "absolute", left: 100, top: 720, width: 880, height: 470, borderRadius: 30, background: "rgba(14,27,46,0.88)", boxShadow: "0 40px 80px rgba(0,0,0,0.45)" }} />
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
                background: top5 ? `rgba(255,107,91,${0.45 + resalta * 0.55})` : "#8A7A9A",
                boxShadow: top5 ? `0 0 ${resalta * 24}px ${C.coral}` : "none",
                opacity: i === 0 && frame >= T.temporada ? 0 : 1,
              }}
            />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 130, top: 1150, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "rgba(255,244,230,0.7)" }}>Consultorios por manzana · las 5 primeras suman 173 de 311</div>
    </div>
  );
};

const Escena: React.FC = () => {
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
              <Diente tam={30} color={i % 9 === 0 ? C.naranja : C.crema} />
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
    { f: 300, x: 820, y: 560, s: 0.62 },
    { f: 400, x: 840, y: 560, s: 0.66 },
    { f: 450, x: PIN.x + 110, y: PIN.y - 40, s: 1.1 }, // se acerca al cruce de los visitantes
    { f: 620, x: PIN.x + 120, y: PIN.y - 20, s: 1.18 },
  ];

  // 4. Una maleta de los visitantes se transforma en el cartel de los años 70.
  const cartelContenido = (
    <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #F3E3C3, #E6CFA2)", padding: 40, textAlign: "center", boxSizing: "border-box", filter: "sepia(0.3)" }}>
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
      {/* ---------- 1 ---------- */}
      {dientes}
      {frame >= 120 && frame < T.mapa + 30 ? (
        <Transformar
          de={{ x: 510, y: 970, w: 60, h: 60, radio: 30, color: C.coral }}
          a={{ x: 360, y: 925, w: 360, h: 150, radio: 75, color: C.coral }}
          desde={120}
          dur={22}
        >
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SERIF, fontWeight: 800, fontSize: 100, color: C.noche }}>311</div>
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
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${flota}px)` }}>
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
          <Transformar de={{ ...barra0, radio: 6, color: C.coral }} a={{ ...tubo, color: "rgba(255,244,230,0.18)" }} desde={T.temporada} dur={30}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${nivel * 100}%`, background: `linear-gradient(180deg, ${invierno > 0.5 ? "#9ED6DC" : C.naranja}, ${invierno > 0.5 ? "#4FA3C7" : C.coral})`, borderRadius: 45 }} />
          </Transformar>
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
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: `radial-gradient(circle, ${C.naranja}, ${C.coral})` }}>
              <Diente tam={180} color={C.crema} />
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
