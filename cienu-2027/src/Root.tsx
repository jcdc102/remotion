import {Composition} from 'remotion';
import {Convocatoria} from './Convocatoria';
import {Ejes} from './Ejes';

export const RemotionRoot: React.FC = () => {
	return (
		<>
		<Composition
			id="Convocatoria"
			component={Convocatoria}
			durationInFrames={480}
			fps={30}
			width={1080}
			height={1920}
		/>
		<Composition
			id="Ejes"
			component={Ejes}
			durationInFrames={1560}
			fps={30}
			width={1080}
			height={1920}
		/>
		</>
	);
};
