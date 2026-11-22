import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ANTON, DEGRADADO, POPPINS, ROJO_DA } from "../doctor-auto/constantes";
import { AcabadoPremium, Estudio, TituloMascara } from "../doctor-auto/premium";
import { ChipVidrio, Destello } from "../doctor-auto/pro";
import { Escena } from "./Escenas";

// Plantilla de educativos con la estructura de 8 piezas (CLAUDE.md): gancho, introducción,
// cuerpo 1, bucle, cuerpo 2, bucle, cuerpo 3, CTA. Clips reales a pantalla completa con
// movimiento constante, números grandes por punto, bucles sobre fondo de estudio con riser,
// y un sonido para cada cosa que entra.

export type Plano = { t0: number; t1: number; clip?: string; escena?: string; desde?: number; pos?: string; vel?: number };
export type Titulo = { t0: number; t1: number; texto: string; resaltar: string[]; tam?: number; lugar?: "arriba" | "centro" | "abajo" };
export type Numero = { t: number; n: number };
export type Grafico = { t0: number; t1: number; tipo: string; ver?: number; o?: number[] };
export type Tip = {
  voz: string;
  dur: number;
  planos: Plano[];
  titulos: Titulo[];
  numeros: Numero[];
  bucles: number[]; // inicio de cada bucle (para el riser)
  graficos: Grafico[];
  cta: { t: number; chip: string };
  tDato?: number; // pago final (ding)
};

const lim = (x: number) => Math.max(0, Math.min(1, x));
const resorte = (frame: number, fps: number, t0: number, damping = 12, stiffness = 220) =>
  frame < t0 * fps ? 0 : spring({ frame: frame - Math.round(t0 * fps), fps, config: { damping, stiffness } });

const PlanoVideo: React.FC<{ p: Plano; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const k = lim(l / (p.t1 - p.t0));
  const entra = Math.max(0, 1 - l / 0.2);
  return (
    <AbsoluteFill style={{ transform: `scale(${(1.05 + 0.12 * k) * (1 + 0.12 * entra)})`, filter: `blur(${entra * entra * 14}px) contrast(1.1) saturate(1.15)` }}>
      <OffthreadVideo src={staticFile(`mixkit/${p.clip}.mp4`)} muted playbackRate={p.vel ?? 1} startFrom={Math.round((p.desde ?? 0) * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos ?? "50% 50%" }} />
    </AbsoluteFill>
  );
};

// Escena animada: entra con un zoom suave y queda con una leve deriva de cámara.
const PlanoEscena: React.FC<{ p: Plano; t: number }> = ({ p, t }) => {
  const l = t - p.t0;
  const d = p.t1 - p.t0;
  const entra = Math.max(0, 1 - l / 0.25);
  return (
    <AbsoluteFill style={{ transform: `scale(${(1 + 0.04 * lim(l / d)) * (1 + 0.08 * entra)})`, filter: `blur(${entra * entra * 10}px)` }}>
      <Escena nombre={p.escena!} l={l} d={d} t={t} />
    </AbsoluteFill>
  );
};

// ---- gráficos especiales ----
const Pieza: React.FC<{ texto: string; etiqueta: string; t: number; t0: number; frame: number; fps: number; color?: string }> = ({ texto, etiqueta, t, t0, frame, fps, color }) => {
  const e = resorte(frame, fps, t0, 11, 240);
  const on = t >= t0;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ fontFamily: ANTON, fontSize: 150, lineHeight: 1, color: on ? "#fff" : "rgba(255,255,255,0.35)", background: on ? color ?? DEGRADADO : "transparent", padding: "4px 18px 10px", borderRadius: 18, transform: `scale(${on ? 1 + 0.15 * (1 - e) : 1})` }}>{texto}</div>
      <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 30, color: "#fff", opacity: e, transform: `translateY(${(1 - e) * 20}px)`, textAlign: "center", width: 300 }}>{etiqueta}</div>
    </div>
  );
};

const Graficos: React.FC<{ g: Grafico; t: number; frame: number; fps: number }> = ({ g, t, frame, fps }) => {
  const caja: React.CSSProperties = { background: "rgba(10,10,14,0.82)", border: "2px solid rgba(255,255,255,0.18)", borderRadius: 32, padding: "40px 40px 36px", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" };
  const entra = resorte(frame, fps, g.ver ?? g.t0, 14, 180);
  const o = g.o ?? (g.tipo === "llanta" ? [0, 2.6, 5.4] : [2.2, 3.4]);
  const envoltura = (hijos: React.ReactNode) => (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", paddingTop: 240 }}>
      <div style={{ ...caja, transform: `scale(${0.85 + 0.15 * entra})`, opacity: entra }}>{hijos}</div>
    </AbsoluteFill>
  );
  if (g.tipo === "llanta")
    return envoltura(
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <Pieza texto="205" etiqueta="ancho en mm" t={t} t0={g.t0 + o[0]} frame={frame} fps={fps} />
        <div style={{ fontFamily: ANTON, fontSize: 150, color: "rgba(255,255,255,0.5)" }}>/</div>
        <Pieza texto="55" etiqueta="altura: 55% del ancho" t={t} t0={g.t0 + o[1]} frame={frame} fps={fps} />
        <Pieza texto="R16" etiqueta="radial, rin de 16”" t={t} t0={g.t0 + o[2]} frame={frame} fps={fps} />
      </div>
    );
  if (g.tipo === "dot")
    return envoltura(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: 110, color: "rgba(255,255,255,0.6)" }}>DOT ··· </div>
          <Pieza texto="23" etiqueta="semana 23" t={t} t0={g.t0 + o[0]} frame={frame} fps={fps} />
          <Pieza texto="21" etiqueta="año 2021" t={t} t0={g.t0 + o[1]} frame={frame} fps={fps} color="#2f6fe0" />
        </div>
      </div>
    );
  if (g.tipo === "repuve")
    return envoltura(
      <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 18 }}>
        <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 40, color: "#fff" }}>Consulta pública REPUVE</div>
        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "16px 22px", fontFamily: POPPINS, fontSize: 34, color: "rgba(255,255,255,0.85)" }}>Placa o NIV: ABC-123-D</div>
        <div style={{ background: "#1f9d55", borderRadius: 14, padding: "16px 22px", fontFamily: POPPINS, fontWeight: 800, fontSize: 38, color: "#fff", transform: `scale(${resorte(frame, fps, g.t0 + 1.2, 10, 260)})` }}>✓ Sin reporte de robo</div>
      </div>
    );
  if (g.tipo === "factura")
    return envoltura(
      <div style={{ width: 760, display: "flex", flexDirection: "column", gap: 16 }}>
        {["Factura original", "Tenencias pagadas", "Sin multas"].map((x, i) => {
          const e = resorte(frame, fps, g.t0 + 0.4 + i * 0.5, 11, 260);
          return (
            <div key={x} style={{ display: "flex", alignItems: "center", gap: 18, opacity: lim(e * 2), transform: `translateX(${(1 - e) * -60}px)` }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: "#1f9d55", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, color: "#fff", fontWeight: 900 }}>✓</div>
              <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 46, color: "#fff" }}>{x}</div>
            </div>
          );
        })}
      </div>
    );
  if (g.tipo === "tiempo")
    return envoltura(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, color: "rgba(255,255,255,0.8)" }}>Lo que necesita tu motor</div>
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <div style={{ fontFamily: ANTON, fontSize: 120, color: "rgba(255,255,255,0.45)", textDecoration: "line-through", textDecorationColor: "#ff4d55" }}>10 MIN</div>
          <div style={{ fontFamily: ANTON, fontSize: 130, color: "#fff", background: DEGRADADO, padding: "0 20px 6px", borderRadius: 18, transform: `scale(${resorte(frame, fps, g.t0 + 1.0, 10, 240)})` }}>30–60 S</div>
        </div>
      </div>
    );
  if (g.tipo === "presion")
    return envoltura(
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <svg width={300} height={300} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="18" />
          <circle cx="100" cy="100" r="80" fill="none" stroke="#ff4d55" strokeWidth="18" strokeDasharray={`${502 * interpolate(t, [g.t0, g.t0 + 1.5], [0.75, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} 502`} transform="rotate(-90 100 100)" strokeLinecap="round" />
          <text x="100" y="112" textAnchor="middle" fontFamily={ANTON} fontSize="44" fill="#fff">PSI ↓</text>
        </svg>
        <div style={{ fontFamily: POPPINS, fontWeight: 800, fontSize: 40, color: "#fff" }}>Menos presión = más esfuerzo</div>
      </div>
    );
  return null;
};

export const Tips8: React.FC<{ tip: Tip }> = ({ tip }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const marca = resorte(frame, fps, 0.1);
  const cortes = tip.planos.slice(1).map((p) => p.t0);
  const enBucle = tip.planos.some((p) => !p.clip && !p.escena && t >= p.t0 && t < p.t1);
  const enEscena = tip.planos.some((p) => !!p.escena && t >= p.t0 && t < p.t1);
  const flashGancho = Math.max(0, 1 - t / 0.25);
  const sfx: [number, string, number][] = [
    [0.0, "sfx/kit/fahhh.mp3", 0.45],
    [0.08, "sfx/hit.wav", 0.45],
    ...tip.numeros.map((n): [number, string, number] => [n.t, "sfx/mk-hit.wav", 0.4]),
    ...tip.titulos.filter((x) => x.t0 > 0.5).map((x): [number, string, number] => [x.t0 + 0.07, "sfx/kit/click.wav", 0.4]),
    ...tip.bucles.map((b): [number, string, number] => [Math.max(0, b - 1.2), "sfx/riser.wav", 0.35]),
    ...tip.graficos.map((g): [number, string, number] => [(g.ver ?? g.t0) + 0.03, "sfx/mk-pop.wav", 0.4]),
    ...(tip.tDato ? [[tip.tDato, "sfx/ding.wav", 0.45] as [number, string, number]] : []),
    [tip.cta.t, "sfx/kit/magic.mp3", 0.5],
  ];
  return (
    <AbsoluteFill style={{ backgroundColor: "#07080b" }}>
      {tip.planos.map((p, i) => (
        <Sequence key={i} from={Math.round(p.t0 * fps)} durationInFrames={Math.round((p.t1 - p.t0) * fps)}>
          {p.escena ? <PlanoEscena p={p} t={t} /> : p.clip ? <PlanoVideo p={p} t={t} /> : <Estudio t={t} tono={["#1a0b10", "#050507"]} acento={ROJO_DA} />}
        </Sequence>
      ))}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 62%, rgba(0,0,0,0.75) 100%)" }} />
      <Destello t={t} cortes={cortes} />

      {tip.graficos.map((g, i) => (t >= (g.ver ?? g.t0) && t < g.t1 ? <Graficos key={i} g={g} t={t} frame={frame} fps={fps} /> : null))}

      {/* número grande del punto */}
      {tip.numeros.map((n, i) => {
        const fin = tip.numeros[i + 1]?.t ?? tip.cta.t;
        if (t < n.t || t >= fin || enBucle) return null;
        const e = resorte(frame, fps, n.t, 10, 220);
        return (
          <AbsoluteFill key={i} style={{ alignItems: "flex-start", justifyContent: "flex-start", padding: "230px 0 0 60px" }}>
            <div style={{ transform: `scale(${interpolate(e, [0, 1], [2.2, 1])}) rotate(-6deg)`, opacity: lim(e * 3), width: 170, height: 170, borderRadius: 40, background: DEGRADADO, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ANTON, fontSize: 130, color: "#fff", boxShadow: "0 20px 60px rgba(204,35,40,0.6)" }}>{n.n}</div>
          </AbsoluteFill>
        );
      })}

      {tip.titulos.map((x, i) => {
        if (t < x.t0 || t > x.t1 + 0.4) return null;
        const lugar = x.lugar ?? "abajo";
        const estilo: React.CSSProperties =
          lugar === "arriba" || (lugar === "centro" && enEscena) ? { alignItems: "center", paddingTop: 250 } : lugar === "centro" ? { alignItems: "center", justifyContent: "center" } : { alignItems: "center", justifyContent: "flex-end", paddingBottom: 300 };
        return (
          <AbsoluteFill key={i} style={estilo}>
            <div style={{ width: 960 }}>
              <TituloMascara texto={x.texto} resaltar={x.resaltar} t={t} t0={x.t0} t1={x.t1} tamano={x.tam ?? (enBucle ? 110 : 84)} />
            </div>
          </AbsoluteFill>
        );
      })}

      <ChipVidrio t={t} t0={tip.cta.t + 0.5} t1={99} texto={tip.cta.chip} x={150} y={1500} tamano={40} />

      <AbsoluteFill style={{ alignItems: "center", paddingTop: 150 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: marca }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: ROJO_DA, boxShadow: "0 0 18px rgba(204,35,40,0.9)" }} />
          <div style={{ fontFamily: POPPINS, fontWeight: 700, fontSize: 34, letterSpacing: "0.32em", color: "rgba(255,255,255,0.92)" }}>DOCTOR AUTO</div>
        </div>
      </AbsoluteFill>

      <AcabadoPremium frame={frame} calidez={0.6} />
      {flashGancho > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flashGancho * 0.6 }} /> : null}

      <Audio src={staticFile(tip.voz)} />
      <Audio
        src={staticFile("musica.mp3")}
        loop
        volume={(f) => {
          const s = f / fps;
          const base = s < 1 || s > tip.dur ? 0.18 : 0.08;
          return base * interpolate(s, [0, 0.5, tip.dur + 0.4, tip.dur + 1.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        }}
      />
      {cortes.map((c) => (
        <Sequence key={c} from={Math.max(0, Math.round((c - 0.06) * fps))} durationInFrames={20}>
          <Audio src={staticFile("sfx/kit/whoosh.wav")} volume={0.16} />
        </Sequence>
      ))}
      {sfx.map(([s, src, v], i) => (
        <Sequence key={i} from={Math.round(s * fps)} durationInFrames={75}>
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
