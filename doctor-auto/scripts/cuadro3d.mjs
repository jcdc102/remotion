// Cuadros de prueba con WebGL (para escenas 3D). Uso: node scripts/cuadro3d.mjs <composición> <props-json> <segundos...>
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const cwd = process.cwd();
const [id, props, ...seg] = process.argv.slice(2);
const inputProps = JSON.parse(props);
const serveUrl = await bundle({ entryPoint: path.join(cwd, "src/index.ts"), publicDir: path.join(cwd, "public") });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const chromiumOptions = { ignoreCertificateErrors: true, gl: "swangle" };
const composition = await selectComposition({ serveUrl, id, inputProps, browserExecutable, chromiumOptions });
for (const s of seg.map(Number)) {
  const frame = Math.round(s * 30);
  await renderStill({ composition, serveUrl, frame, inputProps, output: `out/c/${id}-${String(frame).padStart(4, "0")}.png`, scale: 0.4, browserExecutable, imageFormat: "png", chromiumOptions, timeoutInMilliseconds: 120000 });
  process.stdout.write(`${s} `);
}
