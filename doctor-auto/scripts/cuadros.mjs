import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const cwd = process.cwd();
const serveUrl = await bundle({ entryPoint: path.join(cwd, "src/index.ts"), publicDir: path.join(cwd, "public") });
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell";
const composition = await selectComposition({ serveUrl, id: "Estructura8", browserExecutable, chromiumOptions: { ignoreCertificateErrors: true } });
const segundos = process.argv.slice(2).map(Number);
for (const s of segundos) {
  const frame = Math.round(s * 30);
  await renderStill({ composition, serveUrl, frame, output: `out/c/${String(frame).padStart(4, "0")}.png`, scale: 0.35, browserExecutable, imageFormat: "png", chromiumOptions: { ignoreCertificateErrors: true } });
  process.stdout.write(`${s} `);
}
