export const FPS = 30;

// Each caption segment is a phrase between pauses, timed (in seconds) from
// silence detection on the narration file.
export type Segment = {text: string; start: number; end: number};

type SceneDef = {
	id: string;
	audio: string;
	audioDuration: number;
	segments: Segment[];
	extraHold?: number;
};

const GAP = 0.3;

const DEFS: SceneDef[] = [
	{
		id: 'hook',
		audio: 'v1/s1.mp3',
		audioDuration: 9.33,
		segments: [
			{text: 'Abres la app,', start: 0.08, end: 0.88},
			{text: 'eliges un depa frente al mar en Puerto Vallarta...', start: 1.16, end: 3.74},
			{text: 'y reservas.', start: 4.1, end: 4.88},
			{text: 'Fácil, ¿no?', start: 5.17, end: 5.88},
			{text: 'Pero, ¿qué pasa con el barrio donde te vas a quedar?', start: 6.26, end: 9.2},
		],
	},
	{
		id: 'global',
		audio: 'v1/s2.mp3',
		audioDuration: 9.8,
		segments: [
			{text: 'En 2016 había dos millones de rentas vacacionales activas en plataformas digitales.', start: 0.06, end: 5.84},
			{text: 'En 2025... más de ocho millones.', start: 6.27, end: 9.65},
		],
	},
	{
		id: 'vallarta',
		audio: 'v1/s3.mp3',
		audioDuration: 10.45,
		segments: [
			{text: 'Puerto Vallarta recibió más de seis millones de visitantes en 2025.', start: 0.06, end: 4.61},
			{text: 'Y a inicios de 2026, ya tenía más de doce mil seiscientas rentas activas.', start: 4.99, end: 10.3},
		],
	},
	{
		id: 'study',
		audio: 'v1/s4.mp3',
		audioDuration: 10.19,
		segments: [
			{text: 'Una investigación de Jorge Luis López Ramos y María de los Ángeles Huízar Sánchez se metió a fondo en tres colonias:', start: 0.06, end: 6.95},
			{text: 'Versalles, Díaz Ordaz y Los Mangos.', start: 7.27, end: 10.05},
		],
	},
	{
		id: 'findings',
		audio: 'v1/s5.mp3',
		audioDuration: 8.12,
		segments: [
			{text: 'Ahí encontraron cerca de mil rentas vacacionales, unos setecientos comercios...', start: 0.06, end: 5.11},
			{text: 'y cada vez más torres en construcción.', start: 5.37, end: 8.0},
		],
	},
	{
		id: 'effects',
		audio: 'v1/s6.mp3',
		audioDuration: 9.4,
		segments: [
			{text: 'Casas tradicionales que desaparecen.', start: 0.06, end: 2.25},
			{text: 'Precios del suelo que suben.', start: 2.66, end: 4.3},
			{text: 'Vecinos que se van.', start: 4.69, end: 5.91},
			{text: 'Un barrio que poco a poco pierde su identidad.', start: 6.29, end: 9.25},
		],
	},
	{
		id: 'zones',
		audio: 'v1/s7.mp3',
		audioDuration: 8.67,
		segments: [
			{text: 'Y ojo: no es un caso aislado.', start: 0.06, end: 2.17},
			{text: 'Las rentas ya se concentran en ocho zonas de la ciudad...', start: 2.52, end: 5.64},
			{text: 'y todas eran barrios de vivienda local.', start: 6.04, end: 8.55},
		],
	},
	{
		id: 'outro',
		audio: 'v1/s8.mp3',
		audioDuration: 8.28,
		extraHold: 4,
		segments: [
			{text: 'El estudio completo está en la revista Topofilia.', start: 0.06, end: 3.08},
			{text: 'Y el próximo mes...', start: 3.39, end: 4.55},
			{text: 'te contamos la historia del barrio que se está transformando.', start: 4.82, end: 8.15},
		],
	},
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

export const sceneStart = (id: string) => {
	const s = SCENES.find((x) => x.id === id);
	if (!s) {
		throw new Error(`Unknown scene ${id}`);
	}
	return s.from;
};
