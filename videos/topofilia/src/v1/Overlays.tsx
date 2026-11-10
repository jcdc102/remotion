import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {BODY, C, DISPLAY} from '../theme';
import {
	BigNumber,
	Counter,
	Glass,
	Headline,
	Label,
	Pill,
	Red,
	Rise,
	Source,
	useAppear,
	useFadeOut,
} from './ui';

const Top: React.FC<{children: React.ReactNode; top?: number}> = ({children, top = 210}) => (
	<AbsoluteFill style={{padding: `${top}px 72px 0 72px`, display: 'flex', flexDirection: 'column', gap: 28}}>
		{children}
	</AbsoluteFill>
);

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

/* 1 · Hook */
export const HookOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const booked = frame >= 4.25 * fps;
	const press = interpolate(frame, [4.05 * fps, 4.2 * fps, 4.4 * fps], [1, 0.92, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<>
			<Top>
				<Rise delay={0.1} out={5.5}>
					<Pill>Serie investigación · 01/03</Pill>
				</Rise>
				<Rise delay={0.35} out={5.5} y={80}>
					<Glass style={{padding: 0, overflow: 'hidden', width: 640}}>
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
							<Label size={42} style={{fontWeight: 700}}>Depa frente al mar</Label>
							<Label size={28} style={{color: C.muted, marginTop: 8}}>Puerto Vallarta · 2 noches</Label>
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
				</Rise>
			</Top>
			<Top top={300}>
				<Rise delay={6.15} y={60}>
					<Headline size={104}>
						¿Y el <Red>barrio</Red>
						<br />
						donde te
						<br />
						quedas?
					</Headline>
				</Rise>
			</Top>
		</>
	);
};

/* 2 · Global growth */
export const GlobalOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const second = frame >= 6.2 * fps;
	const bar = interpolate(frame, [0.5 * fps, 1.5 * fps, 6.3 * fps, 8.6 * fps], [0, 0.25, 0.25, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const badge = useAppear(8.7);
	return (
		<Top>
			<Rise delay={0.05}>
				<Pill>En el mundo</Pill>
			</Rise>
			<Rise delay={0.25}>
				<Label size={44} style={{fontWeight: 600, maxWidth: 860}}>
					Rentas vacacionales activas en plataformas digitales
				</Label>
			</Rise>
			<Rise delay={0.45}>
				<div style={{display: 'flex', alignItems: 'baseline', gap: 26}}>
					<div style={{fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.redGlow}}>
						{second ? '2025' : '2016'}
					</div>
				</div>
				<div style={{display: 'flex', alignItems: 'flex-end', gap: 24}}>
					<BigNumber size={230}>
						{second ? '+' : ''}
						<Counter from={2} to={second ? 8 : 2} start={6.3} duration={2.2} format={(n) => `${Math.round(n)}M`} />
					</BigNumber>
					<div
						style={{
							opacity: badge,
							transform: `scale(${0.6 + badge * 0.4}) rotate(-6deg)`,
							marginBottom: 40,
							padding: '12px 24px',
							borderRadius: 20,
							background: C.red,
							color: '#fff',
							fontFamily: DISPLAY,
							fontWeight: 800,
							fontSize: 60,
						}}
					>
						×4
					</div>
				</div>
				<div style={{marginTop: 26, height: 18, width: 860, borderRadius: 99, background: 'rgba(255,255,255,0.12)'}}>
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
			</Rise>
			<Rise delay={1} style={{marginTop: 6}}>
				<Source>Kumar (2025), citado en López Ramos y Huízar (2026)</Source>
			</Rise>
		</Top>
	);
};

/* 3 · Puerto Vallarta */
export const VallartaOverlay: React.FC = () => {
	return (
		<Top>
			<Rise delay={0.05}>
				<Pill>Puerto Vallarta, Jalisco</Pill>
			</Rise>
			<Rise delay={0.3}>
				<BigNumber size={150}>
					<Counter from={0} to={6.265} start={0.3} duration={2.6} format={(n) => `${n.toFixed(2)}M`} />
				</BigNumber>
				<Label size={42} style={{marginTop: 10}}>visitantes en 2025</Label>
				<div style={{marginTop: 8}}>
					<Source>SECTURJAL (2025)</Source>
				</div>
			</Rise>
			<Rise delay={5.0} style={{marginTop: 30}}>
				<div style={{height: 2, width: 860, background: C.stroke, marginBottom: 34}} />
				<BigNumber size={150} color={C.redGlow}>
					+<Counter from={0} to={12600} start={5.0} duration={3} />
				</BigNumber>
				<Label size={42} style={{marginTop: 10}}>rentas activas · inicios de 2026</Label>
				<div style={{marginTop: 8}}>
					<Source>AirDNA (2026)</Source>
				</div>
			</Rise>
		</Top>
	);
};

/* 4 · The study */
export const StudyOverlay: React.FC = () => {
	const author = (name: string, inst: string, delay: number) => (
		<Rise delay={delay} y={24}>
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
					{name
						.split(' ')
						.filter((w) => /^[A-ZÁÉÍÓÚ]/.test(w))
						.slice(0, 2)
						.map((w) => w[0])
						.join('')}
				</div>
				<div>
					<Label size={36} style={{fontWeight: 700}}>{name}</Label>
					<Label size={26} style={{color: C.muted, marginTop: 4}}>{inst}</Label>
				</div>
			</div>
		</Rise>
	);
	const chips = ['Versalles', 'Díaz Ordaz', 'Los Mangos'];
	return (
		<Top>
			<Rise delay={0.05}>
				<Pill>El estudio</Pill>
			</Rise>
			<Rise delay={0.25} y={60}>
				<Glass style={{display: 'flex', flexDirection: 'column', gap: 28}}>
					{author('Jorge Luis López Ramos', 'Centro de Investigación para el Desarrollo Sustentable (CIDES)', 0.9)}
					{author('María de los Ángeles Huízar Sánchez', 'Universidad de Guadalajara', 2.6)}
				</Glass>
			</Rise>
			<div style={{display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 10}}>
				{chips.map((c, i) => (
					<Rise key={c} delay={7.3 + i * 0.45} y={30}>
						<div
							style={{
								padding: '18px 30px',
								borderRadius: 999,
								background: C.red,
								color: '#fff',
								fontFamily: BODY,
								fontWeight: 800,
								fontSize: 34,
								boxShadow: `0 10px 40px rgba(229,38,47,0.45)`,
							}}
						>
							{c}
						</div>
					</Rise>
				))}
			</div>
		</Top>
	);
};

/* 5 · Findings */
export const FindingsOverlay: React.FC = () => {
	const tile = (delay: number, num: React.ReactNode, label: string) => (
		<Rise delay={delay} y={50} style={{flex: 1}}>
			<Glass style={{padding: 34}}>
				<BigNumber size={96}>{num}</BigNumber>
				<Label size={32} style={{marginTop: 12, color: C.muted, fontWeight: 600}}>{label}</Label>
			</Glass>
		</Rise>
	);
	return (
		<Top>
			<Rise delay={0.05}>
				<Pill>Lo que encontraron</Pill>
			</Rise>
			<div style={{display: 'flex', gap: 24}}>
				{tile(1.0, <>~<Counter from={0} to={1000} start={1.0} duration={1.6} /></>, 'rentas vacacionales activas')}
				{tile(3.0, <>~<Counter from={0} to={700} start={3.0} duration={1.4} /></>, 'comercios y servicios')}
			</div>
			<Rise delay={5.4} y={40}>
				<div style={{display: 'flex', alignItems: 'center', gap: 20}}>
					<Arrow size={72} />
					<Headline size={66}>
						Más torres
						<br />
						en construcción
					</Headline>
				</div>
			</Rise>
			<Rise delay={1.2}>
				<Source>AirDNA, DENUE-INEGI y trabajo de campo</Source>
			</Rise>
		</Top>
	);
};

/* 6 · Effects */
export const EffectsOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const dimList = interpolate(frame, [6.1 * fps, 6.5 * fps], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const items: [string, React.ReactNode, number][] = [
		['01', 'Casas tradicionales que desaparecen', 0.05],
		['02', <>Precio del suelo <Red>↑</Red></>, 2.66],
		['03', 'Vecinos que se van', 4.69],
	];
	const underline = useAppear(7.2, 24);
	return (
		<>
			<Top>
				<div style={{opacity: dimList, display: 'flex', flexDirection: 'column', gap: 26}}>
					{items.map(([n, t, d]) => (
						<Rise key={n} delay={d} y={30}>
							<Glass style={{padding: '28px 34px', display: 'flex', alignItems: 'center', gap: 28}}>
								<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 44, color: C.redGlow}}>{n}</div>
								<Label size={42} style={{fontWeight: 700}}>{t}</Label>
							</Glass>
						</Rise>
					))}
				</div>
			</Top>
			<Top top={290}>
				<Rise delay={6.3} y={60}>
					<Headline size={98}>
						Un barrio
						<br />
						que pierde su
						<br />
						<span style={{position: 'relative', color: C.redGlow}}>
							identidad
							<span
								style={{
									position: 'absolute',
									left: 0,
									bottom: -10,
									height: 10,
									width: `${underline * 100}%`,
									background: C.redGlow,
									borderRadius: 9,
								}}
							/>
						</span>
					</Headline>
				</Rise>
			</Top>
		</>
	);
};

/* 7 · Eight zones */
export const ZonesOverlay: React.FC = () => {
	const zones = [
		'Versalles',
		'Díaz Ordaz',
		'Del Cerro',
		'Emiliano Zapata',
		'5 de Diciembre',
		'Zona Romántica',
		'Zona Hotelera',
		'Garza Blanca',
	];
	return (
		<Top>
			<Rise delay={0.05}>
				<Pill>No es un caso aislado</Pill>
			</Rise>
			<Rise delay={2.5} y={60}>
				<div style={{display: 'flex', alignItems: 'center', gap: 30}}>
					<BigNumber size={260} color={C.redGlow}>8</BigNumber>
					<Headline size={62}>
						zonas
						<br />
						concentran
						<br />
						las rentas
					</Headline>
				</div>
			</Rise>
			<div style={{display: 'flex', flexWrap: 'wrap', gap: 14}}>
				{zones.map((z, i) => (
					<Rise key={z} delay={3.1 + i * 0.18} y={20}>
						<div
							style={{
								padding: '12px 22px',
								borderRadius: 999,
								border: `1.5px solid ${C.stroke}`,
								background: 'rgba(10,12,18,0.6)',
								fontFamily: BODY,
								fontWeight: 600,
								fontSize: 28,
								color: C.ink,
							}}
						>
							{z}
						</div>
					</Rise>
				))}
			</div>
			<Rise delay={6.05}>
				<Label size={40} style={{fontWeight: 700}}>
					Todas eran <Red>barrios de vivienda local</Red>
				</Label>
			</Rise>
		</Top>
	);
};

/* 8 · Outro + citation */
export const OutroOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const shade = interpolate(frame, [0, 0.8 * fps], [0, 0.55], {extrapolateRight: 'clamp'});
	const cardOut = useFadeOut(3.3, 12);
	return (
		<>
			<AbsoluteFill style={{background: `rgba(4,6,10,${shade})`}} />
			<Top top={230}>
				<div style={{opacity: cardOut, display: 'flex', flexDirection: 'column', gap: 28}}>
					<Rise delay={0.05}>
						<Pill>Lee el estudio completo</Pill>
					</Rise>
					<Rise delay={0.3} y={60}>
						<Glass style={{padding: 44}}>
							<div style={{fontFamily: DISPLAY, fontWeight: 800, fontSize: 76, color: C.ink, letterSpacing: -2}}>
								Topo<Red>filia</Red>
							</div>
							<Label size={24} style={{color: C.muted, marginTop: 6}}>
								Difusión Periódica de Arquitectura, Urbanismo y Territorios
							</Label>
							<div style={{height: 2, background: C.stroke, margin: '26px 0'}} />
							<Label size={33} style={{fontWeight: 700, lineHeight: 1.25}}>
								El alojamiento vacacional basado en plataformas digitales: causas, efectos e impactos en zonas de
								residencia local
							</Label>
							<Label size={28} style={{color: C.muted, marginTop: 18}}>
								López Ramos, J. L. y Huízar Sánchez, M. Á. (2026)
							</Label>
							<Label size={26} style={{color: C.muted, marginTop: 8}}>
								Año XIX, n.º 32, pp. 178–203 · ISSN 2594-0635
							</Label>
						</Glass>
					</Rise>
				</div>
			</Top>
			<Top top={420}>
				<Rise delay={3.45} y={70}>
					<Pill>Próximo mes · 02/03</Pill>
					<div style={{height: 30}} />
					<Headline size={120}>
						El
						<br />
						<Red>barrio</Red>
					</Headline>
					<Label size={40} style={{marginTop: 24, color: C.muted, maxWidth: 820}}>
						La historia de un barrio que se transforma
					</Label>
				</Rise>
			</Top>
		</>
	);
};
