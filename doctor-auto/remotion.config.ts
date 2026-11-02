/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { existsSync } from "node:fs";
import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);
// En el entorno en la nube se usa el Chromium ya instalado; en otra
// computadora, Remotion descarga su propio navegador.
const CHROMIUM_LOCAL =
  "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
if (existsSync(CHROMIUM_LOCAL)) {
  Config.setBrowserExecutable(CHROMIUM_LOCAL);
  // El proxy del entorno en la nube intercepta HTTPS con su propio certificado;
  // sin esto el navegador no puede descargar las fuentes de Google Fonts.
  Config.setChromiumIgnoreCertificateErrors(true);
}
