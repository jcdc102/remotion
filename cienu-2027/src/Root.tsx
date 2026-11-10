import {Composition} from 'remotion';
import {Convocatoria} from './Convocatoria';

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="Convocatoria"
			component={Convocatoria}
			durationInFrames={480}
			fps={30}
			width={1080}
			height={1920}
		/>
	);
};
