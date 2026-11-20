import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import mundo from "world-atlas/countries-50m.json";
import { DURACION_CARNAVAL, ENCABEZADOS, FRASES } from "./carnaval-tiempos";

// Tarea de inglés de Julio y Daira: «Holidays and Traditions around the world» — Carnival in Brazil.
// Horizontal 1920x1080. Mapa al inicio, encabezados Before / During / After, una animación por idea y subtítulos.
// Voces: clon «Julio» y clon «DAIRA» (la maestra permitió usar IA, según Julio). public/voz-carnaval.mp3.
export { DURACION_CARNAVAL };

const { fontFamily: F } = loadFont("normal", { weights: ["500", "600", "800"], subsets: ["latin"] });
const { fontFamily: S } = loadSerif("normal", { weights: ["700", "800"], subsets: ["latin"] });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const m = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const VERDE = "#009C3B";
const AMARILLO = "#FFDF00";
const AZUL = "#002776";
const CREMA = "#FFFDF2";
const CONFETI = ["#FFDF00", "#FF4D8D", "#00D4FF", "#7CFF6B", "#FF8A00", "#B57BFF"];

const topo = mundo as unknown as Topology<{ countries: GeometryCollection }>;
const PAISES = (feature(topo, topo.objects.countries) as unknown as { features: { id: string; geometry: GeoJSON.Geometry }[] }).features;
const TEXTO: Record<string, string> = {};

// ---------- Fondo festivo con confeti ----------
const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #0FB24E 0%, ${VERDE} 45%, #004D1D 100%)`, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 960 - 900, top: 540 - 520, width: 1800, height: 1040, transform: "rotate(0deg)", clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)", background: "rgba(255,223,0,0.10)" }} />
      <div style={{ position: "absolute", left: 960 - 330, top: 540 - 330, width: 660, height: 660, borderRadius: "50%", background: "rgba(0,39,118,0.12)" }} />
      {Array.from({ length: 70 }).map((_, i) => {
        const x = (i * 137) % 1920;
        const y = ((i * 211 + frame * (2 + (i % 4))) % 1200) - 60;
        return <div key={i} style={{ position: "absolute", left: x + Math.sin(frame / 20 + i) * 30, top: y, width: 12, height: 22, borderRadius: 3, background: CONFETI[i % CONFETI.length], opacity: 0.55, transform: `rotate(${frame * (3 + (i % 5)) + i * 40}deg)` }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.4) 100%)" }} />
    </AbsoluteFill>
  );
};

const Icono: React.FC<{ e: string; tam: number; x: number; y: number; desde: number }> = ({ e, tam, x, y, desde }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, config: { damping: 12 } });
  return <div style={{ position: "absolute", left: x - tam / 2, top: y - tam / 2 + Math.sin((frame - desde) / 15) * 6, width: tam, height: tam, fontSize: tam * 0.85, lineHeight: `${tam}px`, textAlign: "center", transform: `scale(${s})`, filter: "drop-shadow(0 18px 24px rgba(0,0,0,0.35))" }}>{e}</div>;
};

const Etiqueta: React.FC<{ t: string; x: number; y: number; desde: number; tam?: number }> = ({ t, x, y, desde, tam = 44 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, config: { damping: 14 } });
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, padding: "12px 30px", borderRadius: 40, background: AZUL, border: `3px solid ${AMARILLO}`, fontFamily: F, fontWeight: 800, fontSize: tam, color: AMARILLO, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,0.3)" }}>{t}</div>;
};

const busca = (n: number, w: string) => {
  const i = FRASES[n].words.findIndex(([x]) => x.toLowerCase().replace(/[^\w]/g, "").startsWith(w));
  return i >= 0 ? FRASES[n].words[i][1] : FRASES[n].f0;
};

// Carro alegórico: plataforma con ruedas y una figura grande encima.
const Carro: React.FC<{ x: number; y: number; e: string; desde: number; color: string }> = ({ x, y, e, desde, color }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, config: { damping: 13 } });
  return (
    <div style={{ position: "absolute", left: x - 170, top: y - 170, width: 340, height: 300, transform: `scale(${s})` }}>
      <div style={{ position: "absolute", left: 0, top: 170, width: 340, height: 90, borderRadius: 20, background: `linear-gradient(90deg, ${color}, #fff6, ${color})`, boxShadow: "0 16px 30px rgba(0,0,0,0.35)" }} />
      {[50, 270].map((wx) => <div key={wx} style={{ position: "absolute", left: wx, top: 240, width: 50, height: 50, borderRadius: 25, background: "#222", border: "6px solid #888" }} />)}
      <div style={{ position: "absolute", left: 70, top: 0, fontSize: 180, lineHeight: "200px", transform: `rotate(${Math.sin(frame / 12) * 5}deg)` }}>{e}</div>
    </div>
  );
};

// ---------- Escenas ----------
const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - 4, fps, config: { damping: 12 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 30, fontSize: 130, transform: `scale(${t})` }}><span>🎭</span><span>💃</span><span>🥁</span></div>
      <div style={{ fontFamily: S, fontWeight: 800, fontSize: 160, color: AMARILLO, textShadow: "0 8px 40px rgba(0,0,0,0.45)", transform: `translateY(${(1 - t) * 60}px)`, opacity: t }}>Carnival in Brazil</div>
      <div style={{ marginTop: 20, fontFamily: F, fontWeight: 500, fontSize: 36, color: CREMA, opacity: m(frame, 40, 60) }}>Holidays and Traditions around the World · Julio & Daira</div>
    </AbsoluteFill>
  );
};

const Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  const f0 = FRASES[1].f0;
  const z = interpolate(frame, [f0, f0 + 120], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const proy = geoMercator().scale(260 + z * 640).center([interpolate(z, [0, 1], [-30, -55]), interpolate(z, [0, 1], [5, -15])]).translate([960, 520]);
  const ruta = geoPath(proy);
  const brasilia = proy([-47.9, -15.8]) ?? [0, 0];
  const rio = proy([-43.2, -22.9]) ?? [0, 0];
  const capital = busca(1, "bras");
  const fecha = busca(1, "2027");
  const brillo = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#0B2A4A" }} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {PAISES.map((p, i) => {
          const br = String(p.id) === "076";
          return <path key={i} d={ruta(p.geometry as GeoJSON.Geometry) ?? ""} fill={br ? VERDE : "#2E5578"} stroke={br ? AMARILLO : "#0B2A4A"} strokeWidth={br ? 3 : 0.8} style={br ? { filter: `drop-shadow(0 0 ${14 + brillo * 14}px rgba(255,223,0,0.7))` } : undefined} />;
        })}
      </svg>
      <Etiqueta t="BRAZIL" x={proy([-53, -9])?.[0] ?? 960} y={proy([-53, -9])?.[1] ?? 540} desde={f0 + 40} tam={60} />
      <Etiqueta t="South America" x={proy([-68, -30])?.[0] ?? 700} y={proy([-68, -30])?.[1] ?? 800} desde={busca(1, "south")} tam={34} />
      {frame >= capital ? (
        <>
          <div style={{ position: "absolute", left: brasilia[0] - 14, top: brasilia[1] - 14, width: 28, height: 28, borderRadius: 14, background: AMARILLO, boxShadow: `0 0 ${20 + brillo * 20}px ${AMARILLO}` }} />
          <div style={{ position: "absolute", left: brasilia[0] + 24, top: brasilia[1] - 30, fontFamily: F, fontWeight: 800, fontSize: 38, color: CREMA, textShadow: "0 2px 12px #000", opacity: m(frame, capital, capital + 10) }}>★ Brasília (capital)</div>
        </>
      ) : null}
      {frame >= busca(1, "portuguese") ? <div style={{ position: "absolute", left: 80, top: 120, padding: "12px 26px", borderRadius: 30, background: "rgba(255,255,255,0.12)", fontFamily: F, fontWeight: 600, fontSize: 32, color: CREMA }}>🗣️ Language: Portuguese</div> : null}
      {frame >= fecha - 4 ? (
        <>
          <div style={{ position: "absolute", left: rio[0] - 10, top: rio[1] - 10, width: 20, height: 20, borderRadius: 10, background: "#FF4D8D" }} />
          <div style={{ position: "absolute", left: rio[0] + 18, top: rio[1] - 6, fontFamily: F, fontWeight: 700, fontSize: 30, color: CREMA, textShadow: "0 2px 10px #000" }}>Rio de Janeiro</div>
          <div style={{ position: "absolute", right: 80, top: 120, width: 440, padding: "26px 30px", borderRadius: 28, background: CREMA, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", transform: `scale(${spring({ frame: frame - fecha + 4, fps: 30, config: { damping: 13 } })})` }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: VERDE }}>CARNIVAL 2027</div>
            <div style={{ fontFamily: S, fontWeight: 800, fontSize: 64, color: AZUL }}>Feb 6 – 9</div>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 28, color: AZUL }}>Before Lent · the date changes</div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

const Encabezado: React.FC<{ t: string; f: number }> = ({ t, f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - f, fps, config: { damping: 11 } });
  const [a, ...resto] = t.split(" ");
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse at 50% 45%, #1F4FB0 0%, ${AZUL} 55%, #000E33 100%)` }}>
      <div style={{ width: 1200 * m(frame, f, f + 16), height: 8, background: AMARILLO, marginBottom: 30 }} />
      <div style={{ fontFamily: S, fontWeight: 800, fontSize: 150, color: AMARILLO, transform: `scale(${s})`, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>{a}</div>
      <div style={{ fontFamily: F, fontWeight: 600, fontSize: 64, color: CREMA, opacity: m(frame, f + 8, f + 20) }}>{resto.join(" ")}</div>
      <div style={{ width: 1200 * m(frame, f, f + 16), height: 8, background: VERDE, marginTop: 30 }} />
    </AbsoluteFill>
  );
};

const Ilustracion: React.FC<{ n: number }> = ({ n }) => {
  const frame = useCurrentFrame();
  const f0 = FRASES[n].f0;
  const Y = 460;
  switch (n) {
    case 0:
      return <Titulo />;
    case 1:
      return <Mapa />;
    case 2: // escuelas de samba: un barrio que se prepara
      return (
        <>
          {[560, 760, 960, 1160, 1360].map((x, i) => <Icono key={i} e={["🏘️", "💃", "🥁", "🕺", "🏘️"][i]} tam={190} x={x} y={Y - 60} desde={f0 + 4 + i * 5} />)}
          <Etiqueta t="Samba school = a neighborhood group" x={960} y={Y + 180} desde={busca(2, "group")} />
          <Etiqueta t="Many months of work 🗓️" x={960} y={Y + 290} desde={busca(2, "months")} tam={36} />
        </>
      );
    case 3: // tema, canción y carros
      return (
        <>
          <Icono e="💡" tam={190} x={520} y={Y - 80} desde={busca(3, "theme")} />
          <Icono e="🎶" tam={190} x={860} y={Y - 80} desde={busca(3, "song")} />
          <Carro x={1330} y={Y - 40} e="🦜" desde={busca(3, "floats")} color="#FF4D8D" />
          <Etiqueta t="New theme · samba song · giant floats" x={960} y={Y + 250} desde={busca(3, "build")} />
        </>
      );
    case 4: // trajes
      return (
        <>
          <Icono e="🪶" tam={220} x={640} y={Y - 40} desde={busca(4, "costumes")} />
          <Icono e="👗" tam={240} x={960} y={Y - 40} desde={f0 + 4} />
          <Icono e="✨" tam={200} x={1280} y={Y - 40} desde={busca(4, "sequins")} />
          <Etiqueta t="Feathers & sequins" x={960} y={Y + 230} desde={busca(4, "feathers")} />
        </>
      );
    case 5: // ensayos
      return (
        <>
          {Array.from({ length: 5 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 460 + i * 220, top: Y - 150 + (i % 2 ? -20 : 20) * Math.sin(frame / 6 + i), fontSize: 180 }}>{i % 2 ? "🥁" : "💃"}</div>)}
          <Etiqueta t="Rehearsing for months" x={960} y={Y + 230} desde={busca(5, "rehearse")} />
        </>
      );
    case 6: // todo el país, 4 días
      return (
        <>
          {["SAT", "SUN", "MON", "TUE"].map((d, i) => {
            const s = spring({ frame: frame - (f0 + 6 + i * 6), fps: 30, config: { damping: 12 } });
            return (
              <div key={i} style={{ position: "absolute", left: 470 + i * 260, top: Y - 180, width: 220, height: 260, borderRadius: 26, background: CREMA, transform: `scale(${s})`, boxShadow: "0 16px 40px rgba(0,0,0,0.35)", textAlign: "center" }}>
                <div style={{ height: 70, borderRadius: "26px 26px 0 0", background: "#FF4D8D", fontFamily: F, fontWeight: 800, fontSize: 34, color: "#fff", lineHeight: "70px" }}>{d}</div>
                <div style={{ fontSize: 120, lineHeight: "180px" }}>{["🎉", "💃", "🥁", "🎭"][i]}</div>
              </div>
            );
          })}
          <Etiqueta t="4 days of celebration 🇧🇷" x={960} y={Y + 210} desde={busca(6, "four")} />
        </>
      );
    case 7: // Sambódromo
      return (
        <>
          <div style={{ position: "absolute", left: 160, right: 160, top: Y - 40, height: 160, background: "#777", borderTop: `16px solid ${AMARILLO}`, borderBottom: `16px solid ${AMARILLO}`, opacity: m(frame, f0, f0 + 10) }} />
          {[0, 1].map((k) => <div key={k} style={{ position: "absolute", left: 160, right: 160, top: k ? Y + 136 : Y - 140, height: 100, background: "repeating-linear-gradient(90deg, #335 0 30px, #446 30px 60px)", opacity: m(frame, f0, f0 + 10) }} />)}
          {Array.from({ length: 7 }).map((_, i) => {
            const x = ((frame - f0) * 4 + i * 260) % 1900 - 150;
            return <div key={i} style={{ position: "absolute", left: x, top: Y - 40, fontSize: 130 }}>{["💃", "🥁", "🦜", "🕺", "🥁", "💃", "🎭"][i]}</div>;
          })}
          <Etiqueta t="The Sambadrome · Rio de Janeiro" x={960} y={Y + 330} desde={busca(7, "sambadrome")} />
        </>
      );
    case 8: // jueces
      return (
        <>
          <Icono e="📋" tam={220} x={560} y={Y - 40} desde={f0 + 4} />
          {[["🥁", "Drums", "drums"], ["👗", "Costumes", "costumes"], ["💃", "Samba", "samba"]].map(([e, t, w], i) => {
            const s = spring({ frame: frame - busca(8, w) + 2, fps: 30, config: { damping: 12 } });
            return (
              <div key={i} style={{ position: "absolute", left: 800 + i * 280, top: Y - 160, width: 240, height: 260, borderRadius: 26, background: CREMA, transform: `scale(${s})`, textAlign: "center", boxShadow: "0 16px 40px rgba(0,0,0,0.35)" }}>
                <div style={{ fontSize: 100, marginTop: 20 }}>{e}</div>
                <div style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: AZUL }}>{t}</div>
                <div style={{ fontFamily: S, fontWeight: 800, fontSize: 44, color: VERDE }}>10.0</div>
              </div>
            );
          })}
          <Etiqueta t="Judges score every school" x={960} y={Y + 240} desde={busca(8, "judges")} />
        </>
      );
    case 9: // fiestas en la calle
      return (
        <>
          {Array.from({ length: 9 }).map((_, i) => <div key={i} style={{ position: "absolute", left: 300 + i * 150, top: Y - 60 + Math.sin(frame / 5 + i) * 25, fontSize: 130 }}>{["🕺", "💃", "🎺", "🥳", "💃", "🎉", "🕺", "🥁", "🥳"][i]}</div>)}
          <Etiqueta t="Free street parties 🎉" x={960} y={Y + 220} desde={busca(9, "street")} />
        </>
      );
    case 10: // máscaras y brillantina
      return (
        <>
          <Icono e="🎭" tam={260} x={680} y={Y - 40} desde={busca(10, "masks")} />
          <Icono e="✨" tam={220} x={960} y={Y - 40} desde={busca(10, "glitter")} />
          <Icono e="🤡" tam={240} x={1240} y={Y - 40} desde={busca(10, "funny")} />
          <Etiqueta t="Music day and night 🎶" x={960} y={Y + 230} desde={busca(10, "music")} />
        </>
      );
    case 11: // Miércoles de Ceniza
      return (
        <>
          <div style={{ position: "absolute", left: 760, top: Y - 230, width: 400, height: 400, borderRadius: 30, background: CREMA, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", textAlign: "center", transform: `scale(${spring({ frame: frame - f0 - 4, fps: 30, config: { damping: 12 } })})` }}>
            <div style={{ height: 90, borderRadius: "30px 30px 0 0", background: "#555", fontFamily: F, fontWeight: 800, fontSize: 40, color: "#fff", lineHeight: "90px" }}>WEDNESDAY</div>
            <div style={{ fontFamily: S, fontWeight: 800, fontSize: 170, color: AZUL, lineHeight: "220px" }}>10</div>
            <div style={{ fontFamily: F, fontWeight: 700, fontSize: 30, color: AZUL, marginTop: -30 }}>February 2027</div>
          </div>
          <Etiqueta t="Ash Wednesday · Lent begins" x={960} y={Y + 250} desde={busca(11, "ash")} />
        </>
      );
    case 12: // resultados
      return (
        <>
          <Icono e="📣" tam={200} x={600} y={Y - 40} desde={busca(12, "announce")} />
          <Icono e="🏆" tam={300} x={960} y={Y - 60} desde={busca(12, "winning")} />
          <Icono e="🎉" tam={200} x={1320} y={Y - 40} desde={busca(12, "celebrates")} />
          <Etiqueta t="The results!" x={960} y={Y + 230} desde={busca(12, "results")} />
        </>
      );
    case 13: // la última baja
      return (
        <>
          <Icono e="📉" tam={260} x={800} y={Y - 40} desde={f0 + 4} />
          <div style={{ position: "absolute", left: 1080, top: Y - 160 + m(frame, busca(13, "down"), busca(13, "down") + 20) * 160, fontSize: 200 }}>⬇️</div>
          <Etiqueta t="Lowest score → lower group" x={960} y={Y + 240} desde={busca(13, "lowest")} />
        </>
      );
    case 14: // desfile de campeones
      return (
        <>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: 420 + i * 190, top: Y - 140, width: 160, height: 160, borderRadius: 80, background: i === 5 ? AMARILLO : CREMA, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: S, fontWeight: 800, fontSize: 70, color: AZUL, transform: `scale(${spring({ frame: frame - (busca(14, "six") + i * 4), fps: 30, config: { damping: 12 } })})`, boxShadow: "0 14px 30px rgba(0,0,0,0.35)" }}>{i === 5 ? "🏆" : i + 1}</div>
          ))}
          <Etiqueta t="Saturday · Champions' Parade" x={960} y={Y + 200} desde={busca(14, "champions")} />
        </>
      );
    case 15: // descansan y empiezan otra vez
      return (
        <>
          <Icono e="😴" tam={240} x={720} y={Y - 40} desde={f0 + 4} />
          <div style={{ position: "absolute", left: 900, top: Y - 100, fontFamily: S, fontWeight: 800, fontSize: 120, color: AMARILLO, opacity: m(frame, busca(15, "start") - 6, busca(15, "start")) }}>→</div>
          <Icono e="🗓️" tam={240} x={1220} y={Y - 40} desde={busca(15, "next")} />
          <Etiqueta t="Preparing for next year!" x={960} y={Y + 230} desde={busca(15, "preparing")} />
        </>
      );
    case 16: // conclusión
      return (
        <>
          {[["🎶", "Music", "music"], ["🎨", "Color", "color"], ["😄", "Joy", "joy"]].map(([e, t, w], i) => {
            const s = spring({ frame: frame - Math.min(busca(16, w) - 4, f0 + 6 + i * 12), fps: 30, config: { damping: 12 } });
            return (
              <div key={i} style={{ position: "absolute", left: 300 + i * 460, top: Y - 200, width: 400, height: 380, borderRadius: 36, background: CREMA, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", transform: `scale(${s})`, textAlign: "center" }}>
                <div style={{ fontSize: 170, marginTop: 30 }}>{e}</div>
                <div style={{ fontFamily: F, fontWeight: 800, fontSize: 50, color: VERDE }}>{t}</div>
              </div>
            );
          })}
        </>
      );
    default: // gracias
      return (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: Y - 80, textAlign: "center", fontFamily: S, fontWeight: 800, fontSize: 140, color: AMARILLO, textShadow: "0 8px 40px rgba(0,0,0,0.5)", opacity: m(frame, f0, f0 + 12) }}>Happy Carnival!</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: Y + 110, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 40, color: CREMA, opacity: m(frame, f0 + 20, f0 + 34) }}>Thank you for watching · Julio & Daira</div>
        </>
      );
  }
};

const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  const n = FRASES.findIndex((x) => frame >= x.f0 - 4 && frame <= x.f1 + 10);
  if (n < 0) return null;
  const fr = FRASES[n];
  const actual = Math.max(0, fr.words.findIndex(([, f], k) => frame >= f && (k === fr.words.length - 1 || frame < fr.words[k + 1][1])));
  const inicio = Math.floor(actual / 12) * 12;
  const trozo = fr.words.slice(inicio, inicio + 12);
  const daira = fr.who === "Daira";
  return (
    <div style={{ position: "absolute", left: 120, right: 120, bottom: 50, display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ flexShrink: 0, padding: "10px 22px", borderRadius: 24, background: daira ? "#FF4D8D" : AZUL, fontFamily: F, fontWeight: 800, fontSize: 30, color: "#fff" }}>{fr.who}</div>
      <div style={{ padding: "14px 26px", borderRadius: 22, background: "rgba(0,20,10,0.72)", display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
        {trozo.map(([w, f], k) => (
          <span key={k} style={{ fontFamily: F, fontWeight: 600, fontSize: 38, lineHeight: 1.3, color: frame >= f ? (k + inicio === actual ? AMARILLO : "#fff") : "rgba(255,255,255,0.45)" }}>{TEXTO[w] ?? w}</span>
        ))}
      </div>
    </div>
  );
};

export const BrazilCarnival: React.FC = () => {
  const frame = useCurrentFrame();
  const n = FRASES.findIndex((x, k) => frame >= x.f0 - 8 && (k === FRASES.length - 1 || frame < FRASES[k + 1].f0 - 8));
  const actual = Math.max(0, n);
  const h = ENCABEZADOS.find((x) => frame >= x.f && frame < x.f + 66);
  const inicioEscena = FRASES[actual].f0 - 8;
  const entra = interpolate(frame, [inicioEscena, inicioEscena + 10], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill style={{ opacity: actual === 0 ? 1 : entra, transform: `scale(${0.96 + entra * 0.04})` }}>
        <Ilustracion n={actual} />
      </AbsoluteFill>
      {h ? <Encabezado t={h.t} f={h.f} /> : null}
      <Subtitulos />
      <Audio src={staticFile("voz-carnaval.mp3")} />
      <Audio src={staticFile("musica-vuelos.mp3")} loop volume={(f) => 0.08 * interpolate(f, [0, 20, DURACION_CARNAVAL - 60, DURACION_CARNAVAL], [0, 1, 1, 0], clamp)} />
      {ENCABEZADOS.map((x, k) => (
        <Sequence key={k} from={x.f} durationInFrames={45}><Audio src={staticFile("sfx/golpe.wav")} volume={0.35} /></Sequence>
      ))}
      {FRASES.map((x, k) => (
        <Sequence key={`w${k}`} from={Math.max(0, x.f0 - 8)} durationInFrames={40}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.18} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
