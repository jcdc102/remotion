import { Composition } from "remotion";
import { VuelosBaratos, DURACION_VUELOS } from "./VuelosBaratos";
import { Turistificacion, DURACION_TURISTIFICACION } from "./Turistificacion";
import { TiposDeTurismo, DURACION_TIPOS } from "./TiposDeTurismo";
import { ReflexionDar, DURACION_REFLEXION_DAR } from "./ReflexionDar";
import { Diciembre, DURACION_DICIEMBRE } from "./Diciembre";
import { Algodones, DURACION_ALGODONES } from "./Algodones";
import { AtardecerFrase, DURACION_ATARDECER } from "./AtardecerFrase";
import { RadarPromo, DURACION_RADAR } from "./RadarPromo";
import { HistoriaAlgodones, DURACION_HISTORIA_ALGODONES } from "./HistoriaAlgodones";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="VuelosBaratos" component={VuelosBaratos} durationInFrames={DURACION_VUELOS} fps={30} width={1080} height={1920} />
      <Composition
        id="Turistificacion"
        component={Turistificacion}
        durationInFrames={DURACION_TURISTIFICACION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition id="TiposDeTurismo" component={TiposDeTurismo} durationInFrames={DURACION_TIPOS} fps={30} width={1080} height={1920} />
      <Composition id="ReflexionDar" component={ReflexionDar} durationInFrames={DURACION_REFLEXION_DAR} fps={30} width={1080} height={1920} />
      <Composition id="Diciembre" component={Diciembre} durationInFrames={DURACION_DICIEMBRE} fps={30} width={1080} height={1920} />
      <Composition id="Algodones" component={Algodones} durationInFrames={DURACION_ALGODONES} fps={30} width={1080} height={1920} />
      <Composition id="HistoriaAlgodones" component={HistoriaAlgodones} durationInFrames={DURACION_HISTORIA_ALGODONES} fps={30} width={1080} height={1920} />
      <Composition id="RadarPromo" component={RadarPromo} durationInFrames={DURACION_RADAR} fps={30} width={1080} height={1920} defaultProps={{ horizontal: false }} />
      <Composition id="RadarPromoHorizontal" component={RadarPromo} durationInFrames={DURACION_RADAR} fps={30} width={1920} height={1080} defaultProps={{ horizontal: true }} />
      <Composition id="AtardecerFrase" component={AtardecerFrase} durationInFrames={DURACION_ATARDECER} fps={30} width={1080} height={1920} />
    </>
  );
};
