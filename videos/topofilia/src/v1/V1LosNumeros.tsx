import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {BODY, C} from '../theme';
import {City3D} from './City3D';
import {cue, cueFrame, FPS, SCENES, sceneStart, TOTAL_FRAMES} from './data';
import {
	BRIDGE_POINTS,
	EffectsOverlay,
	FindingsOverlay,
	GlobalOverlay,
	HOOK_CARD_COLLAPSE,
	HookOverlay,
	OutroOverlay,
	StudyOverlay,
	VallartaOverlay,
	ZonesOverlay,
} from './Overlays';
import {WORDS} from './words';

const OVERLAYS: Record<string, React.FC> = {
	hook: HookOverlay,
	global: GlobalOverlay,
	vallarta: VallartaOverlay,
	study: StudyOverlay,
	findings: FindingsOverlay,
	effects: EffectsOverlay,
	zones: ZonesOverlay,
	outro: OutroOverlay,
};

/* Captions: real word timings, a new page at each pause or every 4 words. */
type Word = {text: string; start: number; end: number; page: number};

const useWords = () =>
	useMemo(() => {
		const words: Word[] = [];
		let page = 0;
		let inPage = 0;
		for (const scene of SCENES) {
			let prevEnd = -1;
			page++;
			inPage = 0;
			for (const [text, start, end] of WORDS[scene.id]) {
				const pause = prevEnd >= 0 && start - prevEnd > 0.3;
				if (inPage === 4 || pause) {
					page++;
					inPage = 0;
				}
				words.push({text, start: scene.from + start * FPS, end: scene.from + end * FPS, page});
				inPage++;
				prevEnd = end;
			}
		}
		return words;
	}, []);

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const words = useWords();
	let idx = -1;
	for (let i = 0; i < words.length; i++) {
		if (words[i].start <= frame + 1) {
			idx = i;
		}
	}
	if (idx < 0) {
		return null;
	}
	const current = words[idx];
	if (frame > current.end + 10) {
		return null;
	}
	const page = words.filter((w) => w.page === current.page);
	const pageStart = page[0].start;
	const inP = interpolate(frame, [pageStart - 1, pageStart + 5], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: Easing.out(Easing.cubic),
	});
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: 1330}}>
			<div style={{overflow: 'hidden', padding: '0 20px 12px'}}>
				<div
					style={{
						maxWidth: 900,
						textAlign: 'center',
						transform: `translateY(${(1 - inP) * 100}%)`,
						fontFamily: BODY,
						fontWeight: 800,
						fontSize: 66,
						lineHeight: 1.12,
						letterSpacing: -1,
						textShadow: '0 4px 24px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
					}}
				>
					{page.map((w, i) => {
						const active = w === current;
						const said = w.start <= frame + 1;
						return (
							<span
								key={i}
								style={{
									color: active ? C.redGlow : said ? C.ink : 'rgba(246,241,234,0.4)',
									marginRight: 16,
									display: 'inline-block',
									transform: active ? 'scale(1.06)' : undefined,
								}}
							>
								{w.text}
							</span>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

/* The dot that carries one scene's hero object into the next one. */
type Hop = {start: number; from: [number, number]; to: [number, number]};

const HOPS: Hop[] = (() => {
	const hops: Hop[] = [
		{start: Math.round((HOOK_CARD_COLLAPSE + 0.28) * FPS), ...BRIDGE_POINTS['hook-pin']},
	];
	for (let i = 0; i < SCENES.length - 1; i++) {
		const id = SCENES[i].id;
		hops.push({start: SCENES[i + 1].from - 3, ...BRIDGE_POINTS[id]});
	}
	return hops;
})();
const HOP_LEN = 12;

const Bridge: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{HOPS.map((h, i) => {
				const local = frame - h.start;
				if (local < -1 || local > HOP_LEN + 3) {
					return null;
				}
				return [0, 2, 4].map((lag) => {
					const t = Easing.inOut(Easing.cubic)(Math.min(1, Math.max(0, (local - lag) / HOP_LEN)));
					const x = h.from[0] + (h.to[0] - h.from[0]) * t;
					// arc upward between the two points
					const y = h.from[1] + (h.to[1] - h.from[1]) * t - Math.sin(t * Math.PI) * 120;
					const size = 34 * (1 + Math.sin(t * Math.PI) * 0.5) * (lag ? 1 - lag * 0.15 : 1);
					const fade = interpolate(local, [HOP_LEN, HOP_LEN + 3], [1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					});
					return (
						<div
							key={`${i}-${lag}`}
							style={{
								position: 'absolute',
								left: x - size / 2,
								top: y - size / 2,
								width: size,
								height: size,
								borderRadius: 99,
								background: C.redGlow,
								opacity: fade * (lag ? 0.35 : 1),
								boxShadow: `0 0 30px ${C.red}, 0 0 60px ${C.red}`,
							}}
						/>
					);
				});
			})}
		</AbsoluteFill>
	);
};

/* Sound design */
type Sfx = {at: number; src: string; volume: number};

const SFX: Sfx[] = (() => {
	const s = (id: string, sec: number) => sceneStart(id) + Math.round(sec * FPS);
	const list: Sfx[] = [];
	const add = (at: number, name: string, volume: number) => list.push({at, src: `sfx/${name}`, volume});
	// scene transitions: the travelling dot
	for (const h of HOPS) {
		add(h.start - 2, 'whoosh.mp3', 0.45);
	}
	// hook
	add(s('hook', 0.3), 'whoosh.mp3', 0.25);
	add(cueFrame('hook', 'reservas') - 2, 'click.wav', 0.7);
	add(cueFrame('hook', 'reservas') + 3, 'ding.wav', 0.25);
	add(s('hook', cue('hook', 'barrio') - 0.6), 'pop.mp3', 0.45);
	add(cueFrame('hook', 'barrio') - 40, 'riser.mp3', 0.3);
	// global
	add(cueFrame('global', '2'), 'pop.mp3', 0.4);
	add(cueFrame('global', '2025'), 'ticks.mp3', 0.3);
	add(cueFrame('global', '8') - 30, 'riser.mp3', 0.35);
	add(cueFrame('global', '8'), 'impact.mp3', 0.55);
	add(cueFrame('global', '8') + 5, 'pop.mp3', 0.4);
	// vallarta
	add(cueFrame('vallarta', 'seis'), 'ticks.mp3', 0.3);
	add(cueFrame('vallarta', 'millones') + 8, 'pop.mp3', 0.35);
	add(cueFrame('vallarta', '2026'), 'pop.mp3', 0.3);
	add(cueFrame('vallarta', 'doce'), 'ticks.mp3', 0.3);
	add(s('vallarta', cue('vallarta', 'seiscientas') + 0.5), 'impact.mp3', 0.5);
	// study
	add(cueFrame('study', 'Jorge'), 'pop.mp3', 0.3);
	add(cueFrame('study', 'María'), 'pop.mp3', 0.3);
	add(cueFrame('study', 'tres'), 'riser.mp3', 0.25);
	add(cueFrame('study', 'Versalles'), 'pop.mp3', 0.4);
	add(cueFrame('study', 'Díaz'), 'pop.mp3', 0.4);
	add(cueFrame('study', 'Los'), 'pop.mp3', 0.4);
	// findings
	add(cueFrame('findings', 'cerca'), 'ticks.mp3', 0.25);
	add(cueFrame('findings', 'unos'), 'whoosh.mp3', 0.2);
	add(cueFrame('findings', 'setecientos'), 'ticks.mp3', 0.25);
	add(cueFrame('findings', 'más') - 4, 'rumble.mp3', 0.55);
	add(cueFrame('findings', 'construcción'), 'rumble.mp3', 0.4);
	// effects
	add(cueFrame('effects', 'desaparecen'), 'rumble.mp3', 0.3);
	add(cueFrame('effects', 'Precios'), 'whoosh.mp3', 0.2);
	add(cueFrame('effects', 'Vecinos'), 'whoosh.mp3', 0.2);
	add(cueFrame('effects', 'identidad'), 'impact.mp3', 0.4);
	// zones
	add(cueFrame('zones', 'ocho') - 30, 'riser.mp3', 0.3);
	add(cueFrame('zones', 'ocho'), 'impact.mp3', 0.55);
	add(cueFrame('zones', 'ciudad'), 'pop.mp3', 0.35);
	// outro
	add(cueFrame('outro', 'Topofilia'), 'pop.mp3', 0.35);
	add(cueFrame('outro', 'Y') - 4, 'whoosh.mp3', 0.4);
	add(cueFrame('outro', 'barrio'), 'impact.mp3', 0.45);
	add(cueFrame('outro', 'transformando') + 20, 'ding.wav', 0.3);
	return list;
})();

const MUSIC_END_RAMP = TOTAL_FRAMES - Math.round(4.2 * FPS);

const ProgressBar: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<div style={{position: 'absolute', top: 120, left: 72, right: 72, display: 'flex', gap: 10}}>
			{SCENES.map((s) => {
				const p = Math.min(1, Math.max(0, (frame - s.from) / s.duration));
				return (
					<div key={s.id} style={{flex: 1, height: 6, borderRadius: 9, background: 'rgba(255,255,255,0.18)'}}>
						<div style={{width: `${p * 100}%`, height: '100%', borderRadius: 9, background: C.ink}} />
					</div>
				);
			})}
		</div>
	);
};

export const V1LosNumeros: React.FC = () => {
	const frame = useCurrentFrame();
	const fadeIn = interpolate(frame, [0, 10], [0, 1], {extrapolateRight: 'clamp'});
	const fadeOut = interpolate(frame, [TOTAL_FRAMES - 15, TOTAL_FRAMES], [1, 0], {extrapolateLeft: 'clamp'});
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>
				<City3D />
				<AbsoluteFill
					style={{
						background:
							'linear-gradient(180deg, rgba(6,8,13,0.92) 0%, rgba(6,8,13,0.55) 28%, rgba(6,8,13,0) 45%, rgba(6,8,13,0) 62%, rgba(6,8,13,0.75) 78%, rgba(6,8,13,0.95) 100%)',
					}}
				/>
				<AbsoluteFill style={{boxShadow: 'inset 0 0 220px rgba(0,0,0,0.7)'}} />
				{SCENES.map((s) => {
					const O = OVERLAYS[s.id];
					return (
						<Sequence key={s.id} from={s.from} durationInFrames={s.duration} name={s.id}>
							<O />
						</Sequence>
					);
				})}
				<Bridge />
				<Captions />
				<ProgressBar />
			</AbsoluteFill>

			{/* audio */}
			{SCENES.map((s) => (
				<Sequence key={`a-${s.id}`} from={s.from} durationInFrames={s.duration} name={`voz ${s.id}`}>
					<Audio src={staticFile(s.audio)} />
				</Sequence>
			))}
			<Audio
				src={staticFile('music/bed.mp3')}
				volume={(f) =>
					interpolate(f, [0, 15, MUSIC_END_RAMP, MUSIC_END_RAMP + 20, TOTAL_FRAMES - 20, TOTAL_FRAMES], [0, 0.14, 0.14, 0.34, 0.34, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})
				}
			/>
			{SFX.map((x, i) => (
				<Sequence key={`sfx-${i}`} from={Math.max(0, x.at)} durationInFrames={Math.round(3 * FPS)} name={`sfx ${x.src}`}>
					<Audio src={staticFile(x.src)} volume={x.volume} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
