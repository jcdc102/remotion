import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  staticFile,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as cargarSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as cargarSans } from "@remotion/google-fonts/Poppins";
import { Audio } from "@remotion/media";


const { fontFamily: SERIF } = cargarSerif("normal", { weights: ["700", "800"], subsets: ["latin"] });
const { fontFamily: SANS } = cargarSans("normal", { weights: ["500", "600"], subsets: ["latin"] });

// Colores de atardecer, los mismos de las frases de la cuenta.
const C = {
  noche: "#0E1B2E",
  morado: "#3A1F4A",
  coral: "#FF6B5B",
  naranja: "#FFA552",
  crema: "#FFF4E6",
  verde: "#5BD6A0",
  tarjeta: "rgba(255,244,230,0.08)",
};

// Escenas en fotogramas (30 fps), alineadas con las pausas de public/voz-vuelos.mp3 (35,8 s).
const ESCENAS = [
  { desde: 0, dur: 85 },
  { desde: 85, dur: 225 },
  { desde: 310, dur: 145 },
  { desde: 455, dur: 240 },
  { desde: 695, dur: 316 },
  { desde: 1011, dur: 78 },
];
export const DURACION_VUELOS = 1089;

// Zonas: texto entre y=330 y y=860; visual entre y=880 y y=1400. Libres el 15% superior y el 25% inferior.
const ZONA_TEXTO = 330;
const ZONA_VISUAL = 930;

const useEntrada = (retraso = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - retraso, fps, config: { damping, mass: 0.6 } });
};

const Palabras: React.FC<{
  texto: string;
  tam: number;
  fuente: string;
  peso: number;
  retraso: number;
  resaltar: string[] | null;
  color: string;
}> = ({ texto, tam, fuente, peso, retraso, resaltar, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const palabras = texto.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: `${tam * 0.12}px ${tam * 0.26}px` }}>
      {palabras.map((p, i) => {
        const s = spring({ frame: frame - retraso - i * 2, fps, config: { damping: 13, mass: 0.5 } });
        const limpia = p.replace(/[.,:]/g, "");
        const clave = resaltar?.includes(limpia) ?? false;
        const signo = clave ? p.slice(limpia.length) : "";
        const letra = { fontFamily: fuente, fontWeight: peso, fontSize: tam, lineHeight: 1.15 };
        return (
          <span
            key={i}
            style={{
              ...letra,
              color,
              opacity: s,
              transform: `translateY(${(1 - s) * 30}px) scale(${clave ? 0.85 + s * 0.15 : 1})`,
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
          >
            {clave ? (
              <span
                style={{
                  color: C.noche,
                  background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})`,
                  borderRadius: tam * 0.25,
                  padding: `0 ${tam * 0.18}px`,
                }}
              >
                {limpia}
              </span>
            ) : (
              p
            )}
            {signo}
          </span>
        );
      })}
    </div>
  );
};

const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  const sol = interpolate(frame, [0, DURACION_VUELOS], [1500, 1380]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.noche} 0%, ${C.morado} 55%, #8A3B4E 85%, ${C.coral} 100%)` }}>
      <div
        style={{
          position: "absolute",
          left: 540 - 450,
          top: sol,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${C.naranja}55 0%, ${C.coral}22 45%, transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

const Encabezado: React.FC = () => {
  const frame = useCurrentFrame();
  const avance = frame / DURACION_VUELOS;
  return (
    <>
      <div style={{ position: "absolute", left: 80, right: 80, top: 270, height: 6, borderRadius: 3, background: "rgba(255,244,230,0.18)" }}>
        <div style={{ width: `${avance * 100}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${C.naranja}, ${C.coral})` }} />
      </div>
      <div style={{ position: "absolute", left: 80, top: 288, fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.crema, opacity: 0.6 }}>
        @julio.chaidez1 · tips de viaje
      </div>
    </>
  );
};

const Avion: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path
      fill={color}
      d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
    />
  </svg>
);

const Bloque: React.FC<{ n: number | null; titulo: string; texto: string | null; resaltar: string[] | null; tTitulo: number; tTexto: number }> = ({
  n,
  titulo,
  texto,
  resaltar,
  tTitulo,
  tTexto,
}) => {
  const insignia = useEntrada(0, 10);
  return (
    <div style={{ position: "absolute", left: 80, right: 80, top: ZONA_TEXTO + 40, display: "flex", flexDirection: "column", gap: 28 }}>
      {n !== null ? (
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 56,
            color: C.noche,
            transform: `scale(${insignia})`,
          }}
        >
          {n}
        </div>
      ) : null}
      <Palabras texto={titulo} tam={78} fuente={SERIF} peso={800} retraso={tTitulo} resaltar={resaltar} color={C.crema} />
      {texto ? <Palabras texto={texto} tam={42} fuente={SANS} peso={500} retraso={tTexto} resaltar={null} color="rgba(255,244,230,0.85)" /> : null}
    </div>
  );
};

const Visual: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const s = useEntrada(8);
  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        right: 80,
        top: ZONA_VISUAL,
        height: 500,
        borderRadius: 40,
        background: C.tarjeta,
        border: "2px solid rgba(255,244,230,0.12)",
        overflow: "hidden",
        opacity: s,
        transform: `translateY(${(1 - s) * 60}px)`,
      }}
    >
      {children}
    </div>
  );
};

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

const CORTE = 6;

const Escena: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  // Corte seco con un pequeño empuje al entrar y al salir.
  const entra = interpolate(frame, [0, CORTE], [1.04, 1], { extrapolateRight: "clamp" });
  const sale = interpolate(frame, [dur - CORTE, dur], [1, 0], { extrapolateLeft: "clamp" });
  return <AbsoluteFill style={{ transform: `scale(${entra})`, opacity: sale }}>{children}</AbsoluteFill>;
};

export const VuelosBaratos: React.FC = () => {
  const piezas = [Gancho, Calendario, Alerta, Aeropuertos, Tarifa, Cierre];
  return (
    <AbsoluteFill>
      <Fondo />
      <Audio src={staticFile("voz-vuelos.mp3")} />
      {piezas.map((Pieza, i) => {
        const e = ESCENAS[i];
        const ultima = i === piezas.length - 1;
        return (
          <Sequence key={i} from={e.desde} durationInFrames={e.dur}>
            <Escena dur={ultima ? e.dur + CORTE : e.dur}>
              <Pieza />
            </Escena>
          </Sequence>
        );
      })}
      <Encabezado />
    </AbsoluteFill>
  );
};
