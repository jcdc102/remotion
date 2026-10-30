import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile, Track } from "remotion";
import { Final, Titulo, Verso } from "./Escenas";
import { PapelPicado } from "./PapelPicado";
import { Petalos } from "./Petalos";

export const Calaveritas: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(circle at 50% 45%, #3c1361 0%, #240b3b 55%, #12061f 100%)",
      }}
    >
      <Petalos cantidad={45} />
      <PapelPicado />
      <Track name="Escenas">
        <Sequence name="Título" from={0} durationInFrames={60}>
          <Titulo />
        </Sequence>
        <Sequence name="Batería" from={60} durationInFrames={120}>
          <Verso
            numero={1}
            inicioLinea2={68}
            icono="🔋"
            linea1="A la batería nadie la revisó,"
            linea2="y un lunes frío ya no arrancó."
          />
        </Sequence>
        <Sequence name="Luz de motor" from={180} durationInFrames={120}>
          <Verso
            numero={2}
            inicioLinea2={66}
            icono="🚨"
            linea1="La luz de motor se prendió con razón,"
            linea2="y su dueño la tapó con un cartón."
          />
        </Sequence>
        <Sequence name="Aceite" from={300} durationInFrames={120}>
          <Verso
            numero={3}
            inicioLinea2={62}
            icono="🛢️"
            linea1="Al aceite lo dejaron sin cambiar,"
            linea2="y la calaca vino a cobrar."
          />
        </Sequence>
        <Sequence name="Final" from={420} durationInFrames={60}>
          <Final />
        </Sequence>
      </Track>
      <Track name="Voz en off">
        <Sequence name="Voz: Título" from={15} durationInFrames={34}>
          <Audio src={staticFile("voz/titulo.wav")} volume={1} />
        </Sequence>
        <Sequence name="Voz: Batería, línea 1" from={66} durationInFrames={59}>
          <Audio src={staticFile("voz/v1a.wav")} volume={1} />
        </Sequence>
        <Sequence name="Voz: Batería, línea 2" from={128} durationInFrames={48}>
          <Audio src={staticFile("voz/v1b.wav")} volume={1} />
        </Sequence>
        <Sequence name="Voz: Luz de motor, línea 1" from={186} durationInFrames={55}>
          <Audio src={staticFile("voz/v2a.wav")} volume={1} />
        </Sequence>
        <Sequence name="Voz: Luz de motor, línea 2" from={246} durationInFrames={51}>
          <Audio src={staticFile("voz/v2b.wav")} volume={1} />
        </Sequence>
        <Sequence name="Voz: Aceite, línea 1" from={306} durationInFrames={52}>
          <Audio src={staticFile("voz/v3a.wav")} volume={1} />
        </Sequence>
        <Sequence name="Voz: Aceite, línea 2" from={362} durationInFrames={46}>
          <Audio src={staticFile("voz/v3b.wav")} volume={1} />
        </Sequence>
        <Sequence name="Voz: Cierre" from={424} durationInFrames={52}>
          <Audio src={staticFile("voz/final.wav")} volume={1} />
        </Sequence>
      </Track>
      <Track name="Música">
        <Sequence name="Vals de fondo" from={0} durationInFrames={480}>
          <Audio src={staticFile("musica.wav")} volume={0.35} />
        </Sequence>
      </Track>
      <Track name="Sonidos">
        <Sequence name="Ding batería" from={60} durationInFrames={36}>
          <Audio src={staticFile("ding.wav")} volume={1} />
        </Sequence>
        <Sequence name="Ding luz de motor" from={180} durationInFrames={36}>
          <Audio src={staticFile("ding.wav")} volume={1} />
        </Sequence>
        <Sequence name="Ding aceite" from={300} durationInFrames={36}>
          <Audio src={staticFile("ding.wav")} volume={1} />
        </Sequence>
        <Sequence name="Campana final" from={420} durationInFrames={60}>
          <Audio src={staticFile("campana.wav")} volume={0.7} />
        </Sequence>
      </Track>
    </AbsoluteFill>
  );
};
