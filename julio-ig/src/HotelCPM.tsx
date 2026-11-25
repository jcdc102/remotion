import { AbsoluteFill, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Audio } from "@remotion/media";
import { loadFont } from "@remotion/google-fonts/Poppins";
import { loadFont as loadSerif } from "@remotion/google-fonts/PlayfairDisplay";
import { ACTS } from "./hotel-cpm";
import { DURACION_HOTEL, ESCENAS } from "./hotel-tiempos";

// Exposición del trabajo final de Programación de Proyectos (Equipo 4, Turismo, CUCosta):
// «Apertura de un Hotel Boutique» con el Método de Ruta Crítica. Horizontal 1920x1080, voz «Julio».
// Datos del Excel del equipo, con la ruta crítica recalculada y verificada (38 semanas, 18 actividades críticas).
export { DURACION_HOTEL };

const { fontFamily: F } = loadFont("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin", "latin-ext"] });
const { fontFamily: S } = loadSerif("normal", { weights: ["700", "800"], subsets: ["latin"] });
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const m = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], clamp);
const TEAL = "#0F3D3E";
const ARENA = "#F2E8D5";
const ORO = "#D4A24C";
const ROJO = "#E63946";
const AZUL = "#4C8DFF";
const TINTA = "#1D2B2C";

type Clave = keyof typeof ESCENAS;
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
// Fotograma en que se dice la n-ésima palabra que empieza con `w` dentro de la escena.
const W = (e: Clave, w: string, n = 1) => {
  const ws = ESCENAS[e].words;
  let c = 0;
  for (const [x, f] of ws) if (norm(x).startsWith(norm(w)) && ++c === n) return f;
  return ESCENAS[e].f0;
};
const ORDEN: Clave[] = ["portada", "intro", "fases", "tabla", "ejemplo", "red", "ruta", "gantt", "conclusion"];

const Fondo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 30% 20%, #1B5A5B 0%, ${TEAL} 50%, #082324 100%)` }}>
      <AbsoluteFill style={{ backgroundImage: "linear-gradient(rgba(242,232,213,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(242,232,213,0.05) 1px, transparent 1px)", backgroundSize: "60px 60px", backgroundPosition: `${frame * 0.3}px 0` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%)" }} />
    </AbsoluteFill>
  );
};

const Titulo: React.FC<{ t: string; sub: string | null; desde: number }> = ({ t, sub, desde }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - desde, fps, config: { damping: 16 } });
  return (
    <div style={{ position: "absolute", left: 100, top: 60 }}>
      <div style={{ overflow: "hidden" }}><div style={{ fontFamily: S, fontWeight: 800, fontSize: 64, color: ARENA, transform: `translateY(${(1 - e) * 100}%)` }}>{t}</div></div>
      <div style={{ width: 160 * e, height: 5, background: ORO, marginTop: 8 }} />
      {sub ? <div style={{ fontFamily: F, fontWeight: 500, fontSize: 28, color: "rgba(242,232,213,0.75)", marginTop: 10, opacity: e }}>{sub}</div> : null}
    </div>
  );
};

const Pop: React.FC<{ desde: number; children: React.ReactNode; style: React.CSSProperties }> = ({ desde, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - desde, fps, config: { damping: 14 } });
  return <div style={{ ...style, transform: `${style.transform ?? ""} scale(${s})`, opacity: Math.min(1, s * 1.5) }}>{children}</div>;
};

// ---------- 1. Portada ----------
const Portada: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ frame: frame - 2, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontSize: 170, transform: `scale(${e})` }}>🏨</div>
      <div style={{ fontFamily: S, fontWeight: 800, fontSize: 120, color: ARENA, opacity: e, transform: `translateY(${(1 - e) * 50}px)` }}>Apertura de un Hotel Boutique</div>
      <div style={{ fontFamily: F, fontWeight: 600, fontSize: 40, color: ORO, opacity: m(frame, 20, 36) }}>Programación de proyectos con el Método de Ruta Crítica (CPM)</div>
      <div style={{ marginTop: 40, fontFamily: F, fontWeight: 500, fontSize: 30, color: "rgba(242,232,213,0.8)", opacity: m(frame, 40, 56) }}>Trabajo final · Equipo 4 · Licenciatura en Turismo · CUCosta, UdeG</div>
    </AbsoluteFill>
  );
};

// ---------- 2. Introducción ----------
const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const a = W("intro", "35");
  const n35 = Math.round(interpolate(frame, [a, a + 30], [0, 35], clamp));
  return (
    <>
      <Titulo t="Introducción" sub="Descripción del proyecto" desde={ESCENAS.intro.f0} />
      <Pop desde={W("intro", "estudio")} style={{ position: "absolute", left: 160, top: 360, width: 420, padding: 30, borderRadius: 30, background: ARENA, textAlign: "center" }}>
        <div style={{ fontSize: 110 }}>📊</div><div style={{ fontFamily: F, fontWeight: 700, fontSize: 34, color: TINTA }}>Estudio de mercado</div>
      </Pop>
      <div style={{ position: "absolute", left: 600, top: 480, width: 720 * m(frame, W("intro", "inauguracion") - 10, W("intro", "inauguracion") + 10), height: 8, background: ORO }} />
      <Pop desde={W("intro", "inauguracion")} style={{ position: "absolute", left: 1340, top: 360, width: 420, padding: 30, borderRadius: 30, background: ARENA, textAlign: "center" }}>
        <div style={{ fontSize: 110 }}>🎉</div><div style={{ fontFamily: F, fontWeight: 700, fontSize: 34, color: TINTA }}>Inauguración</div>
      </Pop>
      <Pop desde={a} style={{ position: "absolute", left: 610, top: 660, width: 700, textAlign: "center" }}>
        <div style={{ fontFamily: S, fontWeight: 800, fontSize: 140, color: ORO, lineHeight: 1 }}>{n35}</div>
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 38, color: ARENA }}>actividades · duración en semanas · dependencias</div>
      </Pop>
    </>
  );
};

// ---------- 3. Fases ----------
const FASES: [string, string, string, string][] = [
  ["📋", "Planeación y viabilidad", "A, D, G", "planeacion"],
  ["📝", "Permisos y diseño", "B, C, E, F", "permisos"],
  ["🏗️", "Obra e instalaciones", "H a N", "obra"],
  ["🛏️", "Equipamiento y operación", "Q a AD", "equipamiento"],
  ["📣", "Marketing y apertura", "O, P, AE a AI", "marketing"],
];
const Fases: React.FC = () => (
  <>
    <Titulo t="Fases del proyecto" sub="Las 35 actividades en cinco fases" desde={ESCENAS.fases.f0} />
    {FASES.map(([e, t, act, w], i) => (
      <Pop key={i} desde={W("fases", w)} style={{ position: "absolute", left: 100 + i * 352, top: 330, width: 320, height: 440, borderRadius: 30, background: ARENA, textAlign: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
        <div style={{ fontFamily: S, fontWeight: 800, fontSize: 40, color: ORO, marginTop: 24 }}>0{i + 1}</div>
        <div style={{ fontSize: 110 }}>{e}</div>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: TINTA, padding: "0 20px", lineHeight: 1.15 }}>{t}</div>
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 26, color: "#5B6B6C", marginTop: 14 }}>{act}</div>
      </Pop>
    ))}
  </>
);

// ---------- 4. Tabla auxiliar (explicación) ----------
const COLS = ["Act.", "t", "Pred.", "TPI", "TPT", "TUI", "TUT", "Holgura"];
const FILAS = ACTS.slice(0, 14);
const Tabla: React.FC<{ ejemplo: boolean }> = ({ ejemplo }) => {
  const frame = useCurrentFrame();
  const adelante = W("tabla", "adelante");
  const atras = W("tabla", "atras");
  const holg = W("tabla", "holgura");
  const colVisible = (c: number) => (c < 3 ? 1 : c < 5 ? m(frame, adelante, adelante + 12) : c < 7 ? m(frame, atras, atras + 12) : m(frame, holg, holg + 12));
  const anchos = [90, 70, 120, 90, 90, 90, 90, 120];
  const xs = anchos.map((_, i) => anchos.slice(0, i).reduce((a, b) => a + b, 0));
  const fEj = ejemplo ? W("ejemplo", "f") : 1e9;
  const cEj = ejemplo ? W("ejemplo", "cambio") : 1e9;
  const resalta = (id: string) => (ejemplo && frame >= fEj && frame < cEj && ["B", "E", "F"].includes(id)) || (ejemplo && frame >= cEj && id === "C");
  return (
    <>
      <Titulo t="Tabla auxiliar" sub="TPI · TPT · TUI · TUT · Holgura" desde={ESCENAS.tabla.f0} />
      <div style={{ position: "absolute", left: 100, top: 230, width: 760, borderRadius: 20, overflow: "hidden", background: ARENA, boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}>
        <div style={{ position: "relative", height: 52, background: TINTA }}>
          {COLS.map((c, i) => <div key={i} style={{ position: "absolute", left: xs[i], width: anchos[i], top: 0, height: 52, lineHeight: "52px", textAlign: "center", fontFamily: F, fontWeight: 800, fontSize: 22, color: i >= 3 && i <= 4 ? "#7FD1AE" : i >= 5 && i <= 6 ? "#FFB37A" : i === 7 ? ORO : ARENA, opacity: colVisible(i) }}>{c}</div>)}
        </div>
        {FILAS.map((a, r) => {
          const vals = [a.id, a.t, a.pred.join(", ") || "—", a.tpi, a.tpt, a.tui, a.tut, a.h];
          return (
            <div key={r} style={{ position: "relative", height: 46, background: resalta(a.id) ? "#FFE3A3" : r % 2 ? "#EADFC9" : ARENA }}>
              {vals.map((v, i) => <div key={i} style={{ position: "absolute", left: xs[i], width: anchos[i], top: 0, height: 46, lineHeight: "46px", textAlign: "center", fontFamily: F, fontWeight: i === 0 || i === 7 ? 800 : 600, fontSize: 22, color: i === 7 && a.h === 0 ? ROJO : TINTA, opacity: colVisible(i) }}>{v}</div>)}
            </div>
          );
        })}
      </div>
      {/* Explicación de las fórmulas */}
      <div style={{ position: "absolute", left: 940, top: 240, width: 880, display: "flex", flexDirection: "column", gap: 22 }}>
        <Pop desde={adelante} style={{ padding: "22px 30px", borderRadius: 24, background: "rgba(127,209,174,0.15)", border: "2px solid #7FD1AE" }}>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: "#7FD1AE" }}>➡️ Hacia adelante</div>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 28, color: ARENA }}>TPI = mayor TPT de las predecesoras · TPT = TPI + t</div>
        </Pop>
        <Pop desde={atras} style={{ padding: "22px 30px", borderRadius: 24, background: "rgba(255,179,122,0.15)", border: "2px solid #FFB37A" }}>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: "#FFB37A" }}>⬅️ Hacia atrás</div>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 28, color: ARENA }}>TUT = menor TUI de las sucesoras · TUI = TUT − t</div>
        </Pop>
        <Pop desde={holg} style={{ padding: "22px 30px", borderRadius: 24, background: "rgba(212,162,76,0.15)", border: `2px solid ${ORO}` }}>
          <div style={{ fontFamily: F, fontWeight: 800, fontSize: 34, color: ORO }}>⏳ Holgura = TUT − TPT</div>
          <div style={{ fontFamily: F, fontWeight: 600, fontSize: 28, color: ARENA }}>Holgura 0 = actividad crítica</div>
        </Pop>
        {ejemplo && frame >= fEj && frame < cEj ? (
          <Pop desde={fEj} style={{ padding: "22px 30px", borderRadius: 24, background: ARENA }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: TINTA }}>Ejemplo · F (aprobación de planos)</div>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 28, color: TINTA }}>B termina en 6 · E termina en 9 → <span style={{ color: ROJO, fontWeight: 800 }}>TPI = 9</span> · TPT = 9 + 2 = 11</div>
          </Pop>
        ) : null}
        {ejemplo && frame >= cEj ? (
          <Pop desde={cEj} style={{ padding: "22px 30px", borderRadius: 24, background: ARENA }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 30, color: TINTA }}>C · Licencia turística y uso de suelo</div>
            <div style={{ fontFamily: F, fontWeight: 600, fontSize: 28, color: TINTA }}>TUT 35 − TPT 5 = <span style={{ color: AZUL, fontWeight: 800 }}>30 semanas de holgura</span></div>
          </Pop>
        ) : null}
      </div>
    </>
  );
};

// ---------- 5. Diagrama de red ----------
const ORDEN_COL: Record<number, string[]> = { 1: ["A"], 2: ["O", "G", "D", "B", "C"], 3: ["P", "E"], 4: ["F"], 5: ["H"], 6: ["I", "Y"], 7: ["J"], 8: ["K", "L"], 9: ["M"], 10: ["N"], 11: ["U", "V", "Q", "R", "S", "T", "AD"], 12: ["AF", "W", "X", "Z", "AA", "AC"], 13: ["AH", "AE", "AB"], 14: ["AG"], 15: ["AI"] };
const POS: Record<string, { x: number; y: number }> = (() => {
  const p: Record<string, { x: number; y: number }> = { INICIO: { x: 70, y: 580 }, FIN: { x: 1850, y: 580 } };
  for (const [c, ids] of Object.entries(ORDEN_COL)) ids.forEach((id, k) => (p[id] = { x: 70 + Number(c) * 107, y: 580 + (k - (ids.length - 1) / 2) * 104 }));
  return p;
})();
const Red: React.FC<{ ruta: boolean }> = ({ ruta }) => {
  const frame = useCurrentFrame();
  const f0 = ESCENAS.red.f0;
  const dibuja = (lvl: number) => m(frame, f0 + 20 + lvl * 9, f0 + 34 + lvl * 9);
  const rojo = m(frame, W("red", "rojo") - 20, W("red", "rojo") + 10);
  const aristas: { a: string; b: string; crit: boolean; lvl: number }[] = [];
  for (const x of ACTS) {
    if (x.pred.length === 0) aristas.push({ a: "INICIO", b: x.id, crit: x.h === 0, lvl: 0 });
    for (const p of x.pred) aristas.push({ a: p, b: x.id, crit: x.h === 0 && ACTS.find((q) => q.id === p)!.h === 0 && ACTS.find((q) => q.id === p)!.tpt === x.tpi, lvl: x.lvl - 1 });
  }
  aristas.push({ a: "AI", b: "FIN", crit: true, lvl: 15 });
  // En la escena de la ruta crítica, un punto recorre la ruta.
  const CR = ["INICIO", "A", "D", "E", "F", "H", "I", "J", "K", "M", "N", "Q", "W", "AE", "AG", "AI", "FIN"];
  const prog = ruta ? interpolate(frame, [ESCENAS.ruta.f0 + 10, W("ruta", "inauguracion") + 10], [0, CR.length - 1], clamp) : -1;
  const seg = Math.floor(prog);
  const pa = POS[CR[Math.max(0, Math.min(seg, CR.length - 2))]];
  const pb = POS[CR[Math.max(1, Math.min(seg + 1, CR.length - 1))]];
  const fr = prog - seg;
  return (
    <>
      <Titulo t={ruta ? "Ruta crítica" : "Diagrama de red"} sub={ruta ? "18 actividades con holgura 0 · 38 semanas" : "Nodos de INICIO a FIN · ruta crítica en rojo"} desde={ruta ? ESCENAS.ruta.f0 : f0} />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {aristas.map((e, i) => {
          const A = POS[e.a], B = POS[e.b];
          const d = dibuja(e.lvl);
          const color = e.crit && (rojo > 0.5 || ruta) ? ROJO : "rgba(242,232,213,0.35)";
          return <line key={i} x1={A.x} y1={A.y} x2={A.x + (B.x - A.x) * d} y2={A.y + (B.y - A.y) * d} stroke={color} strokeWidth={e.crit && (rojo > 0.5 || ruta) ? 5 : 2} />;
        })}
      </svg>
      {Object.entries(POS).map(([id, p]) => {
        const act = ACTS.find((a) => a.id === id);
        const crit = !act || act.h === 0;
        const lvl = act ? act.lvl : id === "INICIO" ? 0 : 16;
        const e = dibuja(lvl);
        const esExtremo = !act;
        const marcada = crit && (rojo > 0.5 || ruta);
        return (
          <div key={id} style={{ position: "absolute", left: p.x - (esExtremo ? 50 : 38), top: p.y - 30, width: esExtremo ? 100 : 76, height: 60, borderRadius: 12, background: marcada ? ROJO : act ? "#2C6E8F" : ORO, border: `2px solid ${marcada ? "#FFD0D3" : "rgba(242,232,213,0.5)"}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${e})`, boxShadow: marcada ? "0 0 20px rgba(230,57,70,0.7)" : "none" }}>
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: esExtremo ? 18 : 24, color: "#fff", lineHeight: 1 }}>{id}</div>
            {act ? <div style={{ fontFamily: F, fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.85)" }}>H {act.h}</div> : null}
          </div>
        );
      })}
      {ruta && prog >= 0 ? <div style={{ position: "absolute", left: pa.x + (pb.x - pa.x) * fr - 16, top: pa.y + (pb.y - pa.y) * fr - 16, width: 32, height: 32, borderRadius: 16, background: ORO, boxShadow: `0 0 30px ${ORO}` }} /> : null}
      <div style={{ position: "absolute", left: 100, bottom: 150, display: "flex", gap: 30, fontFamily: F, fontWeight: 600, fontSize: 24, color: ARENA, opacity: m(frame, W("red", "rojo"), W("red", "rojo") + 12) }}>
        <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 6, background: ROJO, verticalAlign: "middle", marginRight: 8 }} />Crítica (holgura 0)</span>
        <span><span style={{ display: "inline-block", width: 22, height: 22, borderRadius: 6, background: "#2C6E8F", verticalAlign: "middle", marginRight: 8 }} />Con holgura</span>
      </div>
    </>
  );
};

// ---------- 7. Gantt ----------
const Gantt: React.FC = () => {
  const frame = useCurrentFrame();
  const f0 = ESCENAS.gantt.f0;
  const X0 = 300, ANCHO = 1520, SEM = ANCHO / 38, Y0 = 262, ALTO = 17;
  const tramos: [number, number, string, string][] = [[0, 14, "Planeación, permisos y diseño", "14"], [14, 29, "Obra e instalaciones", "15"], [29, 38, "Equipamiento, personal, marketing e inauguración", "30"]];
  return (
    <>
      <Titulo t="Gráfica de Gantt" sub="Calendario semanal · 35 actividades · 38 semanas" desde={f0} />
      {tramos.map(([a, b, t, w], i) => {
        const on = m(frame, W("gantt", w), W("gantt", w) + 10);
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: X0 + a * SEM, top: Y0 - 10, width: (b - a) * SEM, height: 35 * ALTO + 20, background: ["rgba(127,209,174,0.12)", "rgba(255,179,122,0.12)", "rgba(212,162,76,0.14)"][i], opacity: on }} />
            <div style={{ position: "absolute", left: X0 + a * SEM, top: Y0 + 35 * ALTO + 18, width: (b - a) * SEM, textAlign: "center", fontFamily: F, fontWeight: 700, fontSize: 20, color: ARENA, opacity: on }}>Semanas {a + 1}–{b} · {t}</div>
          </div>
        );
      })}
      {Array.from({ length: 38 }).map((_, s) => <div key={s} style={{ position: "absolute", left: X0 + s * SEM, top: Y0 - 34, width: SEM, textAlign: "center", fontFamily: F, fontWeight: 600, fontSize: 14, color: "rgba(242,232,213,0.7)" }}>{s + 1}</div>)}
      {ACTS.map((a, r) => {
        const crece = m(frame, f0 + 15 + a.tpi * 4, f0 + 30 + a.tpi * 4);
        return (
          <div key={a.id}>
            <div style={{ position: "absolute", left: X0 - 200, top: Y0 + r * ALTO, width: 190, height: ALTO, textAlign: "right", fontFamily: F, fontWeight: 600, fontSize: 13, color: a.h === 0 ? "#FFB3B8" : ARENA, whiteSpace: "nowrap", overflow: "hidden" }}>{a.id} · {a.desc.split(" ").slice(0, 3).join(" ")}</div>
            {a.h > 0 ? <div style={{ position: "absolute", left: X0 + a.tpt * SEM, top: Y0 + r * ALTO + 7, width: a.h * SEM * crece, height: 6, borderRadius: 3, background: "rgba(76,141,255,0.35)" }} /> : null}
            <div style={{ position: "absolute", left: X0 + a.tpi * SEM, top: Y0 + r * ALTO + 3, width: Math.max(2, a.t * SEM * crece - 2), height: ALTO - 6, borderRadius: 5, background: a.h === 0 ? ROJO : AZUL }} />
          </div>
        );
      })}
      <div style={{ position: "absolute", right: 100, top: 70, display: "flex", gap: 24, fontFamily: F, fontWeight: 600, fontSize: 22, color: ARENA }}>
        <span><span style={{ display: "inline-block", width: 22, height: 14, borderRadius: 4, background: ROJO, marginRight: 8 }} />Crítica</span>
        <span><span style={{ display: "inline-block", width: 22, height: 14, borderRadius: 4, background: AZUL, marginRight: 8 }} />Con holgura</span>
        <span><span style={{ display: "inline-block", width: 22, height: 6, borderRadius: 3, background: "rgba(76,141,255,0.5)", marginRight: 8, verticalAlign: "middle" }} />Holgura</span>
      </div>
    </>
  );
};

// ---------- 8. Conclusión ----------
const Conclusion: React.FC = () => {
  const frame = useCurrentFrame();
  const a = W("conclusion", "38");
  return (
    <>
      <Titulo t="Conclusiones" sub={null} desde={ESCENAS.conclusion.f0} />
      <Pop desde={a} style={{ position: "absolute", left: 100, top: 250, width: 520, height: 520, borderRadius: 40, background: ARENA, textAlign: "center" }}>
        <div style={{ fontSize: 100, marginTop: 40 }}>🏨</div>
        <div style={{ fontFamily: S, fontWeight: 800, fontSize: 170, color: ROJO, lineHeight: 1 }}>{Math.round(interpolate(frame, [a, a + 30], [0, 38], clamp))}</div>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 40, color: TINTA }}>semanas para abrir</div>
      </Pop>
      <Pop desde={W("conclusion", "obra")} style={{ position: "absolute", left: 680, top: 250, width: 1140, padding: "28px 36px", borderRadius: 30, background: "rgba(230,57,70,0.15)", border: `2px solid ${ROJO}` }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 36, color: "#FFB3B8" }}>🏗️ Obra (J → N): el tramo más largo</div>
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 30, color: ARENA }}>15 semanas seguidas dentro de la ruta crítica (semanas 15 a 29)</div>
      </Pop>
      <Pop desde={W("conclusion", "holgura")} style={{ position: "absolute", left: 680, top: 480, width: 1140, padding: "28px 36px", borderRadius: 30, background: "rgba(76,141,255,0.15)", border: `2px solid ${AZUL}` }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 36, color: "#A9C8FF" }}>⏳ Mayor holgura: margen para mover recursos</div>
        <div style={{ fontFamily: F, fontWeight: 600, fontSize: 30, color: ARENA }}>C licencia turística (30) · O y P imagen de marca (26) · Y personal operativo (21)</div>
      </Pop>
      <div style={{ position: "absolute", left: 680, top: 720, fontFamily: S, fontWeight: 800, fontSize: 70, color: ORO, opacity: m(frame, W("conclusion", "gracias"), W("conclusion", "gracias") + 12) }}>¡Muchas gracias!</div>
    </>
  );
};

const Subtitulos: React.FC = () => {
  const frame = useCurrentFrame();
  const todas = ORDEN.flatMap((k) => ESCENAS[k].words);
  const i = todas.findIndex(([, f], k) => frame >= f && (k === todas.length - 1 || frame < todas[k + 1][1]));
  if (i < 0 || frame > todas[i][1] + 45) return null;
  const inicio = Math.floor(i / 14) * 14;
  return (
    <div style={{ position: "absolute", left: 160, right: 160, bottom: 34, display: "flex", justifyContent: "center" }}>
      <div style={{ padding: "10px 24px", borderRadius: 18, background: "rgba(0,0,0,0.55)", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 10px" }}>
        {todas.slice(inicio, inicio + 14).map(([w, f], k) => <span key={k} style={{ fontFamily: F, fontWeight: 600, fontSize: 30, color: k + inicio === i ? ORO : frame >= f ? "#fff" : "rgba(255,255,255,0.4)" }}>{w}</span>)}
      </div>
    </div>
  );
};

export const HotelCPM: React.FC = () => {
  const frame = useCurrentFrame();
  const k = ORDEN.filter((x) => frame >= ESCENAS[x].f0 - 10).pop() ?? "portada";
  const ini = ESCENAS[k].f0 - 10;
  const entra = k === "portada" ? 1 : m(frame, ini, ini + 14);
  const vista = (() => {
    switch (k) {
      case "portada": return <Portada />;
      case "intro": return <Intro />;
      case "fases": return <Fases />;
      case "tabla": return <Tabla ejemplo={false} />;
      case "ejemplo": return <Tabla ejemplo />;
      case "red": return <Red ruta={false} />;
      case "ruta": return <Red ruta />;
      case "gantt": return <Gantt />;
      default: return <Conclusion />;
    }
  })();
  // la tabla continúa en el ejemplo, y el diagrama continúa en la ruta crítica: sin corte entre ellas
  const continua = k === "ejemplo" || k === "ruta";
  return (
    <AbsoluteFill>
      <Fondo />
      <AbsoluteFill style={{ opacity: continua ? 1 : entra, transform: `translateX(${continua ? 0 : (1 - entra) * 60}px)` }}>{vista}</AbsoluteFill>
      <Subtitulos />
      <Audio src={staticFile("voz-hotel.mp3")} />
      <Audio src={staticFile("musica-radar.mp3")} loop volume={(f) => 0.06 * interpolate(f, [0, 20, DURACION_HOTEL - 60, DURACION_HOTEL], [0, 1, 1, 0], clamp)} />
      {ORDEN.filter((x) => x !== "portada" && x !== "ejemplo" && x !== "ruta").map((x) => (
        <Sequence key={x} from={ESCENAS[x].f0 - 10} durationInFrames={40}><Audio src={staticFile("sfx/whoosh.wav")} volume={0.2} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
