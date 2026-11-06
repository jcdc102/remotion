import { Composition } from "remotion";
import { Calaveritas } from "./Calaveritas";
import { DURACION, FPS } from "./estructura8/datos";
import { DURACION_ALINEACION } from "./estructura8/alineacion/Alineacion";
import { DURACION_PASAR_CORRIENTE } from "./estructura8/pasar-corriente/datos";
import { DURACION_RUIDOS } from "./estructura8/ruidos/Ruidos";
import { DURACION_VIAJE } from "./estructura8/viaje/Viaje";
import { DURACION_MITOS } from "./estructura8/mitos/Mitos";
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
        defaultProps={{ tema: "mitos" as TemaEstructura8 }}
        durationInFrames={DURACION * FPS}
        calculateMetadata={({ props }) => ({
          // pasar-corriente: la duración sale de la suma de los clips de voz + pausas.
          durationInFrames: Math.ceil(
            (props.tema === "mitos" ? DURACION_MITOS : props.tema === "viaje" ? DURACION_VIAJE : props.tema === "ruidos" ? DURACION_RUIDOS : props.tema === "pasar-corriente" ? DURACION_PASAR_CORRIENTE : props.tema === "alineacion" ? DURACION_ALINEACION : DURACION) * FPS,
          ),
        })}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
