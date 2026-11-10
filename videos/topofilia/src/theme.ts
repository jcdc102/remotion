import {continueRender, delayRender, staticFile} from 'remotion';

// Fonts are bundled in public/fonts so renders work offline.
const loadLocalFont = (family: string, file: string) => {
	if (typeof document === 'undefined') {
		return;
	}
	const handle = delayRender(`Loading font ${family}`);
	const face = new FontFace(family, `url(${staticFile(file)}) format('woff2')`, {
		weight: '100 900',
	});
	face
		.load()
		.then(() => {
			(document.fonts as unknown as Set<FontFace>).add(face);
			continueRender(handle);
		})
		.catch((err) => {
			console.error(err);
			continueRender(handle);
		});
};

loadLocalFont('Unbounded', 'fonts/Unbounded-latin.woff2');
loadLocalFont('Inter', 'fonts/Inter-latin.woff2');

export const DISPLAY = 'Unbounded, sans-serif';
export const BODY = 'Inter, sans-serif';

export const C = {
	bg: '#06080d',
	ink: '#F6F1EA',
	muted: 'rgba(246,241,234,0.62)',
	red: '#E5262F',
	redGlow: '#FF3B47',
	sand: '#EBC98F',
	ocean: '#0E3A55',
	glass: 'rgba(14,18,28,0.55)',
	stroke: 'rgba(255,255,255,0.14)',
};
