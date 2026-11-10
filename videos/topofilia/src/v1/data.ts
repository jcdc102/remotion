import {WORDS} from './words';

export const FPS = 30;

type SceneDef = {
	id: string;
	audio: string;
	audioDuration: number;
	extraHold?: number;
};

const GAP = 0.35;

const DEFS: SceneDef[] = [
	{id: 'hook', audio: 'v1/s1.mp3', audioDuration: 9.33},
	{id: 'global', audio: 'v1/s2.mp3', audioDuration: 9.8},
	{id: 'vallarta', audio: 'v1/s3.mp3', audioDuration: 10.45},
	{id: 'study', audio: 'v1/s4.mp3', audioDuration: 10.19},
	{id: 'findings', audio: 'v1/s5.mp3', audioDuration: 8.12},
	{id: 'effects', audio: 'v1/s6.mp3', audioDuration: 9.4},
	{id: 'zones', audio: 'v1/s7.mp3', audioDuration: 8.67},
	{id: 'outro', audio: 'v1/s8.mp3', audioDuration: 8.28, extraHold: 4},
];

export type Scene = SceneDef & {from: number; duration: number};

export const SCENES: Scene[] = (() => {
	let from = 0;
	return DEFS.map((d) => {
		const duration = Math.ceil((d.audioDuration + GAP + (d.extraHold ?? 0)) * FPS);
		const s = {...d, from, duration};
		from += duration;
		return s;
	});
})();

export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.duration, 0);

export const sceneOf = (id: string) => {
	const s = SCENES.find((x) => x.id === id);
	if (!s) {
		throw new Error(`Unknown scene ${id}`);
	}
	return s;
};

export const sceneStart = (id: string) => sceneOf(id).from;

const norm = (w: string) =>
	w
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9]/g, '');

/**
 * Second (relative to the scene) at which a word starts being spoken.
 * Used to sync every on-screen entrance to the narration.
 */
export const cue = (sceneId: string, word: string, nth = 0): number => {
	const target = norm(word);
	let seen = 0;
	for (const [text, start] of WORDS[sceneId]) {
		if (norm(text) === target) {
			if (seen === nth) {
				return start;
			}
			seen++;
		}
	}
	throw new Error(`Word "${word}" not found in scene ${sceneId}`);
};

/** Global frame for a word cue. */
export const cueFrame = (sceneId: string, word: string, nth = 0) =>
	sceneStart(sceneId) + Math.round(cue(sceneId, word, nth) * FPS);
