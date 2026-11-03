import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bloque, C, Reel, SANS, SERIF, useEntrada, Visual, ZONA_VISUAL } from "./comun";

// Escenas en fotogramas (30 fps), alineadas con las pausas de public/voz-vuelos.mp3 (35,8 s).
export const DURACION_VUELOS = 1089;

// Efectos (scripts/sonidos.sh): [fotograma absoluto, archivo, volumen], en el momento de cada animación.
const SONIDOS: [number, string, number][] = [
  [0, "whoosh", 0.5], // avión
  [30, "tachar", 0.45],
  [48, "pop", 0.5],
  [80, "whoosh", 0.4], // escena 1
  [87, "pop", 0.4],
  [195, "ding", 0.4], // día barato
  [305, "whoosh", 0.4], // escena 2
  [312, "pop", 0.4],
  [392, "notificacion", 0.5],
  [450, "whoosh", 0.4], // escena 3
  [457, "pop", 0.4],
  [580, "pop", 0.45], // pin AICM
  [620, "pop", 0.45], // pin AIFA
  [635, "ding", 0.3], // vs
  [690, "whoosh", 0.4], // escena 4
  [697, "pop", 0.4],
  [930, "golpe", 0.55], // maleta
  [1006, "whoosh", 0.4], // cierre
  [1021, "guardar", 0.5],
];

const Avion: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
    />
  </svg>
);

// 1. Gancho: el avión cruza y el precio alto se tacha.
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 70], [-200, 1000], { extrapolateRight: "clamp", easing: Easing.inOut(Easing.cubic) });
  const y = 250 - Math.sin((x + 200) / 1200 * Math.PI) * 120;
  const tacha = interpolate(frame, [30, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barato = useEntrada(48, 9);
  return (
    <>
      <Bloque n={null} titulo="Deja de pagar de más por tus vuelos" texto={null} resaltar={["vuelos"]} tTitulo={2} tTexto={0} />
      <Visual>
        <div style={{ position: "absolute", left: x, top: y - 70, transform: "rotate(90deg)" }}>
          <Avion tam={140} color={C.crema} />
        </div>
        <div style={{ position: "absolute", left: 140, top: 150, fontFamily: SERIF, fontWeight: 800, fontSize: 150, color: "rgba(255,244,230,0.5)" }}>
          $$$
          <div style={{ position: "absolute", left: -10, top: 95, height: 12, borderRadius: 6, width: `${tacha * 105}%`, background: C.coral }} />
        </div>
        <div
          style={{
            position: "absolute",
            right: 140,
            top: 150,
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 150,
            color: C.verde,
            transform: `scale(${barato})`,
          }}
        >
          $
        </div>
      </Visual>
    </>
  );
};

// 2. Calendario: los días aparecen y uno barato se ilumina.
const Calendario: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const elegido = 17;
  const luz = spring({ frame: frame - 110, fps, config: { damping: 9 } });
  const caros = [0, 3, 5, 6, 9, 12, 13, 19, 20, 26, 27];
  return (
    <>
      <Bloque n={1} titulo="Busca por mes, no por día." texto="Mira el calendario de precios de Google Flights: a veces moverte un día cambia todo." resaltar={["mes"]} tTitulo={24} tTexto={100} />
      <Visual>
        <div style={{ position: "absolute", left: 60, top: 34, display: "grid", gridTemplateColumns: "repeat(7, 96px)", gap: 16 }}>
          {Array.from({ length: 28 }).map((_, i) => {
            const s = spring({ frame: frame - 10 - i, fps, config: { damping: 14 } });
            const esElegido = i === elegido;
            const fondo = esElegido ? C.verde : caros.includes(i) ? C.coral : "rgba(255,244,230,0.22)";
            return (
              <div
                key={i}
                style={{
                  height: 76,
                  borderRadius: 18,
                  background: fondo,
                  opacity: esElegido ? s : s * (1 - luz * 0.45),
                  transform: `scale(${s * (esElegido ? 1 + luz * 0.25 : 1)})`,
                  boxShadow: esElegido ? `0 0 ${luz * 50}px ${C.verde}` : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 30,
                  color: esElegido ? C.noche : "rgba(255,244,230,0.7)",
                }}
              >
                {i + 1}
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 22,
            textAlign: "center",
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 34,
            color: C.verde,
            opacity: luz,
          }}
        >
          el día más barato del mes
        </div>
      </Visual>
    </>
  );
};

// 3. Alerta: aparece una notificación en el celular.
const Alerta: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const aviso = spring({ frame: frame - 82, fps, config: { damping: 11 } });
  const campana = Math.sin(frame / 2.5) * 14 * Math.max(0, 1 - Math.max(0, frame - 82) / 30) * (frame > 82 ? 1 : 0);
  return (
    <>
      <Bloque n={2} titulo="Activa alertas de precio." texto="Google Flights te avisa cuando baja." resaltar={["alertas"]} tTitulo={4} tTexto={82} />
      <Visual>
        <div
          style={{
            position: "absolute",
            left: 460 - 160,
            top: 40,
            width: 320,
            height: 560,
            borderRadius: 48,
            border: `6px solid ${C.crema}`,
            background: C.noche,
          }}
        >
          <div style={{ position: "absolute", left: 110, top: 18, width: 100, height: 14, borderRadius: 7, background: "rgba(255,244,230,0.3)" }} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 90,
            right: 90,
            top: 150,
            padding: "26px 30px",
            borderRadius: 28,
            background: C.crema,
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: aviso,
            transform: `translateY(${(1 - aviso) * -80}px) scale(${0.9 + aviso * 0.1})`,
            boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              flexShrink: 0,
              borderRadius: 20,
              background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `rotate(${campana}deg)`,
            }}
          >
            <svg width={44} height={44} viewBox="0 0 24 24">
              <path fill={C.noche} d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
          </div>
          <div style={{ fontFamily: SANS, color: C.noche }}>
            <div style={{ fontWeight: 600, fontSize: 32 }}>Bajó el precio</div>
            <div style={{ fontWeight: 500, fontSize: 26, opacity: 0.7 }}>de tu vuelo guardado</div>
          </div>
        </div>
      </Visual>
    </>
  );
};

// 4. Aeropuertos: dos puntos en el mapa, mismo destino.
const Aeropuertos: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p1 = spring({ frame: frame - 125, fps, config: { damping: 10 } });
  const p2 = spring({ frame: frame - 165, fps, config: { damping: 10 } });
  const linea = interpolate(frame, [140, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const vs = spring({ frame: frame - 180, fps, config: { damping: 8 } });
  const Pin: React.FC<{ x: number; s: number; nombre: string }> = ({ x, s, nombre }) => (
    <div style={{ position: "absolute", left: x - 70, top: 120, width: 140, textAlign: "center", transform: `translateY(${(1 - s) * -60}px)`, opacity: s }}>
      <svg width={140} height={170} viewBox="0 0 24 30">
        <path fill={C.coral} d="M12 0C5.4 0 0 5.4 0 12c0 9 12 18 12 18s12-9 12-18C24 5.4 18.6 0 12 0z" />
        <circle cx={12} cy={12} r={5} fill={C.crema} />
      </svg>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 54, color: C.crema, marginTop: 10 }}>{nombre}</div>
    </div>
  );
  return (
    <>
      <Bloque n={3} titulo="Revisa otros aeropuertos." texto="En CDMX, compara AICM y AIFA." resaltar={["aeropuertos"]} tTitulo={30} tTexto={95} />
      <Visual>
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={920} height={500}>
          <line x1={230} y1={205} x2={230 + 460 * linea} y2={205} stroke={C.crema} strokeWidth={6} strokeDasharray="18 16" strokeLinecap="round" opacity={0.6} />
        </svg>
        <Pin x={230} s={p1} nombre="AICM" />
        <Pin x={690} s={p2} nombre="AIFA" />
        <div
          style={{
            position: "absolute",
            left: 460 - 55,
            top: 150,
            width: 110,
            height: 110,
            borderRadius: 55,
            background: C.naranja,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 46,
            color: C.noche,
            transform: `scale(${vs})`,
          }}
        >
          vs
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.naranja, opacity: vs }}>
          mismo destino, otro precio
        </div>
      </Visual>
    </>
  );
};

// 5. Tarifa: la básica sólo trae artículo personal; al sumar la maleta, el precio real sube.
const Tarifa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const maleta = spring({ frame: frame - 235, fps, config: { damping: 9 } });
  const barra = interpolate(frame, [245, 275], [0.45, 0.85], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  return (
    <>
      <Bloque
        n={4}
        titulo="Ojo con la tarifa más barata."
        texto="En Volaris y Viva Aerobus sólo incluye un artículo personal: suma la maleta antes de comparar."
        resaltar={["Ojo"]}
        tTitulo={32}
        tTexto={108}
      />
      <Visual>
        <div style={{ position: "absolute", left: 60, top: 60, right: 60, fontFamily: SANS, color: C.crema }}>
          <div style={{ fontWeight: 600, fontSize: 30, opacity: 0.6, letterSpacing: 2 }}>TARIFA BÁSICA</div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24, fontSize: 38, fontWeight: 600 }}>
            <span style={{ color: C.verde, fontSize: 44 }}>✓</span> Artículo personal
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 18,
              fontSize: 38,
              fontWeight: 600,
              color: C.naranja,
              opacity: maleta,
              transform: `translateY(${(1 - maleta) * -50}px)`,
            }}
          >
            <span style={{ fontSize: 44 }}>+</span> Maleta documentada
          </div>
          <div style={{ marginTop: 50, fontWeight: 600, fontSize: 28, opacity: 0.6 }}>PRECIO REAL</div>
          <div style={{ marginTop: 14, height: 40, borderRadius: 20, background: "rgba(255,244,230,0.15)" }}>
            <div style={{ width: `${barra * 100}%`, height: "100%", borderRadius: 20, background: `linear-gradient(90deg, ${C.verde}, ${barra > 0.6 ? C.coral : C.verde})` }} />
          </div>
        </div>
      </Visual>
    </>
  );
};

// 6. Cierre: guardar el video.
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icono = spring({ frame: frame - 10, fps, config: { damping: 7 } });
  const latido = 1 + Math.max(0, Math.sin((frame - 30) / 6)) * 0.06 * (frame > 30 ? 1 : 0);
  return (
    <>
      <Bloque n={null} titulo="Guárdalo para tu próximo viaje" texto={null} resaltar={["Guárdalo"]} tTitulo={4} tTexto={0} />
      <div
        style={{
          position: "absolute",
          left: 540 - 130,
          top: ZONA_VISUAL + 60,
          width: 260,
          height: 260,
          borderRadius: 70,
          background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${icono * latido})`,
          boxShadow: `0 30px 80px ${C.coral}66`,
        }}
      >
        <svg width={130} height={130} viewBox="0 0 24 24">
          <path fill={C.crema} d="M6 2h12a1 1 0 0 1 1 1v19l-7-4.5L5 22V3a1 1 0 0 1 1-1z" />
        </svg>
      </div>
    </>
  );
};

export const VuelosBaratos: React.FC = () => (
  <Reel
    duracion={DURACION_VUELOS}
    fondo={null}
    etiqueta="tips de viaje"
    voz="voz-vuelos.mp3"
    musica="musica-vuelos.mp3"
    sonidos={SONIDOS}
    escenas={[
      { desde: 0, dur: 85, Pieza: Gancho },
      { desde: 85, dur: 225, Pieza: Calendario },
      { desde: 310, dur: 145, Pieza: Alerta },
      { desde: 455, dur: 240, Pieza: Aeropuertos },
      { desde: 695, dur: 316, Pieza: Tarifa },
      { desde: 1011, dur: 78, Pieza: Cierre },
    ]}
  />
);
