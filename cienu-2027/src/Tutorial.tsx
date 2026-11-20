import React from 'react';
import {AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile} from 'remotion';

const FPS = 30;
const f = (s: number) => Math.round(s * FPS);

// Voz en off (public/tutorial/vo/NN.wav): segundo de inicio y duración
const voice: [number, number][] = [
	[0.3, 4.17], // ¡Hola! Así te registras…
	[6.0, 3.77], // Paso 1: entra al gestor
	[10.3, 5.59], // Paso 2: nombre y apellidos
	[22.2, 2.3], // fecha de nacimiento
	[25.2, 2.3], // correo
	[27.7, 6.53], // contraseña
	[34.6, 2.52], // confírmala
	[37.6, 6.25], // Paso 3: código
	[45.2, 3.61], // Paso 4: inicia sesión
	[49.3, 4.16], // Paso 5: datos generales
	[53.8, 3.35], // sexo, país, institución
	[62.2, 2.25], // campus
	[65.3, 1.59], // celular
	[71.1, 3.68], // presencial o virtual
	[75.4, 6.24], // Paso 6: perfil académico
	[82.2, 6.67], // PRODEP y SNII
	[94.2, 3.76], // RIDMAE
	[99.4, 2.37], // ORCID
	[102.3, 5.68], // Paso 7: cómo participar
	[110.2, 8.38], // Paso 8: envía tu resumen
	[120.4, 5.73], // ¡No lo olvides!
];

// Efectos: [segundo, archivo, volumen]
const steps = [6, 10, 36, 45, 49, 75, 102, 110];
const sfx: [number, string, number][] = [
	[0.1, 'pop', 0.4],
	...steps.map((s): [number, string, number] => [s - 0.2, 'whoosh', 0.3]),
	[119.8, 'whoosh', 0.45],
	[120.3, 'ding', 0.35],
];

// La música baja cuando habla Ximena
const musicVolume = (frame: number) => {
	let duck = 0;
	for (const [s, len] of voice) {
		duck = Math.max(
			duck,
			interpolate(frame, [f(s) - 6, f(s), f(s + len), f(s + len) + 12], [0, 1, 1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		);
	}
	return 0.26 - duck * 0.18;
};

export const Tutorial: React.FC = () => {
	return (
		<AbsoluteFill style={{background: 'white'}}>
			<OffthreadVideo src={staticFile('tutorial/video.mp4')} muted />
			<Audio src={staticFile('tutorial/music.wav')} volume={musicVolume} />
			{voice.map(([s], i) => (
				<Sequence key={`vo${i}`} from={f(s)} layout="none">
					<Audio src={staticFile(`tutorial/vo/${String(i).padStart(2, '0')}.wav`)} volume={1} />
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
