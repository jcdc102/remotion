import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Bloque, C, Reel, SANS, SERIF, useEntrada, Visual, ZONA_VISUAL } from "./comun";

// 🎓 Turismo explicado #2. Datos: Huízar Sánchez, López Ramos y Baños Francia (2020), PASOS 18(5), pp. 839-840.
// Escenas alineadas con las pausas de public/voz-turistificacion.mp3 (44,4 s).
export const DURACION_TURISTIFICACION = 1350;

const FUENTE = "Fuente: Huízar Sánchez, López Ramos y Baños Francia (2020), revista PASOS · datos del estudio";

const SONIDOS: [number, string, number][] = [
  [0, "whoosh", 0.4],
  [90, "pop", 0.45], // 33 restaurantes
  [152, "pop", 0.45], // 24 bares
  [212, "golpe", 0.55], // 1 tortillería
  [262, "whoosh", 0.4], // escena 2
  [310, "pop", 0.4],
  [367, "whoosh", 0.3], // casa → maleta
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

const Fuente: React.FC = () => (
  <div style={{ position: "absolute", left: 30, right: 30, bottom: 18, textAlign: "center", fontFamily: SANS, fontWeight: 500, fontSize: 21, color: "rgba(255,244,230,0.55)" }}>
    {FUENTE}
  </div>
);

const Contador: React.FC<{ hasta: number; desde: number; dur: number; tam: number; color: string }> = ({ hasta, desde, dur, tam, color }) => {
  const frame = useCurrentFrame();
  const v = Math.round(interpolate(frame, [desde, desde + dur], [0, hasta], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  return <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: tam, color, fontVariantNumeric: "tabular-nums" }}>{v}</span>;
};

// 1. Gancho: 33 restaurantes, 24 bares… y 1 tortillería.
const Gancho: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const filas: [string, number, number][] = [
    ["Restaurantes", 33, 90],
    ["Bares", 24, 152],
    ["Tortillería", 1, 212],
  ];
  return (
    <>
      <Bloque n={null} titulo="En 19 manzanas de la Zona Romántica hay…" texto={null} resaltar={["Zona", "Romántica"]} tTitulo={2} tTexto={0} />
      <Visual>
        <div style={{ position: "absolute", left: 70, right: 70, top: 34, display: "flex", flexDirection: "column", gap: 16 }}>
          {filas.map(([nombre, n, t], i) => {
            const s = spring({ frame: frame - t, fps, config: { damping: 11 } });
            const ultima = i === 2;
            const latido = ultima ? 1 + Math.max(0, Math.sin((frame - t) / 5)) * 0.06 * (frame > t ? 1 : 0) : 1;
            return (
              <div
                key={nombre}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 34px",
                  borderRadius: 28,
                  background: ultima ? `linear-gradient(90deg, ${C.naranja}, ${C.coral})` : "rgba(255,244,230,0.1)",
                  opacity: s,
                  transform: `translateX(${(1 - s) * -80}px) scale(${latido})`,
                }}
              >
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 44, color: ultima ? C.noche : C.crema }}>{nombre}</span>
                {ultima ? (
                  <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 68, color: C.noche }}>1</span>
                ) : (
                  <Contador hasta={n} desde={t} dur={20} tam={68} color={C.naranja} />
                )}
              </div>
            );
          })}
        </div>
        <Fuente />
      </Visual>
    </>
  );
};

const Casa: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path fill={color} d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3z" />
  </svg>
);
const Maleta: React.FC<{ tam: number; color: string }> = ({ tam, color }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24">
    <path fill={color} d="M9 3h6a1 1 0 0 1 1 1v2h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3V4a1 1 0 0 1 1-1zm1 3h4V5h-4z" />
  </svg>
);

// 2. Concepto: la casa se convierte en maleta.
const Concepto: React.FC = () => {
  const frame = useCurrentFrame();
  const cambio = interpolate(frame, [100, 118], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const etiqueta = cambio < 0.5 ? "para quien vive ahí" : "para el turista";
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
      <Visual>
        <div style={{ position: "absolute", left: 0, right: 0, top: 70, height: 260 }}>
          <div style={{ position: "absolute", left: 460 - 130, top: 0, opacity: 1 - cambio, transform: `scale(${1 - cambio * 0.3})` }}>
            <Casa tam={260} color={C.crema} />
          </div>
          <div style={{ position: "absolute", left: 460 - 130, top: 0, opacity: cambio, transform: `scale(${0.7 + cambio * 0.3}) rotate(${(1 - cambio) * -20}deg)` }}>
            <Maleta tam={260} color={C.naranja} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 40, color: cambio < 0.5 ? C.crema : C.naranja }}>
          {etiqueta}
        </div>
      </Visual>
    </>
  );
};

// 3. El estudio: 305 negocios, ~70% para el turista.
const Estudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pinta = spring({ frame: frame - 164, fps, config: { damping: 20 } });
  const columnas = 31;
  const turisticos = Math.round(305 * 0.7);
  return (
    <>
      <Bloque n={null} titulo="Investigadores de la UdeG contaron 305 negocios" texto={null} resaltar={["305"]} tTitulo={6} tTexto={0} />
      <Visual>
        <div style={{ position: "absolute", left: 61, top: 34, display: "grid", gridTemplateColumns: `repeat(${columnas}, 18px)`, gap: 8 }}>
          {Array.from({ length: 305 }).map((_, i) => {
            const aparece = interpolate(frame, [6 + i * 0.3, 12 + i * 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const turistico = i < turisticos;
            const color = turistico ? C.coral : C.crema;
            return (
              <div
                key={i}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: color,
                  opacity: aparece * (turistico ? 0.35 + pinta * 0.65 : 0.35),
                  transform: `scale(${aparece})`,
                }}
              />
            );
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 310, textAlign: "center", opacity: pinta, transform: `scale(${0.8 + pinta * 0.2})` }}>
          <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 64, color: C.coral }}>≈70% </span>
          <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, color: C.crema }}>dirigido al turista</span>
        </div>
        <Fuente />
      </Visual>
    </>
  );
};

// 4. El contraste: lo que queda para los vecinos.
const Contraste: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const filas: [string, number, number][] = [
    ["Carnicería", 1, 49],
    ["Tortillería", 1, 79],
    ["Ferretería", 1, 112],
    ["Tiendas de abarrotes", 2, 156],
  ];
  return (
    <>
      <Bloque n={null} titulo="¿Y para los vecinos?" texto={null} resaltar={["vecinos"]} tTitulo={6} tTexto={0} />
      <Visual>
        <div style={{ position: "absolute", left: 70, right: 70, top: 40, display: "flex", flexDirection: "column", gap: 18 }}>
          {filas.map(([nombre, n, t]) => {
            const s = spring({ frame: frame - t, fps, config: { damping: 10 } });
            return (
              <div
                key={nombre}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  opacity: s,
                  transform: `scale(${0.6 + s * 0.4})`,
                  transformOrigin: "left center",
                }}
              >
                <span
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    background: C.verde,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: SERIF,
                    fontWeight: 800,
                    fontSize: 40,
                    color: C.noche,
                  }}
                >
                  {n}
                </span>
                <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 42, color: C.crema }}>{nombre}</span>
              </div>
            );
          })}
        </div>
        <Fuente />
      </Visual>
    </>
  );
};

// 5. Se extiende: Versalles y El Pitillal (mapa ilustrativo, no a escala).
const SeExtiende: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zonas: [string, number, number, number][] = [
    ["Zona Romántica", 210, 250, -100],
    ["Versalles", 450, 160, 55],
    ["El Pitillal", 700, 95, 85],
  ];
  return (
    <>
      <Bloque n={null} titulo="Primeros signos en Versalles y El Pitillal" texto={null} resaltar={["Versalles", "Pitillal"]} tTitulo={4} tTexto={0} />
      <Visual>
        {zonas.map(([nombre, x, y, t]) => {
          const s = spring({ frame: frame - t, fps, config: { damping: 9 } });
          const llena = t < 0 ? 1 : s;
          return (
            <div key={nombre} style={{ position: "absolute", left: x - 70, top: y - 70, width: 140, textAlign: "center" }}>
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  border: `4px solid ${C.coral}`,
                  background: `rgba(255,107,91,${0.15 + llena * (t < 0 ? 0.75 : 0.4)})`,
                  transform: `scale(${t < 0 ? 1 : 0.6 + s * 0.4})`,
                  boxShadow: `0 0 ${llena * 40}px ${C.coral}66`,
                }}
              />
              <div style={{ marginTop: 8, fontFamily: SANS, fontWeight: 600, fontSize: 30, color: C.crema, whiteSpace: "nowrap", marginLeft: -40, marginRight: -40 }}>
                {nombre}
              </div>
            </div>
          );
        })}
        <Fuente />
      </Visual>
    </>
  );
};

// 6. Mirada profesional: la balanza se equilibra.
const Mirada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const equilibrio = spring({ frame: frame - 64, fps, config: { damping: 8, mass: 0.8 } });
  const angulo = -14 * (1 - equilibrio);
  const Plato: React.FC<{ texto: string; lado: number }> = ({ texto, lado }) => (
    <div style={{ position: "absolute", left: 460 + lado * 250 - 120, top: 210 + lado * Math.sin((angulo * Math.PI) / 180) * 250, width: 240, textAlign: "center" }}>
      <div style={{ height: 14, borderRadius: 7, background: C.crema }} />
      <div style={{ marginTop: 14, fontFamily: SANS, fontWeight: 600, fontSize: 36, color: lado < 0 ? C.naranja : C.verde }}>{texto}</div>
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
      <Visual>
        <div style={{ position: "absolute", left: 460 - 8, top: 200, width: 16, height: 220, borderRadius: 8, background: "rgba(255,244,230,0.6)" }} />
        <div style={{ position: "absolute", left: 460 - 260, top: 192, width: 520, height: 12, borderRadius: 6, background: C.crema, transform: `rotate(${angulo}deg)` }} />
        <Plato texto="turistas" lado={-1} />
        <Plato texto="residentes" lado={1} />
      </Visual>
    </>
  );
};

// 7. Cierre: invitación a comentar.
const Cierre: React.FC = () => {
  const frame = useCurrentFrame();
  const globo = useEntrada(8, 7);
  const flota = Math.sin(frame / 8) * 6;
  return (
    <>
      <Bloque n={null} titulo="¿Lo has notado en tu colonia?" texto="Te leo en los comentarios." resaltar={["colonia"]} tTitulo={2} tTexto={45} />
      <div
        style={{
          position: "absolute",
          left: 540 - 130,
          top: ZONA_VISUAL + 40 + flota,
          width: 260,
          height: 200,
          borderRadius: 60,
          background: `linear-gradient(135deg, ${C.naranja}, ${C.coral})`,
          transform: `scale(${globo})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          boxShadow: `0 30px 80px ${C.coral}66`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 30, height: 30, borderRadius: 15, background: C.crema, opacity: 0.4 + 0.6 * Math.max(0, Math.sin(frame / 6 - i)) }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: ZONA_VISUAL + 290, textAlign: "center", fontFamily: SANS, fontWeight: 600, fontSize: 32, color: C.crema, opacity: 0.8 * globo }}>
        🎓 Turismo explicado #2 · Sígueme para entender el turismo
      </div>
    </>
  );
};

export const Turistificacion: React.FC = () => (
  <Reel
    duracion={DURACION_TURISTIFICACION}
    etiqueta="turismo explicado #2"
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
