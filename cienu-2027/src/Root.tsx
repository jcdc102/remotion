import {Composition} from 'remotion';
import {Convocatoria} from './Convocatoria';
import {Ejes} from './Ejes';
import {Tutorial} from './Tutorial';

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
		<Composition
			id="Tutorial"
			component={Tutorial}
			durationInFrames={3855}
			fps={30}
			width={1920}
			height={1080}
		/>
		</>
	);
};
