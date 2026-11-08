import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { TROZOS } from "./radar-palabras";

// Promo de «Radar Empresarial» (Radio UdeG Puerto Vallarta, 104.3 FM), lunes 9 nov 2026, 17:00.
// Tema: del marketing de masas al marketing de nichos. Voz: clon «Julio» (public/voz-radar.mp3, 50.3 s).
// Paleta A «Azul Radar». Subtítulos sincronizados por palabra (Whisper). Datos y fuentes en fuentes.md.
export const DURACION_RADAR = 1512;

const { fontFamily: POP } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });
const K = { marino: "#0F1E3D", hondo: "#081226", azul: "#3B5A99", gris: "#9AA3AE", blanco: "#FFFFFF", ambar: "#F2B134" };
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const suave = Easing.bezier(0.65, 0, 0.35, 1);
const m = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: suave });
const sale = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.6)) });

// Escenas [desde, hasta] en fotogramas, alineadas con la voz.
const E = { gancho: [0, 111], mensajes: [111, 250], ignoras: [250, 294], micro: [294, 414], linea: [414, 630], personal: [630, 822], nicho: [822, 950], vallarta: [950, 1078], fenty: [1078, 1168], cierre: [1168, DURACION_RADAR] } as const;

const SONIDOS: [number, string, number][] = [
  [0, "golpe", 0.3], [22, "whoosh", 0.25], [98, "whoosh", 0.35],
  [118, "notificacion", 0.22], [150, "notificacion", 0.22], [185, "notificacion", 0.22], [228, "tachar", 0.2],
  [250, "whoosh", 0.3], [258, "pop", 0.3], [294, "whoosh", 0.3], [333, "pop", 0.35], [366, "ding", 0.25],
  [414, "whoosh", 0.3], [537, "pop", 0.35], [581, "pop", 0.35], [630, "whoosh", 0.3], [715, "pop", 0.35], [748, "ding", 0.25],
  [822, "whoosh", 0.3], [847, "brillo", 0.35], [950, "whoosh", 0.3], [993, "pop", 0.35], [1046, "pop", 0.35],
  [1078, "whoosh", 0.3], [1120, "brillo", 0.35], [1168, "whoosh", 0.3], [1204, "pop", 0.35], [1251, "pop", 0.35],
  [1320, "golpe", 0.3], [1366, "brillo", 0.35], [1424, "notificacion", 0.3],
];

// ---------- Fondo: azul marino con rejilla de puntos, anillos de radar y barrido ----------
const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #16295A 0%, ${K.marino} 45%, ${K.hondo} 100%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(154,163,174,0.16) 2px, transparent 2.5px)", backgroundSize: "34px 34px", transform: `translateY(${(frame * 0.4) % 34}px)` }} />
      {[0, 1, 2, 3].map((i) => {
        const t = ((frame + i * 45) % 180) / 180;
        return <div key={i} style={{ position: "absolute", left: 540 - 900 * t, top: 760 - 900 * t, width: 1800 * t, height: 1800 * t, borderRadius: "50%", border: `3px solid rgba(59,90,153,${0.5 * (1 - t)})` }} />;
      })}
      <div style={{ position: "absolute", left: 540 - 1100, top: 760 - 1100, width: 2200, height: 2200, borderRadius: "50%", background: "conic-gradient(from 0deg, rgba(242,177,52,0.10), transparent 40deg)", transform: `rotate(${frame * 1.2}deg)`, WebkitMaskImage: "radial-gradient(circle, black 0%, transparent 70%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// Escena con entrada de golpe (zoom + desenfoque) y salida rápida.
const Escena: React.FC<{ r: readonly [number, number]; children: React.ReactNode }> = ({ r: [a, b], children }) => {
  const frame = useCurrentFrame();
  if (frame < a || frame >= b) return null;
  const e = interpolate(frame, [a, a + 8], [1, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const s = b >= DURACION_RADAR ? 0 : interpolate(frame, [b - 5, b], [0, 1], clamp);
  return <AbsoluteFill style={{ transform: `scale(${1 + e * 0.12 - s * 0.04})`, filter: `blur(${e * 12 + s * 8}px)`, opacity: 1 - s }}>{children}</AbsoluteFill>;
};

const Fuente: React.FC<{ texto: string; desde: number; hasta: number }> = ({ texto, desde, hasta }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [desde, desde + 10, hasta - 6, hasta], [0, 1, 1, 0], clamp);
  return <div style={{ position: "absolute", left: 70, right: 70, top: 1140, textAlign: "center", fontFamily: POP, fontWeight: 500, fontSize: 24, color: K.gris, opacity: o }}>{texto}</div>;
};

const Chip: React.FC<{ texto: string; desde: number; color: string; fondo: string; tam: number }> = ({ texto, desde, color, fondo, tam }) => {
  const frame = useCurrentFrame();
  const e = sale(frame, desde, desde + 12);
  return <div style={{ display: "inline-block", padding: `${tam * 0.3}px ${tam * 0.7}px`, borderRadius: tam * 2, background: fondo, color, fontFamily: POP, fontWeight: 700, fontSize: tam, opacity: Math.min(1, e * 1.5), transform: `scale(${e})` }}>{texto}</div>;
};

// ---------- Subtítulos grandes, palabra por palabra ----------
const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < E.gancho[1]) return null; // en el gancho, el texto grande es el subtítulo
  const i = TROZOS.findIndex((t, k) => t[0].f <= frame && (k === TROZOS.length - 1 || TROZOS[k + 1][0].f > frame));
  if (i < 0) return null;
  const t = TROZOS[i];
  const fin = i === TROZOS.length - 1 ? t[t.length - 1].f + 45 : Infinity;
  if (frame > fin) return null;
  const e = sale(frame, t[0].f, t[0].f + 7);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1190, height: 230, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 18px", padding: "16px 30px", borderRadius: 28, background: "rgba(8,18,38,0.72)", transform: `scale(${0.85 + e * 0.15})`, opacity: Math.min(1, e * 2) }}>
        {t.map((p, k) => {
          const dicha = frame >= p.f;
          const activa = dicha && (k === t.length - 1 || frame < t[k + 1].f);
          return (
            <span key={k} style={{ fontFamily: POP, fontWeight: 800, fontSize: 66, lineHeight: 1.18, color: activa ? K.ambar : K.blanco, opacity: dicha ? 1 : 0.35, transform: `scale(${activa ? 1.06 : 1})`, display: "inline-block", textShadow: "0 4px 18px rgba(0,0,0,0.5)" }}>
              {p.w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- Logo de la radio: grande al inicio, luego insignia arriba ----------
const LogoRadio: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame >= E.cierre[0]) return null;
  const t = m(frame, 18, 36);
  const w = 420 + (96 - 420) * t;
  const x = 330 + (70 - 330) * t;
  const y = 300 + (300 - 300) * t;
  const entra = sale(frame, 0, 12);
  return (
    <>
      <div style={{ position: "absolute", left: x, top: y, width: w, height: w * (1168 / 1320), borderRadius: 20 + t * -6, overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", transform: `scale(${entra})` }}>
        <Img src={staticFile("radar/logo-radio-udg.jpg")} style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", left: 186, top: 304, opacity: m(frame, 30, 44), fontFamily: POP }}>
        <div style={{ fontWeight: 700, fontSize: 30, color: K.blanco }}>Radar Empresarial</div>
        <div style={{ fontWeight: 500, fontSize: 23, color: K.gris }}>104.3 FM · lun 9 nov · 5:00 pm</div>
      </div>
    </>
  );
};

// ---------- Barra del invitado ----------
const Invitado: React.FC = () => {
  const frame = useCurrentFrame();
  const e = m(frame, 254, 268);
  const s = m(frame, 336, 348);
  if (frame < 254 || frame > 348) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 975, height: 140, borderRadius: 22, background: K.blanco, overflow: "hidden", transform: `translateX(${(1 - e) * -1100 + s * 1100}px)`, boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 16, background: K.ambar }} />
      <div style={{ position: "absolute", left: 44, top: 18, fontFamily: POP }}>
        <div style={{ fontWeight: 700, fontSize: 22, letterSpacing: 5, color: K.azul }}>INVITADO</div>
        <div style={{ fontWeight: 800, fontSize: 42, color: K.marino, lineHeight: 1.15 }}>Julio César Díaz Chaidez</div>
        <div style={{ fontWeight: 500, fontSize: 22, color: "#4A5568" }}>Estudiante de Turismo, CUCosta UdeG · Estratega de contenido</div>
      </div>
    </div>
  );
};

export const RadarPromo: React.FC = () => {
  const frame = useCurrentFrame();

  // Gancho: palabras sincronizadas con la voz.
  const gancho = TROZOS.slice(0, 3).flat();
  const rompe = m(frame, 96, 110);

  // Mensajes iguales.
  const MSJ = ["¡OFERTA!", "Compra ya", "2x1 hoy", "Para todos", "¡Último día!", "Promo", "No te lo pierdas", "Descuento", "Para todos", "¡Aprovecha!", "Envío gratis", "Nuevo"];

  return (
    <AbsoluteFill style={{ background: K.hondo }}>
      <Fondo />
      <Audio src={staticFile("voz-radar.mp3")} />
      <Audio src={staticFile("musica-radar.mp3")} volume={(f) => 0.12 * interpolate(f, [0, 15, DURACION_RADAR - 45, DURACION_RADAR], [0, 1, 1, 0], clamp)} />
      {SONIDOS.map(([d, a, v], i) => (
        <Sequence key={i} from={d} durationInFrames={45}>
          <Audio src={staticFile(`sfx/${a}.wav`)} volume={v} />
        </Sequence>
      ))}

      {/* 1. Gancho */}
      <Escena r={E.gancho}>
        <div style={{ position: "absolute", left: 70, right: 70, top: 700, display: "flex", flexWrap: "wrap", gap: "0 24px" }}>
          {gancho.map((p, k) => {
            const e = sale(frame, p.f, p.f + 8);
            const clave = p.w === "todos";
            return (
              <span key={k} style={{ display: "inline-block", fontFamily: POP, fontWeight: 800, fontSize: clave ? 128 : 92, lineHeight: 1.12, color: clave ? K.ambar : K.blanco, opacity: Math.min(1, e * 2), transform: `translateY(${(1 - e) * 40}px) scale(${clave ? 1 + rompe * 0.25 : 1})`, filter: clave ? `blur(${rompe * 6}px)` : "none", textShadow: "0 6px 30px rgba(0,0,0,0.5)" }}>
                {clave
                  ? "TODOS".split("").map((l, j) => (
                      <span key={j} style={{ display: "inline-block", transform: `translate(${(j - 2) * rompe * 90}px, ${Math.sin(j * 2.1) * rompe * 160}px) rotate(${(j - 2) * rompe * 30}deg)`, opacity: 1 - rompe * 0.7 }}>{l}</span>
                    ))
                  : p.w}
              </span>
            );
          })}
        </div>
      </Escena>

      {/* 2. Un montón de mensajes, todos iguales */}
      <Escena r={E.mensajes}>
        {MSJ.map((t, i) => {
          const d = 118 + i * 9;
          const e = sale(frame, d, d + 10);
          const igual = m(frame, 226 + i, 236 + i);
          return (
            <div key={i} style={{ position: "absolute", left: (i % 2 === 0 ? 70 : 560) + ((i * 37) % 60) - 30, top: 430 + Math.floor(i / 2) * 98 + (i % 2) * 40, width: 420, padding: "18px 22px", borderRadius: 22, background: igual > 0.5 ? "#4A5263" : K.blanco, display: "flex", gap: 16, alignItems: "center", opacity: Math.min(1, e * 2), transform: `scale(${e}) rotate(${((i % 5) - 2) * 3}deg)`, boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: igual > 0.5 ? "#6B7383" : [K.ambar, K.azul, "#E4572E", "#2BA84A"][i % 4], flexShrink: 0 }} />
              <div style={{ fontFamily: POP, fontWeight: 700, fontSize: 30, color: igual > 0.5 ? "#C7CCD4" : K.marino }}>{igual > 0.5 ? "Para todos" : t}</div>
            </div>
          );
        })}
      </Escena>

      {/* 3. Por eso los ignoras */}
      <Escena r={E.ignoras}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontSize: 260, transform: `scale(${sale(frame, 252, 266)})` }}>🔕</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontFamily: POP, fontWeight: 800, fontSize: 70, color: K.blanco, opacity: m(frame, 255, 265) }}>Deslizar. Ignorar.</div>
      </Escena>

      {/* 4. 95 de cada 100 negocios son micro */}
      <Escena r={E.micro}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontFamily: POP, fontWeight: 700, fontSize: 34, letterSpacing: 4, color: K.gris, opacity: m(frame, 300, 312) }}>NEGOCIOS EN MÉXICO</div>
        {Array.from({ length: 100 }).map((_, i) => {
          const luz = i < 95 ? m(frame, 333 + i * 0.3, 341 + i * 0.3) : 0;
          return <div key={i} style={{ position: "absolute", left: 245 + (i % 10) * 60, top: 480 + Math.floor(i / 10) * 50, width: 50, height: 40, borderRadius: 8, background: luz > 0.5 ? K.ambar : "rgba(154,163,174,0.25)", transform: `scale(${0.8 + luz * 0.2})`, boxShadow: luz > 0.5 ? "0 0 18px rgba(242,177,52,0.5)" : "none" }} />;
        })}
        <div style={{ position: "absolute", left: 0, right: 0, top: 985, textAlign: "center", opacity: m(frame, 362, 374), fontFamily: POP }}>
          <span style={{ fontWeight: 800, fontSize: 96, color: K.ambar }}>{interpolate(frame, [362, 384], [0, 95.4], clamp).toFixed(1)}%</span>
          <span style={{ fontWeight: 600, fontSize: 32, color: K.blanco, marginLeft: 16 }}>son micro</span>
        </div>
        <Fuente texto="Fuente: INEGI, Censos Económicos 2024 (resultados definitivos)" desde={333} hasta={414} />
      </Escena>

      {/* 5. PyMEs que venden en línea */}
      <Escena r={E.linea}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 430, display: "flex", justifyContent: "center" }}>
          <Chip texto="🛒 PyMEs que venden en línea" desde={484} color={K.marino} fondo={K.ambar} tam={38} />
        </div>
        {[
          { año: "2018", v: 18.7, d: 422, b: 537, x: 250 },
          { año: "2023", v: 28.8, d: 448, b: 581, x: 590 },
        ].map((z) => {
          const h = interpolate(frame, [z.b, z.b + 18], [0, z.v * 13], { ...clamp, easing: Easing.out(Easing.cubic) });
          return (
            <div key={z.año}>
              <div style={{ position: "absolute", left: z.x, top: 1020 - h, width: 240, height: h, borderRadius: "18px 18px 0 0", background: z.año === "2023" ? `linear-gradient(180deg, ${K.ambar}, #C98A1A)` : `linear-gradient(180deg, #6F8FD1, ${K.azul})` }} />
              <div style={{ position: "absolute", left: z.x, width: 240, top: 1020 - h - 90, textAlign: "center", fontFamily: POP, fontWeight: 800, fontSize: 64, color: K.blanco, opacity: m(frame, z.b, z.b + 8) }}>{interpolate(frame, [z.b, z.b + 18], [0, z.v], clamp).toFixed(1)}%</div>
              <div style={{ position: "absolute", left: z.x, width: 240, top: 1035, textAlign: "center", fontFamily: POP, fontWeight: 700, fontSize: 40, color: K.gris, opacity: m(frame, z.d, z.d + 10) }}>{z.año}</div>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 120, right: 120, top: 1020, height: 4, background: "rgba(154,163,174,0.5)", opacity: m(frame, 418, 430) }} />
        <Fuente texto="Fuente: INEGI, Censos Económicos 2024 (resultados oportunos)" desde={537} hasta={630} />
      </Escena>

      {/* 6. 71% espera personalización */}
      <Escena r={E.personal}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, display: "flex", justifyContent: "center" }}>
          <Chip texto="McKinsey · 2021" desde={684} color={K.blanco} fondo={K.azul} tam={36} />
        </div>
        <svg style={{ position: "absolute", left: 290, top: 510 }} width={500} height={500} viewBox="0 0 500 500">
          <circle cx={250} cy={250} r={200} fill="none" stroke="rgba(154,163,174,0.25)" strokeWidth={46} />
          <circle cx={250} cy={250} r={200} fill="none" stroke={K.ambar} strokeWidth={46} strokeLinecap="round" strokeDasharray={2 * Math.PI * 200} strokeDashoffset={2 * Math.PI * 200 * (1 - 0.71 * m(frame, 715, 745))} transform="rotate(-90 250 250)" />
        </svg>
        <div style={{ position: "absolute", left: 290, top: 510, width: 500, height: 500, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: POP }}>
          <div style={{ fontWeight: 800, fontSize: 120, color: K.blanco, lineHeight: 1 }}>{Math.round(interpolate(frame, [715, 745], [0, 71], clamp))}%</div>
          
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", fontFamily: POP, fontWeight: 600, fontSize: 32, color: K.blanco, lineHeight: 1.35 }}>
          <div style={{ opacity: m(frame, 766, 778) }}>espera un trato personalizado</div>
          <div style={{ opacity: m(frame, 784, 796), fontSize: 28, color: K.gris }}>
          y el <span style={{ color: K.ambar, fontWeight: 800 }}>76%</span> se frustra si no la recibe</div>
        </div>
        <Fuente texto="Fuente: McKinsey, Next in Personalization 2021 (encuesta en EE. UU.)" desde={690} hasta={822} />
      </Escena>

      {/* 7. De las masas al nicho */}
      <Escena r={E.nicho}>
        {(() => {
          const enfoca = m(frame, 847, 875);
          const cx = 540;
          const cy = 720;
          const NICHO = [3, 17, 28, 41, 52, 66, 77, 88, 99];
          return (
            <>
              <div style={{ position: "absolute", left: cx - (330 - 210 * enfoca) - 30, top: cy - (330 - 210 * enfoca) - 30 + enfoca * 0, width: (330 - 210 * enfoca) * 2 + 60, height: (330 - 210 * enfoca) * 2 + 60, borderRadius: "50%", border: `5px dashed ${enfoca > 0.5 ? K.ambar : K.gris}`, transform: `translate(${enfoca * 0}px, 0)` }} />
              {Array.from({ length: 120 }).map((_, i) => {
                const a = i * 2.39996;
                const r = 300 * Math.sqrt((i + 0.5) / 120);
                const x0 = cx + r * Math.cos(a);
                const y0 = cy + r * Math.sin(a);
                const enNicho = NICHO.includes(i);
                const k = NICHO.indexOf(i);
                const x1 = cx + (k % 3 - 1) * 64;
                const y1 = cy + (Math.floor(k / 3) - 1) * 64;
                const x = enNicho ? x0 + (x1 - x0) * enfoca : x0;
                const y = enNicho ? y0 + (y1 - y0) * enfoca : y0;
                const aparece = sale(frame, 824 + (i % 30) * 0.5, 834 + (i % 30) * 0.5);
                return <div key={i} style={{ position: "absolute", left: x - 16, top: y - 16, width: 32, height: 32, borderRadius: 16, background: enNicho && enfoca > 0.3 ? K.ambar : K.gris, opacity: enNicho ? 1 : 1 - enfoca * 0.8, transform: `scale(${aparece * (enNicho ? 1 + enfoca * 0.4 : 1)})`, boxShadow: enNicho && enfoca > 0.3 ? "0 0 22px rgba(242,177,52,0.8)" : "none" }} />;
              })}
              <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center", fontFamily: POP, fontWeight: 800, fontSize: 64, color: enfoca > 0.5 ? K.ambar : K.blanco }}>{enfoca > 0.5 ? "NICHO" : "TODO EL MUNDO"}</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 1060, display: "flex", justifyContent: "center", gap: 18 }}>
                <Chip texto="Grupo pequeño" desde={868} color={K.marino} fondo={K.blanco} tam={32} />
                <Chip texto="+ necesidad clara" desde={911} color={K.marino} fondo={K.ambar} tam={32} />
              </div>
            </>
          );
        })()}
      </Escena>

      {/* 8. Nichos en Puerto Vallarta */}
      <Escena r={E.vallarta}>
        <svg style={{ position: "absolute", left: 0, top: 380 }} width={1080} height={700} viewBox="0 0 1080 700">
          <defs>
            <linearGradient id="mar" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#1E3B78" />
              <stop offset="1" stopColor="#2F5AA8" />
            </linearGradient>
          </defs>
          <rect width={1080} height={700} rx={40} fill="url(#mar)" opacity={0.55} />
          <path d="M 1080 0 L 1080 700 L 120 700 Q 260 610 520 590 Q 800 560 880 400 Q 930 280 760 170 Q 560 60 180 70 L 120 0 Z" fill="#20314F" stroke={K.gris} strokeWidth={3} strokeDasharray={2400} strokeDashoffset={2400 * (1 - m(frame, 952, 985))} />
          {Array.from({ length: 6 }).map((_, i) => (
            <path key={i} d={`M ${120 + i * 70} ${300 + i * 40} q 20 -10 40 0 t 40 0`} stroke="rgba(255,255,255,0.35)" strokeWidth={3} fill="none" transform={`translate(${Math.sin(frame / 15 + i) * 10} 0)`} />
          ))}
        </svg>
        <div style={{ position: "absolute", left: 120, top: 560, fontFamily: POP, fontWeight: 600, fontSize: 28, letterSpacing: 4, color: "rgba(255,255,255,0.75)", opacity: m(frame, 960, 975) }}>BAHÍA DE BANDERAS</div>
        <div style={{ position: "absolute", left: 790, top: 650, fontFamily: POP, fontWeight: 700, fontSize: 28, color: K.blanco, opacity: m(frame, 970, 985) }}>📍 Puerto Vallarta</div>
        <div style={{ position: "absolute", left: 600, top: 420, transform: `scale(${sale(frame, 993, 1005)})` }}>
          <div style={{ padding: "16px 24px", borderRadius: 24, background: K.blanco, fontFamily: POP, fontWeight: 700, fontSize: 34, color: K.marino, boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>💍 Bodas de destino</div>
        </div>
        <div style={{ position: "absolute", left: 160 + Math.sin(frame / 20) * 15, top: 690, fontSize: 130, transform: `scale(${sale(frame, 1046, 1058)})` }}>🐋</div>
        <div style={{ position: "absolute", left: 80, top: 860, transform: `scale(${sale(frame, 1048, 1060)})` }}>
          <div style={{ padding: "16px 24px", borderRadius: 24, background: K.ambar, fontFamily: POP, fontWeight: 700, fontSize: 34, color: K.marino, boxShadow: "0 16px 40px rgba(0,0,0,0.4)" }}>Avistamiento de ballenas</div>
        </div>
      </Escena>

      {/* 9. Fenty Beauty: 40 tonos */}
      <Escena r={E.fenty}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontFamily: POP, fontWeight: 800, fontSize: 72, color: K.blanco }}>Fenty Beauty</div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 515, textAlign: "center", fontFamily: POP, fontWeight: 700, fontSize: 44, color: K.ambar, opacity: m(frame, 1118, 1128) }}>40 tonos de base</div>
        {Array.from({ length: 40 }).map((_, i) => {
          const t = i / 39;
          const tonos = ["#F7DCC8", "#E9B994", "#C98B62", "#9A6440", "#6B4026", "#3A2116"];
          const c = tonos[Math.min(4, Math.floor(t * 5))];
          const c2 = tonos[Math.min(5, Math.floor(t * 5) + 1)];
          const mez = t * 5 - Math.floor(t * 5);
          const e = sale(frame, 1120 + i * 0.6, 1130 + i * 0.6);
          const hex = (a: string, b: string, k: number) => {
            const p = (s: string, o: number) => parseInt(s.slice(o, o + 2), 16);
            return `rgb(${[1, 3, 5].map((o) => Math.round(p(a, o) + (p(b, o) - p(a, o)) * k)).join(",")})`;
          };
          return <div key={i} style={{ position: "absolute", left: 170 + (i % 8) * 94, top: 630 + Math.floor(i / 8) * 76, width: 78, height: 60, borderRadius: 12, background: hex(c, c2, mez), transform: `scale(${e}) rotate(${(1 - e) * 40}deg)`, boxShadow: "0 8px 20px rgba(0,0,0,0.35)" }} />;
        })}
        <div style={{ position: "absolute", left: 90, right: 90, top: 1035, textAlign: "center", fontFamily: POP, fontWeight: 600, fontSize: 28, color: K.blanco, opacity: m(frame, 1135, 1145) }}>Según reportes, vendió 100 millones de dólares en sus primeros 40 días</div>
        <Fuente texto="Fuente: reportes citados por The Fashion Law (con datos de Vogue)" desde={1135} hasta={1168} />
      </Escena>

      {/* 10. Cierre */}
      <Escena r={E.cierre}>
        <div style={{ position: "absolute", left: 250, top: 330, width: 580, height: 580 * (731 / 1320), borderRadius: 24, overflow: "hidden", background: K.blanco, boxShadow: "0 20px 60px rgba(0,0,0,0.5)", transform: `scale(${sale(frame, 1170, 1184)})` }}>
          <Img src={staticFile("radar/logo-radar.jpg")} style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ position: "absolute", left: 90, right: 90, top: 680, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, fontFamily: POP }}>
          <div style={{ fontWeight: 800, fontSize: 62, color: K.ambar, opacity: m(frame, 1204, 1214), transform: `translateY(${(1 - m(frame, 1204, 1214)) * 30}px)` }}>Lunes 9 de noviembre</div>
          <div style={{ fontWeight: 700, fontSize: 48, color: K.blanco, opacity: m(frame, 1251, 1261) }}>5:00 a 6:00 pm</div>
        </div>
        <div style={{ position: "absolute", left: 150, top: 870, display: "flex", alignItems: "center", gap: 34, opacity: m(frame, 1320, 1332), transform: `scale(${0.8 + 0.2 * sale(frame, 1320, 1334)})` }}>
          <div style={{ width: 200, height: 200 * (1168 / 1320), borderRadius: 16, overflow: "hidden" }}>
            <Img src={staticFile("radar/logo-radio-udg.jpg")} style={{ width: "100%", height: "100%" }} />
          </div>
          <div style={{ fontFamily: POP }}>
            <div style={{ fontWeight: 800, fontSize: 86, color: K.blanco, lineHeight: 1, transform: `scale(${1 + 0.08 * Math.sin(m(frame, 1366, 1380) * Math.PI)})`, transformOrigin: "left center" }}>104.3 FM</div>
            <div style={{ fontWeight: 600, fontSize: 26, color: K.gris }}>Radio UdeG Puerto Vallarta</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 60, right: 60, top: 1080, textAlign: "center", fontFamily: POP, fontWeight: 500, fontSize: 25, color: K.blanco, lineHeight: 1.4, opacity: m(frame, 1380, 1392) }}>
          Conduce: <b>Dra. Indira Rosalía Montes Zambrano</b>
          <br />
          Invitado: <b>Julio César Díaz Chaidez</b>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 1250, textAlign: "center", fontFamily: POP, fontWeight: 600, fontSize: 30, color: K.gris, opacity: m(frame, 1470, 1482) }}>@julio.chaidez1</div>
      </Escena>

      <LogoRadio />
      <Invitado />
      <Subtitulos />
    </AbsoluteFill>
  );
};
