import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import mundo from "world-atlas/countries-50m.json";
import { DURACION_CNY, ENCABEZADOS, FRASES } from "./cny-tiempos";

// Tarea de inglés de Julio y Daira: «Holidays and Traditions around the world» — Chinese New Year (China).
// Horizontal 1920x1080. Mapa al inicio, encabezados Before / During / After, una animación por tradición y subtítulos.
// Voces: clon «Julio» y clon «DAIRA» (la maestra permitió usar IA, según Julio). public/voz-cny.mp3.
export { DURACION_CNY };

const { fontFamily: F } = loadFont("normal", { weights: ["500", "600", "800"], subsets: ["latin"] });
const { fontFamily: S } = loadSerif("normal", { weights: ["700", "800"], subsets: ["latin"] });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const m = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const ROJO = "#B3121B";
const ORO = "#F6C453";
const CREMA = "#FFF3DC";

const topo = mundo as unknown as Topology<{ countries: GeometryCollection }>;
const PAISES = (feature(topo, topo.objects.countries) as unknown as { features: { id: string; geometry: GeoJSON.Geometry }[] }).features;

// Arreglos de ortografía en subtítulos (la tarea califica la ortografía).
const TEXTO: Record<string, string> = { "15": "fifteen" };

// ---------- Fondo rojo con patrón y linternas ----------
const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, #D3202A 0%, ${ROJO} 45%, #5E070C 100%)`, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: "radial-gradient(rgba(246,196,83,0.10) 3px, transparent 3.5px)", backgroundSize: "60px 60px", opacity: 0.8 }} />
      {[140, 420, 1500, 1780].map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x, top: -20, transformOrigin: "50% 0", transform: `rotate(${Math.sin(frame / 30 + i) * 4}deg)` }}>
          <div style={{ width: 4, height: 90 + (i % 2) * 60, background: ORO, margin: "0 auto" }} />
          <div style={{ fontSize: 110 + (i % 2) * 20, marginTop: -16, filter: "drop-shadow(0 0 30px rgba(255,170,60,0.7))" }}>🏮</div>
        </div>
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ---------- Elementos reutilizables ----------
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
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, padding: "12px 30px", borderRadius: 40, background: "rgba(40,0,4,0.55)", border: `2px solid ${ORO}`, fontFamily: F, fontWeight: 800, fontSize: tam, color: ORO, whiteSpace: "nowrap" }}>{t}</div>
  );
};

// Fotograma en que se dice una palabra de la frase n.
const busca = (n: number, w: string) => {
  const i = FRASES[n].words.findIndex(([x]) => x.toLowerCase().replace(/[^\w]/g, "").startsWith(w));
  return i >= 0 ? FRASES[n].words[i][1] : FRASES[n].f0;
};

// Fuego artificial: rayos y chispas que se abren desde un punto.
const Estallido: React.FC<{ x: number; y: number; t: number; color: string }> = ({ x, y, t, color }) => (
  <>
    {Array.from({ length: 16 }).map((_, k) => {
      const a = (k / 16) * Math.PI * 2;
      const r = 40 + t * 170;
      return <div key={k} style={{ position: "absolute", left: x + Math.cos(a) * r - 7, top: y + Math.sin(a) * r + t * t * 40 - 7, width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 16px ${color}`, opacity: 1 - t * t }} />;
    })}
    <div style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, borderRadius: 30, background: `radial-gradient(circle, #fff, ${color} 50%, transparent 70%)`, opacity: Math.max(0, 1 - t * 3) }} />
  </>
);

// ---------- Escenas ----------
const Titulo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - 4, fps, config: { damping: 14 } });
  const sub = spring({ frame: frame - busca(0, "spring") + 4, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontSize: 150, transform: `scale(${t})` }}>🧧</div>
      <div style={{ fontFamily: S, fontWeight: 800, fontSize: 150, color: ORO, textShadow: "0 8px 40px rgba(0,0,0,0.45)", transform: `translateY(${(1 - t) * 60}px)`, opacity: t }}>Chinese New Year</div>
      <div style={{ fontFamily: F, fontWeight: 600, fontSize: 54, color: CREMA, opacity: sub, transform: `translateY(${(1 - sub) * 30}px)` }}>The Spring Festival</div>
      <div style={{ marginTop: 30, fontFamily: F, fontWeight: 500, fontSize: 34, color: "rgba(255,243,220,0.75)", opacity: m(frame, 40, 60) }}>Holidays and Traditions around the World · Julio & Daira</div>
    </AbsoluteFill>
  );
};

const Mapa: React.FC = () => {
  const frame = useCurrentFrame();
  const f0 = FRASES[1].f0;
  const z = interpolate(frame, [f0, f0 + 120], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const escala = 300 + z * 600;
  const centro: [number, number] = [interpolate(z, [0, 1], [60, 104]), interpolate(z, [0, 1], [25, 36])];
  const proy = geoMercator().scale(escala).center(centro).translate([960, 520]);
  const ruta = geoPath(proy);
  const beijing = proy([116.4, 39.9]) ?? [0, 0];
  const capital = busca(1, "beijing");
  const fecha = busca(1, "2027");
  const brillo = 0.5 + 0.5 * Math.sin(frame / 8);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: "#0E2238" }} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {PAISES.map((p, i) => {
          const china = String(p.id) === "156";
          return <path key={i} d={ruta(p.geometry as GeoJSON.Geometry) ?? ""} fill={china ? ROJO : "#2B4A66"} stroke={china ? ORO : "#0E2238"} strokeWidth={china ? 3 : 0.8} style={china ? { filter: `drop-shadow(0 0 ${14 + brillo * 14}px rgba(246,196,83,0.7))` } : undefined} />;
        })}
      </svg>
      <Etiqueta t="CHINA" x={proy([103, 34])?.[0] ?? 960} y={proy([103, 34])?.[1] ?? 540} desde={f0 + 40} tam={60} />
      <Etiqueta t="East Asia" x={proy([125, 48])?.[0] ?? 960} y={proy([125, 48])?.[1] ?? 300} desde={busca(1, "east")} tam={34} />
      {frame >= capital ? (
        <>
          <div style={{ position: "absolute", left: beijing[0] - 14, top: beijing[1] - 14, width: 28, height: 28, borderRadius: 14, background: ORO, boxShadow: `0 0 ${20 + brillo * 20}px ${ORO}` }} />
          <div style={{ position: "absolute", left: beijing[0] + 24, top: beijing[1] - 30, fontFamily: F, fontWeight: 800, fontSize: 40, color: CREMA, textShadow: "0 2px 12px #000", opacity: m(frame, capital, capital + 10) }}>★ Beijing (capital)</div>
        </>
      ) : null}
      {frame >= fecha - 4 ? (
        <div style={{ position: "absolute", right: 80, top: 120, width: 420, padding: "26px 30px", borderRadius: 28, background: CREMA, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", transform: `scale(${spring({ frame: frame - fecha + 4, fps: 30, config: { damping: 13 } })})` }}>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: ROJO }}>CHINESE NEW YEAR 2027</div>
          <div style={{ fontFamily: S, fontWeight: 800, fontSize: 70, color: "#3A0A0D" }}>Feb 6</div>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 34, color: "#3A0A0D", opacity: m(frame, busca(1, "goat"), busca(1, "goat") + 10) }}>🐐 Year of the Goat</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 80, top: 120, padding: "12px 26px", borderRadius: 30, background: "rgba(255,255,255,0.1)", fontFamily: F, fontWeight: 600, fontSize: 30, color: CREMA, opacity: m(frame, busca(1, "lunar"), busca(1, "lunar") + 10) }}>🌙 Lunar calendar · late January – mid-February</div>
    </AbsoluteFill>
  );
};

const Encabezado: React.FC<{ t: string; f: number }> = ({ t, f }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - f, fps, config: { damping: 11 } });
  const [a, ...resto] = t.split(" ");
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse at 50% 45%, #C3161F 0%, ${ROJO} 45%, #4A0509 100%)` }}>
      <div style={{ width: 1200 * m(frame, f, f + 16), height: 6, background: ORO, marginBottom: 30 }} />
      <div style={{ fontFamily: S, fontWeight: 800, fontSize: 150, color: ORO, transform: `scale(${s})`, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>{a}</div>
      <div style={{ fontFamily: F, fontWeight: 600, fontSize: 64, color: CREMA, opacity: m(frame, f + 8, f + 20) }}>{resto.join(" ")}</div>
      <div style={{ width: 1200 * m(frame, f, f + 16), height: 6, background: ORO, marginTop: 30 }} />
    </AbsoluteFill>
  );
};

// Una animación por frase (índice de FRASES).
const Ilustracion: React.FC<{ n: number }> = ({ n }) => {
  const frame = useCurrentFrame();
  const f0 = FRASES[n].f0;
  const Y = 470;
  switch (n) {
    case 0:
      return <Titulo />;
    case 1:
      return <Mapa />;
    case 2: // limpieza
      return (
        <>
          <Icono e="🏠" tam={360} x={760} y={Y} desde={f0} />
          <div style={{ position: "absolute", left: 1050 + Math.sin(frame / 6) * 60, top: Y - 40, fontSize: 220, transform: `rotate(${Math.sin(frame / 6) * 20}deg)` }}>🧹</div>
          {Array.from({ length: 10 }).map((_, i) => {
            const t = ((frame - f0 - i * 6) % 50) / 50;
            return frame > busca(2, "sweeps") ? <div key={i} style={{ position: "absolute", left: 1150 + t * 500, top: Y + 80 - t * 200 + i * 10, fontSize: 40, opacity: 1 - t }}>💨</div> : null;
          })}
          <Etiqueta t="Bad luck → out!" x={1350} y={Y + 260} desde={busca(2, "bad")} />
        </>
      );
    case 3: // decoración y Nian
      return (
        <>
          {[560, 760, 960, 1160, 1360].map((x, i) => <Icono key={i} e={["🏮", "🧧", "🏮", "🎐", "🏮"][i]} tam={170} x={x} y={Y - 120} desde={busca(3, "red") + i * 4} />)}
          <Etiqueta t="Red = good luck" x={960} y={Y + 40} desde={busca(3, "banners")} />
          {frame >= busca(3, "monster") ? (
            <>
              <div style={{ position: "absolute", left: interpolate(frame, [busca(3, "afraid"), busca(3, "afraid") + 40], [700, 1500], clamp), top: Y + 140, fontSize: 200 }}>👹</div>
              <Icono e="🧨" tam={150} x={560} y={Y + 240} desde={busca(3, "loud")} />
              <Etiqueta t="Nian" x={interpolate(frame, [busca(3, "afraid"), busca(3, "afraid") + 40], [800, 1600], clamp)} y={Y + 400} desde={busca(3, "monster")} tam={36} />
            </>
          ) : null}
        </>
      );
    case 4: // viaje a casa
      return (
        <>
          <div style={{ position: "absolute", left: 300, right: 300, top: Y + 80, height: 10, borderRadius: 5, background: "rgba(255,243,220,0.4)" }} />
          <div style={{ position: "absolute", left: interpolate(frame, [f0, f0 + 120], [260, 1300], clamp), top: Y - 80, fontSize: 170 }}>🚄</div>
          <Icono e="👨‍👩‍👧‍👦" tam={240} x={1560} y={Y} desde={busca(4, "family")} />
          <Etiqueta t="Back to their hometowns" x={960} y={Y + 230} desde={busca(4, "hometowns")} />
        </>
      );
    case 5: // cena de reunión
      return (
        <>
          <div style={{ position: "absolute", left: 460, top: Y + 30, width: 1000, height: 60, borderRadius: 30, background: "#7A3B12", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", opacity: m(frame, f0, f0 + 10) }} />
          {[620, 820, 1100, 1300].map((x, i) => <Icono key={i} e={["🥢", "🍲", "🥟", "🍵"][i]} tam={170} x={x} y={Y - 50} desde={f0 + 6 + i * 5} />)}
          <Icono e="🥟" tam={200} x={960} y={Y - 260} desde={busca(5, "dumplings")} />
          <Etiqueta t="Dumplings = ancient money = wealth 💰" x={960} y={Y + 210} desde={busca(5, "ancient")} />
        </>
      );
    case 6: // pescado
      return (
        <>
          <Icono e="🐟" tam={320} x={700} y={Y} desde={f0 + 4} />
          <div style={{ position: "absolute", left: 900, top: Y - 60, fontFamily: S, fontWeight: 800, fontSize: 120, color: ORO, opacity: m(frame, busca(6, "sounds"), busca(6, "sounds") + 10) }}>≈</div>
          <Etiqueta t="“surplus” 📈" x={1350} y={Y} desde={busca(6, "surplus")} tam={60} />
          <Etiqueta t="More than enough in the new year" x={960} y={Y + 240} desde={busca(6, "wish")} />
        </>
      );
    case 7: // fuegos artificiales
      return (
        <>
          {Array.from({ length: 6 }).map((_, i) => {
            const t = ((frame - f0 - i * 9) % 45) / 45;
            const x = 360 + i * 240;
            return frame > f0 + i * 9 ? <Estallido key={i} x={x} y={260 + (i % 2) * 140} t={t} color={["#FFD23F", "#FF5E5B", "#7AE7FF", "#FFFFFF", "#F6C453", "#FF9F1C"][i]} /> : null;
          })}
          <Etiqueta t="Midnight 🕛" x={960} y={Y + 240} desde={busca(7, "midnight")} tam={56} />
        </>
      );
    case 8: // sobres rojos y danzas
      return (
        <>
          {Array.from({ length: 7 }).map((_, i) => {
            const t = (frame - busca(8, "red") - i * 5) / 40;
            return t > 0 ? <div key={i} style={{ position: "absolute", left: 300 + i * 120 + t * 40, top: Y - 200 + Math.sin(t * 3 + i) * 40, fontSize: 120, transform: `rotate(${(i - 3) * 8}deg)`, opacity: Math.min(1, t * 2) }}>🧧</div> : null;
          })}
          <Icono e="🐉" tam={300} x={1350} y={Y - 80} desde={busca(8, "dragon")} />
          <Icono e="🦁" tam={220} x={1600} y={Y + 120} desde={busca(8, "lion")} />
          <Etiqueta t="Red envelopes with money" x={620} y={Y + 200} desde={busca(8, "envelopes")} />
        </>
      );
    case 9: // regla de no barrer
      return (
        <>
          <Icono e="🧹" tam={300} x={800} y={Y} desde={f0 + 4} />
          <div style={{ position: "absolute", left: 640, top: Y - 160, width: 320, height: 320, borderRadius: 160, border: "22px solid #FF3B30", opacity: m(frame, busca(9, "sweep") + 6, busca(9, "sweep") + 12) }}>
            <div style={{ position: "absolute", left: 130, top: -20, width: 22, height: 320, background: "#FF3B30", transform: "rotate(45deg)" }} />
          </div>
          <Icono e="🍀" tam={240} x={1250} y={Y} desde={busca(9, "luck")} />
          <Etiqueta t="Day 1: don't sweep!" x={960} y={Y + 250} desde={busca(9, "first")} />
        </>
      );
    case 10: // 15 días
      return (
        <>
          <div style={{ position: "absolute", left: 760, top: Y - 220, width: 400, height: 400, borderRadius: 30, background: CREMA, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", textAlign: "center" }}>
            <div style={{ height: 90, borderRadius: "30px 30px 0 0", background: ROJO, fontFamily: F, fontWeight: 800, fontSize: 40, color: ORO, lineHeight: "90px" }}>DAY</div>
            <div style={{ fontFamily: S, fontWeight: 800, fontSize: 200, color: "#3A0A0D" }}>{Math.round(interpolate(frame, [f0, busca(10, "days") + 10], [1, 15], clamp))}</div>
          </div>
          <Icono e="🏮" tam={220} x={1450} y={Y} desde={busca(10, "lantern")} />
          <Etiqueta t="Lantern Festival" x={960} y={Y + 270} desde={busca(10, "lantern")} />
        </>
      );
    case 11: // linternas y adivinanzas
      return (
        <>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{ position: "absolute", left: ((frame - f0) * 3 + i * 240) % 2100 - 150, top: Y - 100 + Math.sin(frame / 20 + i) * 30 + (i % 2) * 80, fontSize: 140, filter: "drop-shadow(0 0 30px rgba(255,170,60,0.8))" }}>🏮</div>
          ))}
          <Etiqueta t="❓ Riddles on the lanterns" x={960} y={Y + 260} desde={busca(11, "riddles")} />
        </>
      );
    case 12: // bolitas de arroz
      return (
        <>
          <Icono e="🥣" tam={320} x={760} y={Y} desde={f0 + 4} />
          <Icono e="🍡" tam={200} x={760} y={Y - 200} desde={busca(12, "rice")} />
          <div style={{ position: "absolute", left: 1150, top: Y - 180, width: 360, height: 360, borderRadius: 180, border: `10px solid ${ORO}`, opacity: m(frame, busca(12, "round"), busca(12, "round") + 10), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 150 }}>👨‍👩‍👧</div>
          <Etiqueta t="Round = family unity" x={1330} y={Y + 270} desde={busca(12, "unity")} />
        </>
      );
    case 13: // de regreso
      return (
        <>
          <Icono e="💼" tam={240} x={700} y={Y} desde={f0 + 4} />
          <Icono e="🏫" tam={260} x={1050} y={Y} desde={busca(13, "school")} />
          <Icono e="🍀" tam={200} x={1380} y={Y} desde={busca(13, "lucky")} />
          <Etiqueta t="Ready for a lucky new year" x={960} y={Y + 250} desde={busca(13, "ready")} />
        </>
      );
    case 14: // conclusión
      return (
        <>
          {[["👨‍👩‍👧‍👦", "Family", "family"], ["🍀", "Good luck", "luck"], ["🌱", "New beginnings", "beginnings"]].map(([e, t, w], i) => {
            const s = spring({ frame: frame - Math.min(busca(14, w) - 4, f0 + 6 + i * 12), fps: 30, config: { damping: 12 } });
            return (
              <div key={i} style={{ position: "absolute", left: 300 + i * 460, top: Y - 200, width: 400, height: 380, borderRadius: 36, background: CREMA, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", transform: `scale(${s})`, textAlign: "center" }}>
                <div style={{ fontSize: 170, marginTop: 30 }}>{e}</div>
                <div style={{ fontFamily: F, fontWeight: 800, fontSize: 46, color: ROJO }}>{t}</div>
              </div>
            );
          })}
        </>
      );
    default: // gracias
      return (
        <>
          {Array.from({ length: 6 }).map((_, i) => {
            const t = ((frame - f0 - i * 8) % 45) / 45;
            return frame > f0 + i * 8 ? <Estallido key={i} x={260 + i * 280} y={200 + (i % 2) * 120} t={t} color={["#FFD23F", "#FF5E5B", "#7AE7FF", "#FFFFFF", "#F6C453", "#FF9F1C"][i]} /> : null;
          })}
          <div style={{ position: "absolute", left: 0, right: 0, top: Y - 60, textAlign: "center", fontFamily: S, fontWeight: 800, fontSize: 130, color: ORO, textShadow: "0 8px 40px rgba(0,0,0,0.5)", opacity: m(frame, f0, f0 + 12) }}>Happy New Year!</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: Y + 120, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 40, color: CREMA, opacity: m(frame, f0 + 20, f0 + 34) }}>Thank you for watching · Julio & Daira</div>
        </>
      );
  }
};

// ---------- Subtítulos con el nombre de quien habla ----------
const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  const n = FRASES.findIndex((x) => frame >= x.f0 - 4 && frame <= x.f1 + 10);
  if (n < 0) return null;
  const fr = FRASES[n];
  // ventana de unas 12 palabras alrededor de la palabra actual
  const actual = Math.max(0, fr.words.findIndex(([, f], k) => frame >= f && (k === fr.words.length - 1 || frame < fr.words[k + 1][1])));
  const inicio = Math.floor(actual / 12) * 12;
  const trozo = fr.words.slice(inicio, inicio + 12);
  const daira = fr.who === "Daira";
  return (
    <div style={{ position: "absolute", left: 120, right: 120, bottom: 50, display: "flex", alignItems: "center", gap: 24 }}>
      <div style={{ flexShrink: 0, padding: "10px 22px", borderRadius: 24, background: daira ? "#F15BB5" : "#2A9D8F", fontFamily: F, fontWeight: 800, fontSize: 30, color: "#fff" }}>{fr.who}</div>
      <div style={{ padding: "14px 26px", borderRadius: 22, background: "rgba(20,0,2,0.72)", display: "flex", flexWrap: "wrap", gap: "0 12px" }}>
        {trozo.map(([w, f], k) => (
          <span key={k} style={{ fontFamily: F, fontWeight: 600, fontSize: 38, lineHeight: 1.3, color: frame >= f ? (k + inicio === actual ? ORO : "#fff") : "rgba(255,255,255,0.45)" }}>{TEXTO[w] ?? w}</span>
        ))}
      </div>
    </div>
  );
};

export const ChineseNewYear: React.FC = () => {
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
      <Audio src={staticFile("voz-cny.mp3")} />
      <Audio src={staticFile("musica-diciembre.mp3")} loop volume={(f) => 0.08 * interpolate(f, [0, 20, DURACION_CNY - 60, DURACION_CNY], [0, 1, 1, 0], clamp)} />
      {ENCABEZADOS.map((x, k) => (
        <Sequence key={k} from={x.f} durationInFrames={45}><Audio src={staticFile("sfx/golpe.wav")} volume={0.35} /></Sequence>
      ))}
      {FRASES.map((x, k) => (
        <Sequence key={`w${k}`} from={Math.max(0, x.f0 - 8)} durationInFrames={40}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.18} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
