import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {BODY, C} from '../theme';
import {City3D} from './City3D';
import {FPS, SCENES, TOTAL_FRAMES} from './data';
import {
	EffectsOverlay,
	FindingsOverlay,
	GlobalOverlay,
	HookOverlay,
	OutroOverlay,
	StudyOverlay,
	VallartaOverlay,
	ZonesOverlay,
} from './Overlays';

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

type Word = {text: string; start: number; end: number; page: number};

// Word timings: each phrase is spread over its measured time window,
// weighting by length (digits count extra because they are spoken long).
const useWords = () =>
	useMemo(() => {
		const words: Word[] = [];
		let page = 0;
		for (const scene of SCENES) {
			for (const seg of scene.segments) {
				const parts = seg.text.split(' ');
				const weights = parts.map((p) => (/\d/.test(p) ? p.length * 3 : p.length) + 2);
				const total = weights.reduce((a, b) => a + b, 0);
				let t = seg.start;
				let inPage = 0;
				page++;
				parts.forEach((p, i) => {
					const d = ((seg.end - seg.start) * weights[i]) / total;
					if (inPage === 4) {
						page++;
						inPage = 0;
					}
					words.push({
						text: p,
						start: scene.from + t * FPS,
						end: scene.from + (t + d) * FPS,
						page,
					});
					inPage++;
					t += d;
				});
			}
		}
		return words;
	}, []);

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const words = useWords();
	let idx = -1;
	for (let i = 0; i < words.length; i++) {
		if (words[i].start <= frame) {
			idx = i;
		}
	}
	if (idx < 0) {
		return null;
	}
	const current = words[idx];
	// hide during long silences
	if (frame > current.end + 12) {
		return null;
	}
	const page = words.filter((w) => w.page === current.page);
	const pageStart = page[0].start;
	const pop = interpolate(frame, [pageStart, pageStart + 5], [0.9, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', top: 1330}}>
			<div
				style={{
					maxWidth: 900,
					textAlign: 'center',
					transform: `scale(${pop})`,
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
					const said = w.start <= frame;
					return (
						<span
							key={i}
							style={{
								color: active ? C.redGlow : said ? C.ink : 'rgba(246,241,234,0.45)',
								marginRight: 16,
								display: 'inline-block',
							}}
						>
							{w.text}
						</span>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};

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
		<AbsoluteFill style={{background: C.bg, opacity: Math.min(fadeIn, fadeOut)}}>
			<City3D />
			{/* readability gradients */}
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
						<Audio src={staticFile(s.audio)} />
						<O />
					</Sequence>
				);
			})}
			<Captions />
			<ProgressBar />
		</AbsoluteFill>
	);
};
