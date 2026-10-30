import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

export const tituloFont = "Lilita One";
export const versoFont = "BalooDos";

loadFont({
  family: tituloFont,
  url: staticFile("LilitaOne.woff2"),
  weight: "400",
});
loadFont({
  family: versoFont,
  url: staticFile("Baloo2-ExtraBold.woff2"),
  weight: "800",
});
