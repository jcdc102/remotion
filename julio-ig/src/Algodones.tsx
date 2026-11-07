import { AbsoluteFill, Easing, interpolate, Sequence, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Grano } from "./cine";
import { C, Palabras, Reel, SANS, SERIF } from "./comun";

// Los Algodones, Baja California: turismo de salud. Ritmo pausado: fundidos suaves y tiempo para leer.
// Datos: INEGI, DENUE (consulta del 7 nov 2026) y Rodríguez Blanco, A. (2020), Contexto Odontológico, 10(19), 50-58 (UNAM).
// Voz con pausas: public/voz-algodones.mp3 (52 s).
export const DURACION_ALGODONES = 1560;

const FUENTE_UNAM = "Fuente: Rodríguez Blanco (2020), Contexto Odontológico, UNAM";
const FUENTE_INEGI = "Fuente: INEGI, DENUE (consulta del 7 de noviembre de 2026)";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FUNDIDO = 18;

// Tramos de cada escena (fotogramas) y momentos clave de la voz.
const T = {
  gancho: [0, 156],
  lugar: [156, 390],
  visitantes: [390, 630],
  historia: [630, 819],
  garita: [819, 990],
  temporada: [990, 1260],
  salud: [1260, 1407],
  cierre: [1407, 1560],
} as const;

const SONIDOS: [number, string, number][] = [
  [30, "pop", 0.3],
  [T.lugar[0], "whoosh", 0.25],
  [T.lugar[0] + 60, "pop", 0.35], // pin
  [324, "brillo", 0.3], // «Molar City»
  [T.visitantes[0], "whoosh", 0.25],
  [T.historia[0], "whoosh", 0.25],
  [T.historia[0] + 40, "tachar", 0.2],
  [T.garita[0], "whoosh", 0.25],
  [T.garita[0] + 80, "pop", 0.3],
  [T.temporada[0], "whoosh", 0.25],
  [1176, "brillo", 0.3], // pájaros de la nieve
  [T.salud[0], "whoosh", 0.25],
  [1290, "ding", 0.3],
  [T.cierre[0], "whoosh", 0.25],
  [1425, "notificacion", 0.35],
];

const suave = (frame: number, fps: number, desde: number) => spring({ frame: frame - desde, fps, config: { damping: 20, mass: 1.2 } });

// Escena con fundido de entrada y salida (sin cortes bruscos).
const Tramo: React.FC<{ rango: readonly [number, number]; children: React.ReactNode }> = ({ rango, children }) => {
  const frame = useCurrentFrame();
  const [a, b] = rango;
  const ultimo = b >= DURACION_ALGODONES;
  const o = interpolate(frame, [a, a + FUNDIDO, b - FUNDIDO, b], [a === 0 ? 1 : 0, 1, 1, ultimo ? 1 : 0], clamp);
  const sube = interpolate(frame, [a, a + FUNDIDO * 1.5], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  if (frame < a - 1 || frame > b + 1) return null;
  return (
    <AbsoluteFill style={{ opacity: o, transform: `translateY(${a === 0 ? 0 : sube}px)` }}>
      <Sequence from={a} durationInFrames={b - a + FUNDIDO}>
        {children}
      </Sequence>
    </AbsoluteFill>
  );
};

// Fondo: desierto de la frontera al atardecer, con montañas, dunas, cactus y calor que ondula.
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
      <div style={{ position: "absolute", left: 300 - 300, top: solY - 300, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,214,140,0.5) 0%, rgba(255,150,90,0.15) 40%, transparent 70%)" }} />
      <div style={{ position: "absolute", left: 300 - 110, top: solY - 110, width: 220, height: 220, borderRadius: "50%", background: "radial-gradient(circle, #FFF1C9 0%, #FFC27A 55%, #FF8F5A 100%)" }} />
      <svg style={{ position: "absolute", left: deriva * 0.4, top: 0 }} width={1200} height={1920}>
        <path d="M-20 1300 L-20 1140 L90 1070 L170 1120 L280 1040 L380 1110 L520 1060 L640 1130 L760 1050 L880 1120 L1000 1070 L1220 1130 L1220 1300 Z" fill="#5A2E58" opacity={0.8} />
        <path d="M-20 1320 Q 200 1220 420 1270 Q 640 1200 860 1270 Q 1040 1230 1220 1260 L1220 1920 L-20 1920 Z" fill="#B5603F" />
        <path d="M-20 1400 Q 260 1330 520 1390 Q 780 1340 1220 1380 L1220 1920 L-20 1920 Z" fill="#8E4532" />
        <path d="M-20 1520 Q 300 1470 620 1510 Q 900 1480 1220 1500 L1220 1920 L-20 1920 Z" fill="#5E2E2A" />
      </svg>
      <Cactus x={70} y={1250} e={0.9} />
      <Cactus x={880} y={1300} e={1.2} />
      <Cactus x={600} y={1360} e={0.6} />
      {/* Calor que ondula sobre el horizonte */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 1240 + i * 14, height: 3, background: "rgba(255,210,160,0.12)", transform: `translateX(${Math.sin(frame / 14 + i) * 20}px)` }} />
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,12,28,0.75) 0%, rgba(10,12,28,0.25) 32%, rgba(10,12,28,0) 45%)" }} />
    </AbsoluteFill>
  );
};

const Fuente: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: 1390, padding: "8px 16px", borderRadius: 14, background: "rgba(14,27,46,0.75)", textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 21, color: "rgba(255,244,230,0.8)" }}>
    {texto}
  </div>
);

const Titulo: React.FC<{ texto: string; frase: string | null; resaltar: string[] | null; tFrase: number }> = ({ texto, frase, resaltar, tFrase }) => (
  <div style={{ position: "absolute", left: 80, right: 80, top: 340 }}>
    <Palabras texto={texto} tam={82} fuente={SERIF} peso={800} retraso={4} resaltar={resaltar} color={C.crema} />
    {frase ? (
      <>
        <div style={{ height: 22 }} />
        <Palabras texto={frase} tam={42} fuente={SANS} peso={500} retraso={tFrase} resaltar={null} color="rgba(255,244,230,0.88)" />
      </>
    ) : null}
  </div>
);

const Diente: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path fill={color} d="M7 2C4.2 2 2.5 4.3 2.8 7.4c.3 2.6 1.4 4.3 1.9 6.8.5 2.6.7 7.8 2.8 7.8 1.9 0 1.9-4.6 3-6.4.4-.7.9-.7 1.4-.7s1 0 1.4.7c1.1 1.8 1.1 6.4 3 6.4 2.1 0 2.3-5.2 2.8-7.8.5-2.5 1.6-4.2 1.9-6.8C21.3 4.3 19.6 2 16.8 2c-2 0-3 1-4.8 1S9 2 7 2z" />
  </svg>
);

// ---------- 1. Gancho: 311 consultorios (INEGI) ----------
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <Titulo texto="Un pueblo con 311 consultorios dentales" frase={null} resaltar={["311"]} tFrase={0} />
      <div style={{ position: "absolute", left: 90, top: 760, display: "grid", gridTemplateColumns: "repeat(25, 32px)", gap: 4 }}>
        {Array.from({ length: 311 }).map((_, i) => {
          const s = interpolate(frame, [30 + i * 0.29, 42 + i * 0.29], [0, 1], clamp);
          return (
            <div key={i} style={{ opacity: s, transform: `scale(${s})` }}>
              <Diente tam={30} color={i % 9 === 0 ? C.naranja : C.crema} />
            </div>
          );
        })}
      </div>
      <Fuente texto={FUENTE_INEGI} />
    </>
  );
};

// ---------- 2. Dónde está: mapa de la frontera ----------
const Lugar: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mapa = suave(frame, fps, 0);
  const pin = suave(frame, fps, 60);
  const molar = suave(frame, fps, 168);
  const pulso = (frame % 50) / 50;
  return (
    <>
      <Titulo texto="Los Algodones, Baja California" frase="En la frontera con Estados Unidos." resaltar={["Algodones,"]} tFrase={40} />
      <div style={{ position: "absolute", left: 80, top: 700, width: 920, height: 600, borderRadius: 34, overflow: "hidden", opacity: mapa, transform: `scale(${0.94 + mapa * 0.06})`, boxShadow: "0 40px 80px rgba(0,0,0,0.45)" }}>
        <svg width={920} height={600}>
          <rect width={920} height={600} fill="#E9D8C4" />
          {/* Golfo de California y río Colorado (ilustrativo) */}
          <path d="M 380 600 Q 420 470 470 400 Q 500 360 520 330 L 560 600 Z" fill="#7FB7BE" />
          <path d="M 520 330 Q 540 250 600 190 Q 640 140 700 60" stroke="#7FB7BE" strokeWidth={10} fill="none" />
          {/* Frontera */}
          <path d="M 0 250 L 600 250 L 920 140" stroke={C.coral} strokeWidth={5} strokeDasharray="18 12" fill="none" />
          <text x={40} y={200} fill="#5A3A2A" fontFamily={SANS} fontWeight={600} fontSize={30}>Estados Unidos</text>
          <text x={40} y={320} fill="#5A3A2A" fontFamily={SANS} fontWeight={600} fontSize={30}>México</text>
          <text x={150} y={420} fill="rgba(90,58,42,0.7)" fontFamily={SANS} fontWeight={500} fontSize={24}>Mexicali</text>
          <circle cx={240} cy={390} r={8} fill="#5A3A2A" />
          <text x={760} y={110} fill="rgba(90,58,42,0.7)" fontFamily={SANS} fontWeight={500} fontSize={24}>Arizona</text>
          <g opacity={pin} transform={`translate(560 252) scale(${0.6 + pin * 0.4})`}>
            <circle r={18 + pulso * 50} fill="none" stroke={C.coral} strokeWidth={4} opacity={1 - pulso} />
            <circle r={18} fill={C.coral} stroke={C.crema} strokeWidth={4} />
          </g>
          <text x={590} y={300} fill="#1E1B40" fontFamily={SERIF} fontWeight={800} fontSize={36} opacity={pin}>Los Algodones</text>
          <text x={900} y={585} textAnchor="end" fill="rgba(30,27,64,0.5)" fontFamily={SANS} fontSize={18}>mapa ilustrativo, no a escala</text>
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, display: "flex", justifyContent: "center", opacity: molar, transform: `scale(${0.8 + molar * 0.2})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 36px", borderRadius: 999, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
          <Diente tam={52} color={C.crema} />
          <span style={{ fontFamily: SERIF, fontWeight: 800, fontStyle: "italic", fontSize: 62, color: C.noche }}>«Molar City»</span>
        </div>
      </div>
    </>
  );
};

// ---------- 3. Quién llega ----------
const Visitantes: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const precio = suave(frame, fps, 120);
  const personas = Array.from({ length: 14 });
  return (
    <>
      <Titulo texto="Miles de visitantes cada año" frase="Vienen de Estados Unidos y Canadá, por precios más accesibles." resaltar={["Miles"]} tFrase={30} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 260 }}>
        <div style={{ position: "absolute", left: 470, top: 0, width: 12, height: 240, background: "repeating-linear-gradient(180deg, #C9C2B8 0 18px, #8A8278 18px 24px)", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 160, top: -60, fontSize: 80, opacity: suave(frame, fps, 10) }}>🇺🇸🇨🇦</div>
        <div style={{ position: "absolute", left: 640, top: -60, fontSize: 80, opacity: suave(frame, fps, 20) }}>🇲🇽</div>
        {personas.map((_, i) => {
          const ciclo = ((frame + i * 17) % 160) / 160;
          const x = 60 + ciclo * 900;
          return (
            <div key={i} style={{ position: "absolute", left: x, top: 90 + (i % 3) * 40, fontSize: 56, opacity: Math.sin(ciclo * Math.PI) }}>
              {["🧳", "🚶", "🧓", "🚶‍♀️"][i % 4]}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, display: "flex", justifyContent: "center", opacity: precio, transform: `translateY(${(1 - precio) * 30}px)` }}>
        <div style={{ padding: "14px 34px", borderRadius: 999, background: C.crema, color: C.noche, fontFamily: SANS, fontWeight: 600, fontSize: 40, boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
          🦷 Atención dental más accesible
        </div>
      </div>
      <Fuente texto={FUENTE_UNAM} />
    </>
  );
};

// ---------- 4. Cómo empezó: un anuncio de los años 70 ----------
const Historia: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cartel = suave(frame, fps, 10);
  return (
    <>
      <Titulo texto="Todo empezó en los años 70" frase="Un dentista del pueblo comenzó a anunciarse en Estados Unidos." resaltar={["70"]} tFrase={28} />
      <div
        style={{
          position: "absolute",
          left: 190,
          top: 760,
          width: 700,
          height: 520,
          borderRadius: 14,
          background: "linear-gradient(180deg, #F3E3C3, #E6CFA2)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          transform: `rotate(${-3 + cartel * 1}deg) scale(${0.85 + cartel * 0.15})`,
          opacity: cartel,
          filter: "sepia(0.35)",
          padding: 40,
          textAlign: "center",
        }}
      >
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: "#6B3A22" }}>— 197X —</div>
        <div style={{ margin: "20px auto", width: 150 }}>
          <Diente tam={150} color="#6B3A22" />
        </div>
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 64, color: "#3A1F14", lineHeight: 1.05 }}>DENTISTA</div>
        <div style={{ fontFamily: SERIF, fontWeight: 600, fontStyle: "italic", fontSize: 40, color: "#6B3A22", marginTop: 10 }}>en Los Algodones</div>
        <div style={{ height: 2, background: "#6B3A22", margin: "26px 60px", opacity: 0.5 }} />
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 24, color: "#6B3A22" }}>ilustración</div>
      </div>
      <Fuente texto={FUENTE_UNAM} />
    </>
  );
};

// ---------- 5. Dónde están: más de la mitad en 5 manzanas (DENUE) ----------
// Consultorios por manzana del DENUE: las 5 con más suman 173 de 311 (56%); el resto se reparte en otras 20.
const MANZANAS = [60, 31, 30, 27, 25, 18, 18, 16, 14, 12, 11, 9, 9, 7, 4, 4, 4, 3, 2, 2, 1, 1, 1, 1, 1];
const Garita: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const plano = suave(frame, fps, 0);
  const resalta = suave(frame, fps, 70);
  const pie = suave(frame, fps, 120);
  return (
    <>
      <Titulo texto="Más de la mitad, en solo 5 manzanas" frase="Junto a la garita de Andrade." resaltar={["5", "manzanas"]} tFrase={36} />
      <div style={{ position: "absolute", left: 80, top: 720, width: 920, height: 470, borderRadius: 30, background: "rgba(14,27,46,0.85)", opacity: plano, transform: `translateY(${(1 - plano) * 30}px)`, boxShadow: "0 40px 80px rgba(0,0,0,0.45)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 56, borderRadius: "30px 30px 0 0", background: "repeating-linear-gradient(90deg, #C9C2B8 0 14px, transparent 14px 26px)", opacity: 0.7 }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 10, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "4px 18px", borderRadius: 10, background: C.crema, fontFamily: SANS, fontWeight: 600, fontSize: 24, color: C.noche }}>🛂 Frontera · garita de Andrade</div>
        </div>
        <div style={{ position: "absolute", left: 30, top: 80, display: "flex", alignItems: "flex-end", gap: 8, height: 340 }}>
          {MANZANAS.map((n, i) => {
            const top5 = i < 5;
            const crece = interpolate(frame, [10 + i * 2, 40 + i * 2], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 26 }}>
                {top5 ? <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: C.crema, opacity: resalta, marginBottom: 4 }}>{n}</div> : null}
                <div style={{ width: 26, height: (n / 60) * 280 * crece + 4, borderRadius: 6, background: top5 ? `rgba(255,107,91,${0.5 + resalta * 0.5})` : "#8A7A9A", boxShadow: top5 ? `0 0 ${resalta * 24}px ${C.coral}` : "none" }} />
              </div>
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 30, right: 30, bottom: 16, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: "rgba(255,244,230,0.7)" }}>
          Consultorios por manzana · las 5 primeras suman 173 de 311
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1225, display: "flex", justifyContent: "center", gap: 16, opacity: pie, transform: `translateY(${(1 - pie) * 20}px)` }}>
        <div style={{ padding: "12px 26px", borderRadius: 999, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.noche }}>56% en 5 manzanas</div>
        <div style={{ padding: "12px 26px", borderRadius: 999, background: C.crema, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.noche }}>77% con 0 a 5 trabajadores</div>
      </div>
      <Fuente texto={FUENTE_INEGI} />
    </>
  );
};

// ---------- 6. Temporada: verano caluroso, invierno con «pájaros de la nieve» ----------
const Temporada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const verano = suave(frame, fps, 10);
  const invierno = suave(frame, fps, 60);
  const aves = interpolate(frame, [180, 200], [0, 1], clamp);
  return (
    <>
      <Titulo texto="Y tiene temporada" frase="En invierno, cuando baja el calor del desierto, llegan muchos más visitantes." resaltar={["temporada"]} tFrase={40} />
      <div style={{ position: "absolute", left: 80, top: 800, width: 440, height: 380, borderRadius: 30, background: "rgba(40,16,30,0.82)", border: `2px solid ${C.coral}`, opacity: verano, transform: `translateY(${(1 - verano) * 40}px)`, textAlign: "center", paddingTop: 30 }}>
        <div style={{ fontSize: 90 }}>☀️</div>
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 54, color: C.crema }}>Verano</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: C.naranja }}>35–40 °C</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: "rgba(255,244,230,0.8)", marginTop: 8 }}>menos visitantes</div>
      </div>
      <div style={{ position: "absolute", left: 560, top: 800, width: 440, height: 380, borderRadius: 30, background: "rgba(14,27,46,0.82)", border: "2px solid #7FB7BE", opacity: invierno, transform: `translateY(${(1 - invierno) * 40}px)`, textAlign: "center", paddingTop: 30 }}>
        <div style={{ fontSize: 90 }}>❄️</div>
        <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 54, color: C.crema }}>Invierno</div>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, color: "#9ED6DC" }}>menos de 20 °C</div>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: 28, color: "rgba(255,244,230,0.8)", marginTop: 8 }}>muchos más visitantes</div>
      </div>
      {Array.from({ length: 7 }).map((_, i) => {
        const x = interpolate(frame, [180 + i * 4, 270], [-200 - i * 60, 1200], clamp);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 640 + (i % 3) * 40 + Math.sin(frame / 6 + i) * 8, fontSize: 44, opacity: aves }}>
            🐦
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1230, display: "flex", justifyContent: "center", opacity: aves, transform: `scale(${0.8 + aves * 0.2})` }}>
        <div style={{ padding: "14px 34px", borderRadius: 999, background: `linear-gradient(90deg, #9ED6DC, #FFF4E6)`, fontFamily: SERIF, fontWeight: 800, fontStyle: "italic", fontSize: 50, color: C.noche }}>
          «los pájaros de la nieve»
        </div>
      </div>
      <Fuente texto={FUENTE_UNAM} />
    </>
  );
};

// ---------- 7. Turismo de salud ----------
const Salud: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icono = suave(frame, fps, 10);
  const latido = 1 + Math.max(0, Math.sin(frame / 10)) * 0.05;
  return (
    <>
      <Titulo texto="Esto es turismo de salud" frase="Cuando el motivo del viaje es cuidarte." resaltar={["salud"]} tFrase={48} />
      <div style={{ position: "absolute", left: 540 - 170, top: 820, width: 340, height: 340, borderRadius: 170, background: `radial-gradient(circle, ${C.naranja}, ${C.coral})`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${icono * latido})`, boxShadow: `0 30px 90px ${C.coral}77` }}>
        <Diente tam={180} color={C.crema} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 32, color: "rgba(255,244,230,0.85)", opacity: icono }}>
        ♨️ 🏥 🦷 · uno de los tipos de turismo de la OMT
      </div>
    </>
  );
};

// ---------- 8. Cierre ----------
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const globo = suave(frame, fps, 14);
  const flota = Math.sin(frame / 10) * 8;
  return (
    <>
      <Titulo texto="¿Tú cruzarías la frontera para ir al dentista?" frase="Te leo." resaltar={["frontera"]} tFrase={75} />
      <div style={{ position: "absolute", left: 540 - 150, top: 900 + flota, width: 300, height: 200, borderRadius: 60, background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})`, transform: `scale(${globo})`, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, boxShadow: `0 30px 80px ${C.coral}77` }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: C.crema, opacity: 0.4 + 0.6 * Math.max(0, Math.sin(frame / 8 - i)) }} />
        ))}
      </div>
    </>
  );
};

const Escena: React.FC = () => (
  <AbsoluteFill>
    <Tramo rango={T.gancho}>
      <Gancho />
    </Tramo>
    <Tramo rango={T.lugar}>
      <Lugar />
    </Tramo>
    <Tramo rango={T.visitantes}>
      <Visitantes />
    </Tramo>
    <Tramo rango={T.historia}>
      <Historia />
    </Tramo>
    <Tramo rango={T.garita}>
      <Garita />
    </Tramo>
    <Tramo rango={T.temporada}>
      <Temporada />
    </Tramo>
    <Tramo rango={T.salud}>
      <Salud />
    </Tramo>
    <Tramo rango={T.cierre}>
      <Cierre />
    </Tramo>
  </AbsoluteFill>
);

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
