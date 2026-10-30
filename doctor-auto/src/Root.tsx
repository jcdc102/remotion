import { Composition } from "remotion";
import { Calaveritas } from "./Calaveritas";
import { DURACION, FPS } from "./estructura8/datos";
import { DURACION_ALINEACION } from "./estructura8/alineacion/Alineacion";
import { Estructura8, type TemaEstructura8 } from "./estructura8/Estructura8";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Calaveritas"
        component={Calaveritas}
        durationInFrames={480}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="Estructura8"
        component={Estructura8}
        defaultProps={{ tema: "alineacion" as TemaEstructura8 }}
        durationInFrames={DURACION * FPS}
        calculateMetadata={({ props }) => ({
          durationInFrames: (props.tema === "alineacion" ? DURACION_ALINEACION : DURACION) * FPS,
        })}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
