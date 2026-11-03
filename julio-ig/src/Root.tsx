import { Composition } from "remotion";
import { VuelosBaratos, DURACION_VUELOS } from "./VuelosBaratos";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="VuelosBaratos"
      component={VuelosBaratos}
      durationInFrames={DURACION_VUELOS}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
