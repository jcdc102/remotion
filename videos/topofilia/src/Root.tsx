import {Composition} from 'remotion';
import {V1LosNumeros} from './v1/V1LosNumeros';
import {FPS, TOTAL_FRAMES} from './v1/data';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="V1LosNumeros"
			component={V1LosNumeros}
			durationInFrames={TOTAL_FRAMES}
			fps={FPS}
			width={1080}
			height={1920}
		/>
	);
};
