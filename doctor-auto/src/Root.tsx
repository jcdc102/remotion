import { Composition, Still } from "remotion";
import { MemeImagen } from "./memes/MemeImagen";
import { Vocho, DURACION_VOCHO } from "./memes/Vocho";
import { TakaAnimado, DURACION_TAKA_ANIMADO } from "./memes/TakaAnimado";
import { TakaPremium, DURACION_TAKA_PREMIUM } from "./memes/TakaPremium";
import { Taka3D, DURACION_TAKA3D } from "./memes/Taka3D";
import { AudioMeme, AUDIO_LLORAR, AUDIO_TAKA, duracionAudioMeme } from "./memes/AudioMeme";
import { Recorte, RECORTE_CHOQUE, duracionRecorte } from "./memes/Recorte";
import { Reaccion, REACCION_CHOQUE, duracionReaccion } from "./memes/Reaccion";
import { Meme, MEME_COFRE, MEME_FRIO, MEME_QUINCENA, MEME_RUIDITO, duracionMeme } from "./memes/Meme";
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
      <Composition id="MemeRuidito" component={Meme} defaultProps={MEME_RUIDITO} durationInFrames={duracionMeme(MEME_RUIDITO.tomas)} fps={30} width={1080} height={1920} />
      <Composition id="MemeQuincena" component={Meme} defaultProps={MEME_QUINCENA} durationInFrames={duracionMeme(MEME_QUINCENA.tomas)} fps={30} width={1080} height={1920} />
      <Composition id="MemeCofre" component={Meme} defaultProps={MEME_COFRE} durationInFrames={duracionMeme(MEME_COFRE.tomas)} fps={30} width={1080} height={1920} />
      <Composition id="MemeFrio" component={Meme} defaultProps={MEME_FRIO} durationInFrames={duracionMeme(MEME_FRIO.tomas)} fps={30} width={1080} height={1920} />
      <Composition id="ReaccionChoque" component={Reaccion} defaultProps={REACCION_CHOQUE} durationInFrames={duracionReaccion(REACCION_CHOQUE)} fps={30} width={1080} height={1920} />
      <Composition id="RecorteChoque" component={Recorte} defaultProps={RECORTE_CHOQUE} durationInFrames={duracionRecorte(RECORTE_CHOQUE)} fps={30} width={1080} height={1920} />
      <Composition id="AudioLlorar" component={AudioMeme} defaultProps={AUDIO_LLORAR} durationInFrames={duracionAudioMeme(AUDIO_LLORAR)} fps={30} width={1080} height={1920} />
      <Composition id="AudioTaka" component={AudioMeme} defaultProps={AUDIO_TAKA} durationInFrames={duracionAudioMeme(AUDIO_TAKA)} fps={30} width={1080} height={1920} />
      <Composition id="Taka3D" component={Taka3D} durationInFrames={DURACION_TAKA3D} fps={30} width={1080} height={1920} />
      <Composition id="TakaPremium" component={TakaPremium} durationInFrames={DURACION_TAKA_PREMIUM} fps={30} width={1080} height={1920} />
      <Composition id="TakaAnimado" component={TakaAnimado} durationInFrames={DURACION_TAKA_ANIMADO} fps={30} width={1080} height={1920} />
      <Composition id="Vocho" component={Vocho} durationInFrames={DURACION_VOCHO} fps={30} width={1080} height={1920} />
      <Still id="MemeImgRin" component={MemeImagen} defaultProps={{ archivo: "memes-img/rin.jpg" }} width={1080} height={1350} />
      <Still id="MemeImgEmbrague" component={MemeImagen} defaultProps={{ archivo: "memes-img/embrague.jpg" }} width={1080} height={1350} />
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
