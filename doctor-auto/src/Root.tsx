import { Composition } from "remotion";
import { Calaveritas } from "./Calaveritas";
import { Prueba3D } from "./pruebas/Prueba3D";
import { DURACION, FPS } from "./estructura8/datos";
import { DURACION_ALINEACION } from "./estructura8/alineacion/Alineacion";
import { DURACION_PASAR_CORRIENTE } from "./estructura8/pasar-corriente/datos";
import { DURACION_RUIDOS } from "./estructura8/ruidos/Ruidos";
import { DURACION_VIAJE_PRO as DURACION_VIAJE } from "./estructura8/viaje/ViajePro";
import { DURACION_MITOS_PRO as DURACION_MITOS } from "./estructura8/mitos/MitosPro";
import { DURACION_CALOR } from "./estructura8/calor/CalorPro";
import { DURACION_ADIVINA } from "./estructura8/adivina/AdivinaPro";
import { Estructura8, type TemaEstructura8 } from "./estructura8/Estructura8";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Prueba3D" component={Prueba3D} durationInFrames={60} fps={30} width={1080} height={1920} />
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
        defaultProps={{ tema: "viaje" as TemaEstructura8 }}
        durationInFrames={DURACION * FPS}
        calculateMetadata={({ props }) => ({
          // pasar-corriente: la duración sale de la suma de los clips de voz + pausas.
          durationInFrames: Math.ceil(
            (props.tema === "calor" ? DURACION_CALOR : props.tema === "adivina" ? DURACION_ADIVINA : props.tema === "mitos" ? DURACION_MITOS : props.tema === "viaje" ? DURACION_VIAJE : props.tema === "ruidos" ? DURACION_RUIDOS : props.tema === "pasar-corriente" ? DURACION_PASAR_CORRIENTE : props.tema === "alineacion" ? DURACION_ALINEACION : DURACION) * FPS,
          ),
        })}
        fps={FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
