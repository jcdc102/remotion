import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile} from 'remotion';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

// Voice-over lines (public/ejes/vo/NN.wav): start second and length in seconds
const voice: [number, number][] = [
	[0.1, 4.53], // ¿Sobre qué puedes presentar...? ¡Hay seis ejes temáticos!
	[4.85, 3.64], // El tema
	[9.65, 4.28], // Eje uno
	[14.65, 3.87], // Eje dos
	[19.6, 4.89], // Eje tres
	[24.65, 4.1], // Eje cuatro
	[29.65, 4.33], // Eje cinco
	[34.55, 4.92], // Eje seis
	[39.6, 4.97], // La IA es transversal
	[44.75, 4.11], // Envía tu resumen... ¡Nos vemos en Puerto Vallarta!
];

// Sound effects: [second, file, volume]
const ejeStarts = [9.5, 14.5, 19.5, 24.5, 29.5, 34.5];
const sfx: [number, string, number][] = [
	[0.9, 'pop', 0.45],
	[2.0, 'pop', 0.6],
	[4.35, 'whoosh', 0.6],
	[5.0, 'whip', 0.35],
	[8.75, 'whoosh', 0.3],
	...ejeStarts.map((s): [number, string, number] => [s, 'pop', 0.45]),
	...ejeStarts.slice(1).map((s): [number, string, number] => [s - 1.2, 'whoosh', 0.4]),
	[39.3, 'whoosh', 0.6],
	...[0, 1, 2, 3, 4, 5, 6].map((i): [number, string, number] => [40.0 + i * 0.33, 'pop', 0.3]),
	[44.15, 'whoosh', 0.5],
	[44.5, 'ding', 0.4],
	...Array.from({length: 12}, (_, i): [number, string, number] => [45.6 + i * 0.1, 'mouse-click', 0.14]),
];

// Music ducks under the voice
const musicVolume = (frame: number) => {
	let duck = 0;
	for (const [s, len] of voice) {
		duck = Math.max(
			duck,
			interpolate(frame, [f(s) - 6, f(s), f(s + len), f(s + len) + 10], [0, 1, 1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		);
	}
	return 0.5 - duck * 0.3;
};

export const Ejes: React.FC = () => {
	return (
		<AbsoluteFill style={{background: 'white'}}>
			<OffthreadVideo src={staticFile('ejes/video.mp4')} muted />
			<Audio src={staticFile('ejes/music.wav')} volume={musicVolume} />
			{voice.map(([s], i) => (
				<Sequence key={`vo${i}`} from={f(s)} layout="none">
					<Audio src={staticFile(`ejes/vo/${String(i).padStart(2, '0')}.wav`)} volume={1} />
				</Sequence>
			))}
			{sfx.map(([s, file, volume], i) => (
				<Sequence key={`sfx${i}`} from={f(s)} layout="none">
					<Audio src={staticFile(`sfx/${file}.wav`)} volume={volume} />
				</Sequence>
			))}
		</AbsoluteFill>
	);
};
