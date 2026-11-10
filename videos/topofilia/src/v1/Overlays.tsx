import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, C, DISPLAY} from '../theme';
import {cue, FPS, sceneOf} from './data';
import {
	Abs,
	BigNumber,
	Counter,
	Glass,
	Headline,
	Iris,
	Label,
	MaskLine,
	Pill,
	Pop,
	Red,
	Source,
	useSpringAt,
	Wipe,
} from './ui';

/** Seconds where a scene's elements leave (chain exit) and its hero collapses. */
const ends = (id: string) => {
	const d = sceneOf(id).duration / FPS;
	return {exit: d - 0.6, collapse: d - 0.36};
};
/** When the incoming hero grows out of the travelling dot. */
const ENTER = 0.22;

/**
 * Screen positions (px) where each hero collapses into a dot and where the
 * next one grows from. The dot travelling between them is drawn by <Bridge/>.
 */
export const BRIDGE_POINTS: Record<string, {from: [number, number]; to: [number, number]}> = {
	'hook-pin': {from: [392, 786], to: [540, 900]},
	hook: {from: [540, 900], to: [172, 325]},
	global: {from: [972, 768], to: [104, 227]},
	vallarta: {from: [462, 765], to: [166, 414]},
	study: {from: [540, 695], to: [294, 400]},
	findings: {from: [108, 626], to: [128, 340]},
	effects: {from: [712, 625], to: [104, 227]},
	zones: {from: [172, 430], to: [166, 383]},
};
export const HOOK_CARD_COLLAPSE = 5.9;

const Check: React.FC = () => (
	<svg width="34" height="34" viewBox="0 0 24 24">
		<path d="M4 12.5l5 5L20 6.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const Arrow: React.FC<{size?: number}> = ({size = 40}) => (
	<svg width={size} height={size} viewBox="0 0 24 24">
		<path d="M12 20V5M5 11l7-7 7 7" stroke={C.redGlow} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

/** Scale punch when a number lands on its final value. */
const usePunch = (sec: number) => {
	const p = useSpringAt(sec, {damping: 9, stiffness: 220, mass: 0.5});
	return 1 + Math.sin(Math.min(1, p) * Math.PI) * 0.09;
};

/* 1 · Hook ------------------------------------------------------------- */
export const HookOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = (w: string, n = 0) => cue('hook', w, n);
	const {exit} = ends('hook');
	const pressAt = c('reservas');
	const booked = frame >= (pressAt + 0.1) * fps;
	const press = interpolate(frame, [pressAt * fps - 3, pressAt * fps + 2, pressAt * fps + 8], [1, 0.9, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill>
			<Abs x={72} y={200}>
				<MaskLine at={0.1} out={HOOK_CARD_COLLAPSE}>
					<Pill>Serie investigación · 01/03</Pill>
				</MaskLine>
			</Abs>
			<Abs x={72} y={290} w={640}>
				<Iris origin="50% 85.8%" collapseAt={HOOK_CARD_COLLAPSE}>
					<Wipe at={0.3} dir="up">
						<Glass style={{padding: 0, overflow: 'hidden'}}>
							<div
								style={{
									height: 300,
									background:
										'linear-gradient(180deg, #F59E5B 0%, #E5604A 38%, #6B3E73 62%, #123B5A 63%, #0B2A44 100%)',
									position: 'relative',
								}}
							>
								<div
									style={{
										position: 'absolute',
										left: '50%',
										top: 120,
										width: 120,
										height: 120,
										marginLeft: -60,
										borderRadius: 99,
										background: '#FFD38A',
										boxShadow: '0 0 80px #FFB36B',
									}}
								/>
								<div style={{position: 'absolute', left: 0, right: 0, top: 189, height: 111, background: 'linear-gradient(180deg,#14476b,#0a2740)'}} />
								<div
									style={{
										position: 'absolute',
										top: 22,
										right: 22,
										padding: '8px 18px',
										borderRadius: 99,
										background: 'rgba(0,0,0,0.45)',
										color: '#fff',
										fontFamily: BODY,
										fontWeight: 700,
										fontSize: 24,
									}}
								>
									<svg width="22" height="22" viewBox="0 0 24 24" style={{marginRight: 8, verticalAlign: -2}}>
										<path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="#FFD38A" />
									</svg>
									4.9
								</div>
							</div>
							<div style={{padding: '30px 36px 36px'}}>
								<MaskLine at={c('depa')}>
									<Label size={42} style={{fontWeight: 700}}>Depa frente al mar</Label>
								</MaskLine>
								<MaskLine at={c('Puerto')} style={{marginTop: 8}}>
									<Label size={28} style={{color: C.muted}}>Puerto Vallarta · 2 noches</Label>
								</MaskLine>
								<div
									style={{
										marginTop: 28,
										height: 92,
										borderRadius: 24,
										background: booked ? '#1FAF6A' : C.red,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: 14,
										transform: `scale(${press})`,
										color: '#fff',
										fontFamily: BODY,
										fontWeight: 800,
										fontSize: 36,
									}}
								>
									{booked ? (
										<>
											<Check /> Reservado
										</>
									) : (
										'Reservar'
									)}
								</div>
							</div>
						</Glass>
					</Wipe>
				</Iris>
			</Abs>
			<Abs x={72} y={290}>
				<Headline size={100}>
					<MaskLine at={c('qué')} out={exit}>¿Qué pasa con</MaskLine>
					<MaskLine at={c('el')} out={exit + 0.06}>
						el <Red>barrio</Red>
					</MaskLine>
					<MaskLine at={c('donde')} out={exit + 0.12}>donde te</MaskLine>
					<MaskLine at={c('quedar')} out={exit + 0.18}>quedas?</MaskLine>
				</Headline>
			</Abs>
		</AbsoluteFill>
	);
};

/* 2 · Global growth ----------------------------------------------------- */
export const GlobalOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = (w: string, n = 0) => cue('global', w, n);
	const {exit, collapse} = ends('global');
	const tSecond = c('2025');
	const tEight = c('8');
	const bar = interpolate(frame, [c('2') * fps, c('millones') * fps, tSecond * fps, tEight * fps], [0, 0.25, 0.25, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const punch = usePunch(tEight);
	return (
		<AbsoluteFill>
			<Abs x={72} y={200}>
				<MaskLine at={0.1} out={exit}>
					<Pill>En el mundo</Pill>
				</MaskLine>
			</Abs>
			<Abs x={72} y={290} w={300}>
				<Iris origin="33% 50%" expandAt={ENTER}>
					<div style={{position: 'relative', height: 76, fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.redGlow}}>
						<MaskLine at={ENTER} out={tSecond - 0.1} style={{position: 'absolute'}}>2016</MaskLine>
						<MaskLine at={tSecond} out={exit + 0.04} style={{position: 'absolute'}}>2025</MaskLine>
					</div>
				</Iris>
			</Abs>
			<Abs x={72} y={380} w={900}>
				<div style={{position: 'relative', height: 240}}>
					<MaskLine at={c('2')} out={tSecond - 0.05} style={{position: 'absolute'}}>
						<BigNumber size={230}>2M</BigNumber>
					</MaskLine>
					<MaskLine at={tSecond + 0.1} out={exit + 0.08} style={{position: 'absolute'}}>
						<div style={{transform: `scale(${punch})`, transformOrigin: 'left center'}}>
							<BigNumber size={230}>
								+<Counter from={3} to={8} start={tSecond + 0.1} end={tEight} format={(n) => `${Math.round(n)}M`} />
							</BigNumber>
						</div>
					</MaskLine>
				</div>
			</Abs>
			<Abs x={680} y={450}>
				<Pop at={tEight + 0.15} out={exit + 0.1}>
					<div
						style={{
							transform: 'rotate(-6deg)',
							padding: '12px 24px',
							borderRadius: 20,
							background: C.red,
							color: '#fff',
							fontFamily: DISPLAY,
							fontWeight: 800,
							fontSize: 60,
							boxShadow: '0 12px 40px rgba(229,38,47,0.5)',
						}}
					>
						×4
					</div>
				</Pop>
			</Abs>
			<Abs x={72} y={630} w={900}>
				<Label size={42}>
					<MaskLine at={c('rentas')} out={exit + 0.12}>rentas vacacionales activas</MaskLine>
					<MaskLine at={c('plataformas') - 0.1} out={exit + 0.16}>en plataformas digitales</MaskLine>
				</Label>
			</Abs>
			<Abs x={72} y={760} w={900}>
				<Iris origin="100% 50%" collapseAt={collapse}>
					<div style={{height: 16, borderRadius: 99, background: 'rgba(255,255,255,0.12)'}}>
						<div
							style={{
								height: '100%',
								width: `${bar * 100}%`,
								borderRadius: 99,
								background: `linear-gradient(90deg, ${C.red}, #ff7a59)`,
								boxShadow: `0 0 24px ${C.red}`,
							}}
						/>
					</div>
				</Iris>
			</Abs>
			<Abs x={72} y={800}>
				<MaskLine at={c('digitales')} out={exit + 0.2}>
					<Source>Kumar (2025), citado en López Ramos y Huízar (2026)</Source>
				</MaskLine>
			</Abs>
		</AbsoluteFill>
	);
};

/* 3 · Puerto Vallarta ---------------------------------------------------- */
export const VallartaOverlay: React.FC = () => {
	const c = (w: string, n = 0) => cue('vallarta', w, n);
	const {exit, collapse} = ends('vallarta');
	const punch1 = usePunch(c('millones'));
	const punch2 = usePunch(c('seiscientas') + 0.5);
	return (
		<AbsoluteFill>
			<Abs x={72} y={200}>
				<Iris origin="4% 50%" expandAt={ENTER}>
					<MaskLine at={0} out={exit}>
						<Pill>Puerto Vallarta, Jalisco</Pill>
					</MaskLine>
				</Iris>
			</Abs>
			<Abs x={72} y={290}>
				<MaskLine at={c('seis')} out={exit + 0.04}>
					<div style={{transform: `scale(${punch1})`, transformOrigin: 'left center'}}>
						<BigNumber size={150}>
							<Counter from={0} to={6.265} start={c('seis')} end={c('millones') + 0.3} format={(n) => `${n.toFixed(2)}M`} />
						</BigNumber>
					</div>
				</MaskLine>
			</Abs>
			<Abs x={72} y={455}>
				<MaskLine at={c('visitantes')} out={exit + 0.08}>
					<Label size={42}>visitantes en 2025</Label>
				</MaskLine>
				<MaskLine at={c('2025')} out={exit + 0.1} style={{marginTop: 8}}>
					<Source>SECTURJAL (2025)</Source>
				</MaskLine>
			</Abs>
			<Abs x={72} y={585} w={900}>
				<Wipe at={c('y')} out={exit + 0.12}>
					<div style={{height: 2, background: C.stroke}} />
				</Wipe>
			</Abs>
			<Abs x={72} y={615}>
				<Pop at={c('2026')} out={exit + 0.14}>
					<div
						style={{
							padding: '10px 22px',
							borderRadius: 99,
							border: `1.5px solid ${C.stroke}`,
							background: 'rgba(22,24,32,0.72)',
							fontFamily: BODY,
							fontWeight: 700,
							fontSize: 28,
							color: C.ink,
						}}
					>
						inicios de 2026
					</div>
				</Pop>
			</Abs>
			<Abs x={72} y={690} w={780}>
				<Iris origin="50% 50%" collapseAt={collapse}>
					<MaskLine at={c('doce')}>
						<div style={{transform: `scale(${punch2})`, transformOrigin: 'left center'}}>
							<BigNumber size={150} color={C.redGlow}>
								+<Counter from={0} to={12600} start={c('doce')} end={c('seiscientas') + 0.5} />
							</BigNumber>
						</div>
					</MaskLine>
				</Iris>
			</Abs>
			<Abs x={72} y={855}>
				<MaskLine at={c('rentas')} out={exit + 0.18}>
					<Label size={42}>rentas activas</Label>
				</MaskLine>
				<MaskLine at={c('activas')} out={exit + 0.2} style={{marginTop: 8}}>
					<Source>AirDNA (2026)</Source>
				</MaskLine>
			</Abs>
		</AbsoluteFill>
	);
};

/* 4 · The study --------------------------------------------------------- */
export const StudyOverlay: React.FC = () => {
	const c = (w: string, n = 0) => cue('study', w, n);
	const {exit, collapse} = ends('study');
	const author = (name: string, initials: string, inst: string, at: number) => (
		<MaskLine at={at}>
			<div style={{display: 'flex', gap: 22, alignItems: 'center'}}>
				<div
					style={{
						width: 70,
						height: 70,
						borderRadius: 99,
						background: `linear-gradient(135deg, ${C.red}, #7a1219)`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontFamily: DISPLAY,
						fontWeight: 700,
						fontSize: 26,
						color: '#fff',
						flexShrink: 0,
					}}
				>
					{initials}
				</div>
				<div>
					<Label size={36} style={{fontWeight: 700}}>{name}</Label>
					<Label size={26} style={{color: C.muted, marginTop: 4}}>{inst}</Label>
				</div>
			</div>
		</MaskLine>
	);
	const chips: [string, number][] = [
		['Versalles', c('Versalles')],
		['Díaz Ordaz', c('Díaz')],
		['Los Mangos', c('Los')],
	];
	return (
		<AbsoluteFill>
			<Abs x={72} y={200}>
				<MaskLine at={0.1} out={exit}>
					<Pill>El estudio</Pill>
				</MaskLine>
			</Abs>
			<Abs x={72} y={290} w={936}>
				<Iris origin="10% 50%" expandAt={ENTER} collapseAt={exit + 0.1}>
					<Glass style={{display: 'flex', flexDirection: 'column', gap: 28}}>
						{author('Jorge Luis López Ramos', 'JL', 'Centro de Investigación para el Desarrollo Sustentable (CIDES)', c('Jorge'))}
						{author('María de los Ángeles Huízar Sánchez', 'MH', 'Universidad de Guadalajara', c('María'))}
					</Glass>
				</Iris>
			</Abs>
			<Abs x={72} y={580}>
				<MaskLine at={c('tres')} out={exit + 0.04}>
					<Label size={36} style={{color: C.muted}}>se metió a fondo en 3 colonias</Label>
				</MaskLine>
			</Abs>
			<Abs x={72} y={650} w={936}>
				<Iris origin="50% 50%" collapseAt={collapse}>
					<div style={{display: 'flex', gap: 18, height: 90, alignItems: 'center'}}>
						{chips.map(([name, at]) => (
							<Pop key={name} at={at}>
								<div
									style={{
										padding: '18px 30px',
										borderRadius: 999,
										background: C.red,
										color: '#fff',
										fontFamily: BODY,
										fontWeight: 800,
										fontSize: 34,
										boxShadow: '0 10px 40px rgba(229,38,47,0.45)',
									}}
								>
									{name}
								</div>
							</Pop>
						))}
					</div>
				</Iris>
			</Abs>
		</AbsoluteFill>
	);
};

/* 5 · Findings ---------------------------------------------------------- */
export const FindingsOverlay: React.FC = () => {
	const c = (w: string, n = 0) => cue('findings', w, n);
	const {exit, collapse} = ends('findings');
	const p1 = usePunch(c('mil'));
	const p2 = usePunch(c('comercios'));
	return (
		<AbsoluteFill>
			<Abs x={72} y={200}>
				<MaskLine at={0.1} out={exit}>
					<Pill>Lo que encontraron</Pill>
				</MaskLine>
			</Abs>
			<Abs x={72} y={290} w={444}>
				<Iris origin="50% 50%" expandAt={ENTER} collapseAt={exit + 0.04}>
					<Glass style={{padding: 34, height: 220, boxSizing: 'border-box'}}>
						<MaskLine at={c('cerca')}>
							<div style={{transform: `scale(${p1})`, transformOrigin: 'left center'}}>
								<BigNumber size={92}>
									~<Counter from={0} to={1000} start={c('cerca')} end={c('mil') + 0.1} />
								</BigNumber>
							</div>
						</MaskLine>
						<MaskLine at={c('rentas')} style={{marginTop: 14}}>
							<Label size={30} style={{color: C.muted}}>rentas vacacionales activas</Label>
						</MaskLine>
					</Glass>
				</Iris>
			</Abs>
			<Abs x={564} y={290} w={444}>
				<Wipe at={c('unos')} out={exit + 0.08}>
					<Glass style={{padding: 34, height: 220, boxSizing: 'border-box'}}>
						<MaskLine at={c('setecientos') - 0.1}>
							<div style={{transform: `scale(${p2})`, transformOrigin: 'left center'}}>
								<BigNumber size={92}>
									~<Counter from={0} to={700} start={c('setecientos')} end={c('comercios')} />
								</BigNumber>
							</div>
						</MaskLine>
						<MaskLine at={c('comercios')} style={{marginTop: 14}}>
							<Label size={30} style={{color: C.muted}}>comercios y servicios</Label>
						</MaskLine>
					</Glass>
				</Wipe>
			</Abs>
			<Abs x={72} y={530}>
				<MaskLine at={c('comercios') + 0.3} out={exit + 0.1}>
					<Source>AirDNA, DENUE-INEGI y trabajo de campo</Source>
				</MaskLine>
			</Abs>
			<Abs x={72} y={590}>
				<Iris origin="50% 50%" collapseAt={collapse}>
					<Pop at={c('más')}>
						<Arrow size={72} />
					</Pop>
				</Iris>
			</Abs>
			<Abs x={170} y={590}>
				<Headline size={66}>
					<MaskLine at={c('más')} out={exit + 0.12}>Más torres</MaskLine>
					<MaskLine at={c('construcción')} out={exit + 0.16}>en construcción</MaskLine>
				</Headline>
			</Abs>
		</AbsoluteFill>
	);
};

/* 6 · Effects ----------------------------------------------------------- */
export const EffectsOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = (w: string, n = 0) => cue('effects', w, n);
	const {collapse} = ends('effects');
	const listOut = c('Un') - 0.35;
	const items: [string, React.ReactNode, number][] = [
		['01', 'Casas tradicionales que desaparecen', 0.06],
		['02', <>Precio del suelo <Red>↑</Red></>, c('Precios')],
		['03', 'Vecinos que se van', c('Vecinos')],
	];
	const tId = c('identidad');
	const underline = interpolate(frame, [tId * fps, (tId + 0.5) * fps], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill>
			{items.map(([n, t, at], i) => {
				const row = (
					<Glass style={{padding: '26px 34px', display: 'flex', alignItems: 'center', gap: 28}}>
						<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: C.redGlow}}>{n}</div>
						<Label size={40} style={{fontWeight: 700}}>{t}</Label>
					</Glass>
				);
				return (
					<Abs key={n} x={72} y={290 + i * 128} w={936}>
						{i === 0 ? (
							<Iris origin="6% 50%" expandAt={ENTER}>
								<Wipe at={0} out={listOut}>{row}</Wipe>
							</Iris>
						) : (
							<Wipe at={at} out={listOut + i * 0.06}>{row}</Wipe>
						)}
					</Abs>
				);
			})}
			<Abs x={72} y={300}>
				<Headline size={98}>
					<MaskLine at={c('Un')}>Un barrio</MaskLine>
					<MaskLine at={c('pierde')}>que pierde su</MaskLine>
					<MaskLine at={tId}>
						<Red>identidad</Red>
					</MaskLine>
				</Headline>
			</Abs>
			<Abs x={72} y={620} w={640}>
				<Iris origin="100% 50%" collapseAt={collapse}>
					<div style={{height: 10, width: `${underline * 100}%`, background: C.redGlow, borderRadius: 9, boxShadow: `0 0 20px ${C.red}`}} />
				</Iris>
			</Abs>
		</AbsoluteFill>
	);
};

/* 7 · Eight zones ------------------------------------------------------- */
export const ZonesOverlay: React.FC = () => {
	const c = (w: string, n = 0) => cue('zones', w, n);
	const {exit, collapse} = ends('zones');
	const zones = ['Versalles', 'Díaz Ordaz', 'Del Cerro', 'Emiliano Zapata', '5 de Diciembre', 'Zona Romántica', 'Zona Hotelera', 'Garza Blanca'];
	const tZones = c('zonas');
	return (
		<AbsoluteFill>
			<Abs x={72} y={200}>
				<Iris origin="4% 50%" expandAt={ENTER}>
					<MaskLine at={0} out={exit}>
						<Pill>No es un caso aislado</Pill>
					</MaskLine>
				</Iris>
			</Abs>
			<Abs x={72} y={300} w={200}>
				<Iris origin="50% 50%" collapseAt={collapse}>
					<Pop at={c('ocho')}>
						<BigNumber size={260} color={C.redGlow}>8</BigNumber>
					</Pop>
				</Iris>
			</Abs>
			<Abs x={300} y={330}>
				<Headline size={62}>
					<MaskLine at={tZones} out={exit + 0.04}>zonas</MaskLine>
					<MaskLine at={tZones + 0.12} out={exit + 0.08}>concentran</MaskLine>
					<MaskLine at={tZones + 0.24} out={exit + 0.12}>las rentas</MaskLine>
				</Headline>
			</Abs>
			<Abs x={72} y={600} w={936}>
				<div style={{display: 'flex', flexWrap: 'wrap', gap: 14}}>
					{zones.map((z, i) => (
						<Pop key={z} at={c('ciudad') + i * 0.08} out={exit + 0.14 + i * 0.02}>
							<div
								style={{
									padding: '12px 22px',
									borderRadius: 999,
									border: `1.5px solid ${C.stroke}`,
									background: 'rgba(22,24,32,0.72)',
									fontFamily: BODY,
									fontWeight: 600,
									fontSize: 28,
									color: C.ink,
								}}
							>
								{z}
							</div>
						</Pop>
					))}
				</div>
			</Abs>
			<Abs x={72} y={880}>
				<MaskLine at={c('todas')} out={exit + 0.2}>
					<Label size={40} style={{fontWeight: 700}}>
						Todas eran <Red>barrios de vivienda local</Red>
					</Label>
				</MaskLine>
			</Abs>
		</AbsoluteFill>
	);
};

/* 8 · Outro + citation -------------------------------------------------- */
export const OutroOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const c = (w: string, n = 0) => cue('outro', w, n);
	const shade = interpolate(frame, [0, 0.8 * fps], [0, 0.55], {extrapolateRight: 'clamp'});
	const cardOut = c('Y') - 0.15;
	const topo = usePunch(c('Topofilia'));
	return (
		<>
			<AbsoluteFill style={{background: `rgba(4,6,10,${shade})`}} />
			<AbsoluteFill>
				<Abs x={72} y={230}>
					<MaskLine at={0.1} out={cardOut}>
						<Pill>Lee el estudio completo</Pill>
					</MaskLine>
				</Abs>
				<Abs x={72} y={320} w={936}>
					<Iris origin="10% 15%" expandAt={ENTER}>
						<Wipe at={0} out={cardOut + 0.05} dir="up">
							<Glass style={{padding: 44}}>
								<div style={{transform: `scale(${topo})`, transformOrigin: 'left center'}}>
									<MaskLine at={0.35}>
										<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: -2}}>
											Topo<Red>filia</Red>
										</div>
									</MaskLine>
								</div>
								<MaskLine at={0.5} style={{marginTop: 6}}>
									<Label size={24} style={{color: C.muted}}>Difusión Periódica de Arquitectura, Urbanismo y Territorios</Label>
								</MaskLine>
								<div style={{height: 2, background: C.stroke, margin: '26px 0'}} />
								<Label size={33} style={{fontWeight: 700, lineHeight: 1.25}}>
									<MaskLine at={c('estudio') + 0.3}>El alojamiento vacacional basado en</MaskLine>
									<MaskLine at={c('estudio') + 0.4}>plataformas digitales: causas, efectos e</MaskLine>
									<MaskLine at={c('estudio') + 0.5}>impactos en zonas de residencia local</MaskLine>
								</Label>
								<MaskLine at={c('completo')} style={{marginTop: 18}}>
									<Label size={28} style={{color: C.muted}}>López Ramos, J. L. y Huízar Sánchez, M. Á. (2026)</Label>
								</MaskLine>
								<MaskLine at={c('revista')} style={{marginTop: 8}}>
									<Label size={26} style={{color: C.muted}}>Año XIX, n.º 32, pp. 178–203 · ISSN 2594-0635</Label>
								</MaskLine>
							</Glass>
						</Wipe>
					</Iris>
				</Abs>
				<Abs x={72} y={430}>
					<MaskLine at={c('próximo')}>
						<Pill>Próximo mes · 02/03</Pill>
					</MaskLine>
				</Abs>
				<Abs x={72} y={530}>
					<Headline size={130}>
						<MaskLine at={c('contamos')}>El</MaskLine>
						<MaskLine at={c('barrio')}>
							<Red>barrio</Red>
						</MaskLine>
					</Headline>
				</Abs>
				<Abs x={72} y={830} w={900}>
					<MaskLine at={c('transformando')}>
						<Label size={40} style={{color: C.muted}}>La historia de un barrio que se transforma</Label>
					</MaskLine>
				</Abs>
			</AbsoluteFill>
		</>
	);
};
