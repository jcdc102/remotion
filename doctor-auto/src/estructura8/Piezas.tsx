// Diseño de cada una de las 8 piezas. Los tiempos internos salen de las
// palabras de la voz (datos.ts), no de números escritos a mano.
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import {
  inicioSegundoTramo,
  inicioUltimoTramo,
  momentoDe,
  piezaPorTipo,
  type Pieza,
} from "./datos";
import { Aceite, Bateria, Carton, Cuenta, Lapida, LuzMotor, Triangulo } from "./Iconos";
import { estiloBorde, FUENTE, TextoPantalla } from "./Texto";

const limitar = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const sacudida = (t: number, t0: number, dur: number, amp: number) =>
  t < t0 || t > t0 + dur ? 0 : amp * (1 - (t - t0) / dur) * Math.sin((t - t0) * 70);

const useTiempo = (p: Pieza) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: p.inicio + frame / fps };
};

const resorte = (frame: number, fps: number, desde: number, inicio: number, damping = 12) =>
  spring({ frame: frame - Math.round((desde - inicio) * fps), fps, config: { damping } });

const numeroLapida = (icono: string | undefined) =>
  (piezaPorTipo("introduccion").lapidas ?? []).indexOf(icono ?? "") + 1;

const Icono: React.FC<{ nombre: string; tamano: number; t: number }> = ({ nombre, tamano, t }) => {
  if (nombre === "bateria") return <Bateria tamano={tamano} />;
  if (nombre === "luz-motor") return <LuzMotor tamano={tamano} brillo={0.6 + 0.4 * Math.sin(t * 8)} />;
  return <Aceite tamano={tamano} t={t} />;
};

// Zona del texto principal: 600–930 px (31%–48% de la altura).
const ZonaPantalla: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      position: "absolute",
      left: 70,
      right: 70,
      top: 600,
      height: 330,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </div>
);

// 1 · Gancho: texto grande y amarillo que entra de golpe.
export const Gancho: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const golpe = spring({ frame: frame - 8, fps, config: { damping: 9, mass: 0.6 } });
  const s = sacudida(t, p.inicio + 0.27, 0.45, 18);
  return (
    <AbsoluteFill>
      <ZonaPantalla style={{ transform: `translate(${s}px, ${s * 0.6}px) scale(${2.2 - 1.2 * golpe})`, opacity: golpe }}>
        <TextoPantalla texto={p.pantalla ?? ""} resaltar={p.resaltar} color="#ffd60a" colorResaltado="#ffd60a" tamano={118} />
      </ZonaPantalla>
    </AbsoluteFill>
  );
};

// 2 · Introducción: tres lápidas numeradas, una por una; la tercera con "???".
export const Introduccion: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const lapidas = p.lapidas ?? [];
  const tUltima = momentoDe(p, p.resaltar[0]);
  return (
    <AbsoluteFill>
      {lapidas.map((nombre, k) => {
        const t0 = p.inicio + 0.15 + k;
        const e = resorte(frame, fps, t0, p.inicio, 11);
        const ultima = k === lapidas.length - 1;
        const destacar = ultima ? resorte(frame, fps, tUltima, p.inicio, 10) : 0;
        const temblor = ultima ? sacudida(t, tUltima, 0.5, 6) : 0;
        return (
          <div
            key={nombre}
            style={{
              position: "absolute",
              left: 540 - 140 + (k - 1) * 320,
              top: 380,
              opacity: t >= t0 ? 1 : 0,
              transform: `translateY(${(1 - e) * -520}px) scale(${1 + 0.14 * destacar}) rotate(${temblor}deg)`,
              transformOrigin: "50% 100%",
            }}
          >
            <Lapida ancho={280} numero={k + 1} grieta={0}>
              {ultima ? (
                <div
                  style={{
                    fontFamily: FUENTE,
                    fontSize: 96,
                    color: "#ff2a2a",
                    opacity: Math.floor(t * 4) % 2 === 0 ? 1 : 0.25,
                    ...estiloBorde(12),
                  }}
                >
                  ???
                </div>
              ) : (
                <Icono nombre={nombre} tamano={150} t={t} />
              )}
            </Lapida>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Aviso: React.FC<{ texto: string; variante: number; t: number; entrada: number }> = ({
  texto,
  variante,
  t,
  entrada,
}) => {
  const base: React.CSSProperties = {
    position: "absolute",
    left: 70,
    right: 70,
    top: 715,
    minHeight: 200,
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "20px 34px",
    boxSizing: "border-box",
    fontFamily: FUENTE,
    fontSize: 66,
    lineHeight: 1.1,
    color: "#fff4e0",
    transform: `scale(${0.6 + 0.4 * entrada}) rotate(${variante === 2 ? -2 : 0}deg)`,
    opacity: entrada,
    boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
  };
  if (variante === 0) {
    return (
      <div style={{ ...base, background: "rgba(20,7,29,0.94)", border: "7px solid #ffd60a", borderRadius: 30 }}>
        <Triangulo tamano={120} />
        <div style={estiloBorde(8)}>{texto}</div>
      </div>
    );
  }
  if (variante === 1) {
    const encendido = Math.floor(t * 5) % 2 === 0;
    return (
      <div
        style={{
          ...base,
          background: encendido ? "#d00000" : "#5c0000",
          border: "7px solid #fff4e0",
          borderRadius: 30,
        }}
      >
        <Triangulo tamano={120} />
        <div style={estiloBorde(8)}>{texto}</div>
      </div>
    );
  }
  // Cartel de madera con clavos.
  return (
    <div
      style={{
        ...base,
        justifyContent: "center",
        textAlign: "center",
        background: "repeating-linear-gradient(0deg, #8b4a22 0 46px, #7a3f1b 46px 50px)",
        border: "9px solid #4a2511",
        borderRadius: 14,
      }}
    >
      {[
        { left: 18, top: 18 },
        { right: 18, top: 18 },
        { left: 18, bottom: 18 },
        { right: 18, bottom: 18 },
      ].map((pos, i) => (
        <div key={i} style={{ position: "absolute", width: 16, height: 16, borderRadius: 8, background: "#c0c0c0", border: "3px solid #333", ...pos }} />
      ))}
      <div style={estiloBorde(8)}>{texto}</div>
    </div>
  );
};

// 3, 5, 7 · Cuerpo: empuje de cámara a la lápida, evento en la palabra clave,
// zoom de corte y aviso cuando empieza la última frase.
export const Cuerpo: React.FC<{ p: Pieza; orden: number }> = ({ p, orden }) => {
  const { frame, fps, t } = useTiempo(p);
  const tSegundo = inicioSegundoTramo(p);
  const tAviso = inicioUltimoTramo(p);
  const tClave = momentoDe(p, p.resaltar[1]);
  const entrada = spring({ frame, fps, config: { damping: 13 } });

  let escala = 1 + 0.08 * interpolate(t, [p.inicio, tAviso], [0, 1], limitar);
  let giro = 0;
  if (t >= tSegundo) {
    escala += 0.06;
    giro = -2;
  }
  if (t >= tAviso) {
    escala = 1.38 + 0.03 * (t - tAviso);
    giro = 0;
  }
  const temblor =
    sacudida(t, tClave, 0.4, orden === 0 ? 12 : 6) + (orden === 1 ? sacudida(t, tAviso, 0.6, 26) : 0);

  const apagado = interpolate(t, [tClave, tClave + 0.25], [0, 1], limitar);
  const carton = resorte(frame, fps, tClave, p.inicio, 14);
  const cuenta = resorte(frame, fps, tClave, p.inicio, 13);
  const aviso = resorte(frame, fps, tAviso, p.inicio, 12);

  let icono: React.ReactNode;
  if (p.icono === "bateria") {
    icono = (
      <div style={{ filter: `grayscale(${apagado}) brightness(${1 - 0.5 * apagado})`, transform: `translateY(${apagado * 10}px)` }}>
        <Bateria tamano={250} />
      </div>
    );
  } else if (p.icono === "luz-motor") {
    icono = (
      <div style={{ position: "relative" }}>
        <LuzMotor tamano={250} brillo={0.6 + 0.4 * Math.sin(t * 8)} />
        {t >= tClave ? (
          <div style={{ position: "absolute", left: -15, top: -25, transform: `translateX(${(1 - carton) * -700}px) rotate(${(1 - carton) * -20 - 3}deg)` }}>
            <Carton ancho={280} />
          </div>
        ) : null}
      </div>
    );
  } else {
    icono = <Aceite tamano={250} t={t} />;
  }

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transformOrigin: "540px 620px",
          transform: `translate(${temblor}px, ${temblor * 0.5}px) scale(${escala}) rotate(${giro}deg)`,
        }}
      >
        <div style={{ position: "absolute", left: 330, top: 320, transform: `translateY(${(1 - entrada) * 300}px)`, opacity: entrada }}>
          <Lapida ancho={420} numero={numeroLapida(p.icono)} grieta={p.icono === "aceite" ? 1 : 0}>
            {icono}
          </Lapida>
        </div>
      </AbsoluteFill>
      {p.icono === "aceite" && t >= tClave ? (
        // La calavera entrega la cuenta (sale desde su mano, abajo a la izquierda).
        <div
          style={{
            position: "absolute",
            left: interpolate(cuenta, [0, 1], [180, 690]),
            top: interpolate(cuenta, [0, 1], [1220, 400]),
            transform: `rotate(${interpolate(cuenta, [0, 1], [-30, 8])}deg) scale(${0.4 + 0.6 * cuenta})`,
            filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.6))",
          }}
        >
          <Cuenta ancho={250} />
        </div>
      ) : null}
      {t >= tAviso && p.aviso ? <Aviso texto={p.aviso} variante={orden} t={t} entrada={aviso} /> : null}
    </AbsoluteFill>
  );
};

// 4 y 6 · Bucle: texto "pantalla" pulsante. En el segundo, la lápida 3 se agrieta.
export const Bucle: React.FC<{ p: Pieza; orden: number }> = ({ p, orden }) => {
  const { frame, fps, t } = useTiempo(p);
  const entrada = spring({ frame, fps, config: { damping: 10 } });
  const pulso = 1 + 0.06 * Math.sin((t - p.inicio) * Math.PI * 2 * 1.6);
  const grieta = interpolate(t, [p.inicio + 0.3, p.fin - 0.2], [0, 1], limitar);
  const ultima = piezaPorTipo("cuerpo", 2);
  return (
    <AbsoluteFill>
      {orden === 1 ? (
        <div
          style={{
            position: "absolute",
            left: 430,
            top: 300,
            transform: `rotate(${sacudida(t, p.inicio + 0.3 + (p.fin - p.inicio) * 0.5, 0.4, 3)}deg) scale(${entrada})`,
          }}
        >
          <Lapida ancho={220} numero={numeroLapida(ultima.icono)} grieta={grieta}>
            <Aceite tamano={110} t={t} />
          </Lapida>
        </div>
      ) : null}
      <ZonaPantalla style={{ transform: `scale(${entrada * pulso})` }}>
        <TextoPantalla texto={p.pantalla ?? ""} resaltar={p.resaltar} color="#ffffff" colorResaltado="#ffd60a" tamano={112} />
      </ZonaPantalla>
    </AbsoluteFill>
  );
};

// 8 · Llamado a la acción: globo de comentario con el texto "boton".
export const Llamado: React.FC<{ p: Pieza }> = ({ p }) => {
  const { frame, fps, t } = useTiempo(p);
  const globo = resorte(frame, fps, p.inicio + 0.15, p.inicio, 9);
  const meneo = sacudida(t, inicioUltimoTramo(p), 0.7, 5);
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 300,
          width: 700,
          top: 610,
          transform: `scale(${globo}) rotate(${meneo}deg)`,
          transformOrigin: "10% 0%",
        }}
      >
        <svg width={120} height={80} style={{ position: "absolute", left: 30, top: -62 }}>
          <path d="M10 0 L90 74 L40 74 Z" fill="#fff4e0" stroke="#000" strokeWidth={8} strokeLinejoin="round" />
        </svg>
        <div
          style={{
            background: "#fff4e0",
            border: "8px solid #000",
            borderRadius: 50,
            padding: "36px 40px",
            fontFamily: FUENTE,
            fontSize: 70,
            lineHeight: 1.1,
            color: "#14071d",
            textAlign: "center",
            boxShadow: "0 24px 50px rgba(0,0,0,0.55)",
          }}
        >
          {p.boton}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Tarjeta final de 2 s con el logo adjunto.
export const TarjetaLogo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame, fps, config: { damping: 11 } });
  return (
    <AbsoluteFill style={{ background: `rgba(10,3,18,${0.97 * Math.min(1, frame / 6)})` }}>
      <Img
        src={staticFile("estructura8/logo.jpg")}
        style={{
          position: "absolute",
          left: 240,
          top: 564,
          width: 600,
          height: 600,
          borderRadius: 40,
          border: "8px solid #fff4e0",
          transform: `scale(${e})`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      />
    </AbsoluteFill>
  );
};
