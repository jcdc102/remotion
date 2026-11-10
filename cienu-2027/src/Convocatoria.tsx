import {loadFont as loadMontserrat} from '@remotion/google-fonts/Montserrat';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';
import {QRCodeSVG} from 'qrcode.react';
import React from 'react';
import {
	AbsoluteFill,
	Audio,
	Easing,
	Img,
	interpolate,
	Sequence,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const {fontFamily: sans} = loadMontserrat('normal', {
	weights: ['400', '500', '700', '800'],
	subsets: ['latin'],
});
const {fontFamily: mono} = loadMono('normal', {
	weights: ['500', '700'],
	subsets: ['latin'],
});

const RED = '#C8202F';
const GREEN = '#137A57';
const ORANGE = '#E9802A';
const YELLOW = '#F2B11B';
const INK = '#1C2230';
const BG = '#FBFDFC';

const URL = 'cienu.cuc.udg.mx/convocatoria';

const KICKER = '¡YA ESTÁ PUBLICADA!';

// Sound effects, synced to the animation (frame, file, volume)
const sfx: [number, string, number][] = [
	[0, 'whoosh', 0.6],
	[10, 'pop', 0.7],
	[36, 'pop', 0.3],
	[48, 'whoosh', 0.3],
	// Typewriter clicks for the kicker
	...KICKER.split('')
		.map((c, i): [number, string, number] => [Math.round(52 + ((i + 1) * 36) / KICKER.length), c === ' ' ? '' : 'mouse-click', 0.25])
		.filter(([, f]) => f !== ''),
	[84, 'riser', 0.6],
	[86, 'whoosh', 0.5],
	[120, 'impact', 0.8],
	[140, 'page-turn', 0.35],
	[190, 'switch', 0.35],
	[222, 'whip', 0.45],
	[236, 'whip', 0.45],
	[250, 'whip', 0.45],
	[296, 'pop', 0.6],
	[300, 'whoosh', 0.4],
	// Typing the URL, a click every other character
	...Array.from({length: Math.ceil(URL.length / 2)}, (_, i): [number, string, number] => [
		Math.round(318 + (i * 2 * 32) / URL.length),
		'mouse-click',
		0.18,
	]),
	[345, 'pop', 0.35],
	[351, 'pop', 0.35],
	[357, 'pop', 0.35],
	[372, 'ding', 0.5],
];

const clamp = {
	extrapolateLeft: 'clamp',
	extrapolateRight: 'clamp',
} as const;

const ease = Easing.bezier(0.22, 1, 0.36, 1);

const fadeUp = (frame: number, start: number, dist = 40, dur = 22) => {
	const p = interpolate(frame, [start, start + dur], [0, 1], {
		...clamp,
		easing: ease,
	});
	return {opacity: p, transform: `translateY(${(1 - p) * dist}px)`};
};

const CalendarIcon: React.FC<{color: string}> = ({color}) => (
	<svg width="30" height="30" viewBox="0 0 24 24" fill="none">
		<rect x="3" y="5" width="18" height="16" rx="2" stroke={color} strokeWidth="2" />
		<path d="M3 10h18M8 3v4M16 3v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const PinIcon: React.FC<{color: string}> = ({color}) => (
	<svg width="30" height="30" viewBox="0 0 24 24" fill="none">
		<path
			d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z"
			stroke={color}
			strokeWidth="2"
		/>
		<circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="2" />
	</svg>
);

const DocIcon: React.FC<{color: string}> = ({color}) => (
	<svg width="30" height="30" viewBox="0 0 24 24" fill="none">
		<path d="M6 3h8l5 5v13H6V3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
		<path d="M14 3v5h5M9 13h7M9 17h7" stroke={color} strokeWidth="2" strokeLinecap="round" />
	</svg>
);

const cards = [
	{
		label: 'FECHAS',
		color: ORANGE,
		bg: '#FDF1E6',
		title: '9 al 12 de junio de 2027',
		sub: null,
		Icon: CalendarIcon,
	},
	{
		label: 'SEDE',
		color: GREEN,
		bg: '#E8F3EE',
		title: 'Puerto Vallarta, Jalisco',
		sub: 'CUCosta · Universidad de Guadalajara',
		Icon: PinIcon,
	},
	{
		label: 'ENVÍO DE RESÚMENES',
		color: RED,
		bg: '#FBE9EB',
		title: 'Hasta el 16 de enero de 2027',
		sub: null,
		Icon: DocIcon,
	},
];

// Nodes of the "AI network" decoration, in px relative to its container
const nodes = [
	[40, 260],
	[180, 120],
	[330, 170],
	[260, 330],
	[420, 40],
	[470, 280],
	[110, 420],
];
const links = [
	[0, 1],
	[1, 2],
	[2, 3],
	[3, 0],
	[2, 4],
	[2, 5],
	[3, 5],
	[0, 6],
	[3, 6],
];

export const Convocatoria: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Top and bottom color bars
	const barP = interpolate(frame, [0, 24], [0, 1], {...clamp, easing: ease});
	const bar = (
		<div style={{display: 'flex', height: 14, width: '100%'}}>
			{[RED, GREEN, ORANGE, YELLOW].map((c, i) => (
				<div
					key={c}
					style={{
						flex: 1,
						background: c,
						transform: `scaleX(${interpolate(barP, [i * 0.15, i * 0.15 + 0.55], [0, 1], clamp)})`,
						transformOrigin: 'left',
					}}
				/>
			))}
		</div>
	);

	// Decorative arcs drawing in
	const arcP = interpolate(frame, [4, 60], [0, 1], {...clamp, easing: ease});
	const arcSpin = frame * 0.08;

	const logoS = spring({frame: frame - 8, fps, config: {damping: 13, mass: 0.8}});

	// Typewriter for "¡YA ESTÁ PUBLICADA!"
	const kicker = KICKER;
	const typed = Math.floor(interpolate(frame, [52, 88], [0, kicker.length], clamp));
	const kickerLine = interpolate(frame, [48, 64], [0, 1], {...clamp, easing: ease});
	const cursorOn = frame < 100 && Math.floor(frame / 8) % 2 === 0;

	// "Convocatoria" reveal
	const revealP = interpolate(frame, [86, 116], [0, 1], {
		...clamp,
		easing: Easing.bezier(0.65, 0, 0.35, 1),
	});
	const shine = interpolate(frame, [120, 160], [-30, 130], clamp);

	// Theme quote, word by word
	const quoteWords: {w: string; ai?: boolean}[] = [
		{w: '“Educación'},
		{w: 'en'},
		{w: 'la'},
		{w: 'era'},
		{w: 'de'},
		{w: 'la'},
		{w: 'inteligencia', ai: true},
		{w: 'artificial', ai: true},
		{w: 'desafíos'},
		{w: 'de'},
		{w: 'la'},
		{w: 'docencia,'},
		{w: 'las'},
		{w: 'profesiones'},
		{w: 'y'},
		{w: 'el'},
		{w: 'conocimiento”'},
	];
	const aiUnderline = interpolate(frame, [190, 215], [0, 1], {...clamp, easing: ease});

	// Final pulses
	const pulse = frame > 370 ? 1 + Math.sin((frame - 370) / 7) * 0.025 : 1;
	const arrowX = frame > 330 ? Math.sin(frame / 5) * 6 : 0;

	const urlChars = Math.floor(interpolate(frame, [318, 350], [0, URL.length], clamp));
	const btnP = interpolate(frame, [300, 324], [0, 1], {...clamp, easing: ease});
	const qrS = spring({frame: frame - 296, fps, config: {damping: 12}});

	return (
		<AbsoluteFill style={{background: BG, fontFamily: sans, color: INK, overflow: 'hidden'}}>
			<Audio src={staticFile('music.wav')} volume={0.55} />
			{sfx.map(([from, file, volume], i) => (
				<Sequence key={i} from={from} layout="none">
					<Audio src={staticFile(`sfx/${file}.wav`)} volume={volume} />
				</Sequence>
			))}
			{/* Decorative arcs, top right */}
			<svg
				width={900}
				height={900}
				viewBox="0 0 900 900"
				style={{position: 'absolute', right: -380, top: -330, transform: `rotate(${arcSpin}deg)`}}
			>
				<circle
					cx={450}
					cy={450}
					r={300}
					fill="none"
					stroke="#E7A0A6"
					strokeWidth={3}
					strokeDasharray={1885}
					strokeDashoffset={1885 * (1 - arcP)}
				/>
				<circle
					cx={450}
					cy={450}
					r={370}
					fill="none"
					stroke="#F3C9A4"
					strokeWidth={3}
					strokeDasharray={2325}
					strokeDashoffset={2325 * (1 - arcP)}
				/>
				<circle
					cx={450}
					cy={450}
					r={430}
					fill="none"
					stroke={YELLOW}
					strokeWidth={4}
					strokeDasharray="28 18"
					opacity={arcP}
				/>
				<circle
					cx={450}
					cy={450}
					r={240}
					fill="none"
					stroke="#9CC9B8"
					strokeWidth={4}
					strokeDasharray="2 14"
					strokeLinecap="round"
					opacity={arcP}
				/>
			</svg>

			{/* Flowing lines, bottom */}
			<svg
				width={1080}
				height={1920}
				style={{position: 'absolute', inset: 0}}
				viewBox="0 0 1080 1920"
			>
				{[
					{c: '#E7A0A6', o: 0},
					{c: '#9CC9B8', o: 40},
					{c: '#F3C9A4', o: 80},
					{c: YELLOW, o: 120},
				].map(({c, o}, i) => {
					const wave = Math.sin(frame / 30 + i) * 20;
					return (
						<path
							key={c}
							d={`M -40 ${1640 + o} C 300 ${1560 + o + wave}, 650 ${1320 + o - wave}, 1120 ${960 + o}`}
							fill="none"
							stroke={c}
							strokeWidth={3}
							strokeDasharray={1600}
							strokeDashoffset={1600 * (1 - interpolate(frame, [200 + i * 8, 280 + i * 8], [0, 1], {...clamp, easing: ease}))}
							opacity={0.8}
						/>
					);
				})}
			</svg>

			{/* AI network */}
			<svg
				width={520}
				height={480}
				style={{position: 'absolute', right: -70, top: 560, opacity: 0.45, transform: 'scale(0.75)', transformOrigin: 'top right'}}
				viewBox="0 0 520 480"
			>
				{links.map(([a, b], i) => {
					const p = interpolate(frame, [150 + i * 5, 175 + i * 5], [0, 1], clamp);
					const [x1, y1] = nodes[a];
					const [x2, y2] = nodes[b];
					return (
						<line
							key={i}
							x1={x1}
							y1={y1}
							x2={x1 + (x2 - x1) * p}
							y2={y1 + (y2 - y1) * p}
							stroke="#D5DAD8"
							strokeWidth={2}
						/>
					);
				})}
				{nodes.map(([x, y], i) => {
					const s = spring({frame: frame - 145 - i * 5, fps, config: {damping: 10}});
					const tw = 0.75 + Math.sin(frame / 9 + i * 1.7) * 0.25;
					const c = [RED, GREEN, YELLOW, GREEN, '#9CC9B8', RED, ORANGE][i];
					return <circle key={i} cx={x} cy={y} r={(i % 3 === 0 ? 11 : 8) * s} fill={c} opacity={tw} />;
				})}
			</svg>

			<div style={{position: 'absolute', top: 0, left: 0, right: 0}}>{bar}</div>
			<div style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>{bar}</div>

			<div style={{position: 'absolute', inset: 0, padding: '90px 80px 0 80px'}}>
				{/* Header */}
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
					<Img
						src={staticFile('logo.png')}
						style={{
							width: 440,
							transform: `scale(${logoS})`,
							transformOrigin: 'left center',
							opacity: logoS,
							mixBlendMode: 'multiply',
						}}
					/>
					<div
						style={{
							fontFamily: mono,
							fontWeight: 500,
							fontSize: 26,
							letterSpacing: 4,
							textAlign: 'right',
							lineHeight: 1.5,
							color: '#4A5160',
							marginTop: 20,
							...fadeUp(frame, 36, 20),
						}}
					>
						CIENU_2027
						<br />
						6.ª EDICIÓN
					</div>
				</div>

				{/* Kicker */}
				<div style={{display: 'flex', alignItems: 'center', gap: 28, marginTop: 60}}>
					<div
						style={{
							width: 150,
							height: 5,
							background: `linear-gradient(90deg, ${RED} 0 40%, ${GREEN} 40% 70%, ${YELLOW} 70%)`,
							transform: `scaleX(${kickerLine})`,
							transformOrigin: 'left',
						}}
					/>
					<div style={{fontFamily: mono, fontWeight: 700, fontSize: 50, letterSpacing: 6, color: RED}}>
						{kicker.slice(0, typed)}
						<span style={{opacity: cursorOn && frame > 50 ? 1 : 0}}>▍</span>
					</div>
				</div>

				{/* Convocatoria */}
				<div
					style={{
						position: 'relative',
						marginTop: 18,
						clipPath: `inset(0 ${(1 - revealP) * 100}% 0 0)`,
						transform: `translateX(${(1 - revealP) * -30}px)`,
					}}
				>
					<div
						style={{
							fontWeight: 800,
							fontSize: 132,
							letterSpacing: -3,
							lineHeight: 1.05,
							backgroundImage: `linear-gradient(90deg, ${RED} 0%, ${ORANGE} 75%, #EE9A2F 100%), linear-gradient(100deg, transparent ${shine - 10}%, rgba(255,255,255,0.55) ${shine}%, transparent ${shine + 10}%)`,
							backgroundBlendMode: 'screen',
							WebkitBackgroundClip: 'text',
							backgroundClip: 'text',
							color: 'transparent',
							paddingBottom: 10,
						}}
					>
						Convocatoria
					</div>
				</div>

				{/* Subtitle */}
				<div style={{fontSize: 42, fontWeight: 500, lineHeight: 1.35, marginTop: 20, ...fadeUp(frame, 112)}}>
					6.º Congreso Internacional de
					<br />
					Enseñanza Universitaria
				</div>

				{/* Theme */}
				<div
					style={{
						fontSize: 42,
						fontWeight: 400,
						lineHeight: 1.4,
						marginTop: 40,
						color: '#4A5160',
						maxWidth: 900,
					}}
				>
					{quoteWords.map(({w, ai}, i) => {
						const st = fadeUp(frame, 140 + i * 3, 24, 16);
						return (
							<span key={i} style={{display: 'inline-block', marginRight: 14, ...st}}>
								{ai ? (
									<span style={{position: 'relative', color: GREEN, fontWeight: 700}}>
										{w}
										{i === 7 ? <span style={{color: '#4A5160', fontWeight: 400}}>:</span> : null}
										<span
											style={{
												position: 'absolute',
												left: -4,
												right: i === 6 ? -18 : 8,
												bottom: 4,
												height: 14,
												background: 'rgba(242,177,27,0.35)',
												transform: `scaleX(${aiUnderline})`,
												transformOrigin: 'left',
												zIndex: -1,
											}}
										/>
									</span>
								) : (
									w
								)}
							</span>
						);
					})}
				</div>

				{/* Cards */}
				<div style={{display: 'flex', flexDirection: 'column', gap: 18, marginTop: 44}}>
					{cards.map(({label, color, bg, title, sub, Icon}, i) => {
						const start = 222 + i * 14;
						const p = interpolate(frame, [start, start + 24], [0, 1], {...clamp, easing: ease});
						const border = interpolate(frame, [start + 8, start + 30], [0, 1], {...clamp, easing: ease});
						const isDeadline = i === 2;
						return (
							<div
								key={label}
								style={{
									position: 'relative',
									background: bg,
									borderRadius: 14,
									padding: '24px 32px',
									display: 'flex',
									alignItems: 'center',
									gap: 30,
									opacity: p,
									transform: `translateX(${(1 - p) * (i % 2 === 0 ? -120 : 120)}px) scale(${isDeadline ? pulse : 1})`,
									boxShadow: isDeadline && frame > 370 ? `0 0 0 ${3 + Math.sin(frame / 7) * 3}px rgba(200,32,47,0.25)` : 'none',
								}}
							>
								<div
									style={{
										position: 'absolute',
										left: 0,
										top: 0,
										bottom: 0,
										width: 8,
										borderRadius: '14px 0 0 14px',
										background: color,
										transform: `scaleY(${border})`,
										transformOrigin: 'top',
									}}
								/>
								<div style={{width: 210, flexShrink: 0}}>
									<div style={{display: 'flex', alignItems: 'center', gap: 12}}>
										<Icon color={color} />
										<span style={{fontFamily: mono, fontWeight: 700, fontSize: 21, letterSpacing: 2, color}}>
											{label}
										</span>
									</div>
								</div>
								<div>
									<div style={{fontSize: 35, fontWeight: 800, lineHeight: 1.2}}>{title}</div>
									{sub ? <div style={{fontSize: 26, marginTop: 6, color: '#4A5160'}}>{sub}</div> : null}
								</div>
							</div>
						);
					})}
				</div>

				{/* QR + URL */}
				<div style={{display: 'flex', alignItems: 'center', gap: 32, marginTop: 44}}>
					<div
						style={{
							border: `5px solid ${GREEN}`,
							borderRadius: 16,
							padding: 16,
							background: 'white',
							transform: `scale(${qrS})`,
							flexShrink: 0,
						}}
					>
						<QRCodeSVG value={`https://${URL}`} size={130} fgColor={INK} />
					</div>
					<div>
						<div
							style={{
								fontFamily: mono,
								fontWeight: 700,
								fontSize: 21,
								letterSpacing: 2,
								color: GREEN,
								...fadeUp(frame, 304, 16),
							}}
						>
							CONSULTA LAS BASES Y LA CONVOCATORIA COMPLETA
						</div>
						<div
							style={{
								marginTop: 22,
								background: GREEN,
								color: 'white',
								borderRadius: 999,
								height: 88,
								display: 'flex',
								alignItems: 'center',
								padding: '0 36px',
								fontFamily: mono,
								fontWeight: 700,
								fontSize: 30,
								width: 40 + btnP * 640,
								opacity: btnP > 0 ? 1 : 0,
								overflow: 'hidden',
								whiteSpace: 'nowrap',
								transform: `scale(${pulse})`,
								transformOrigin: 'left center',
							}}
						>
							<span style={{flex: 1}}>{URL.slice(0, urlChars)}</span>
							<span style={{color: YELLOW, transform: `translateX(${arrowX}px)`, opacity: btnP > 0.9 ? 1 : 0}}>→</span>
						</div>
					</div>
				</div>
			</div>

			{/* Institution logos */}
			<div
				style={{
					position: 'absolute',
					left: 80,
					right: 80,
					bottom: 60,
					borderTop: '2px solid #E3E7E5',
					paddingTop: 30,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				{['ridmae.png', 'cuc.png', 'cualtos.png'].map((f, i) => (
					<Img
						key={f}
						src={staticFile(f)}
						style={{height: f === 'ridmae.png' ? 80 : 92, mixBlendMode: 'multiply', ...fadeUp(frame, 345 + i * 6, 20)}}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};
