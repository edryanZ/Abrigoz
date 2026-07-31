import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const audioDir = new URL("../public/audio/", import.meta.url);
const brandingDir = new URL("../public/branding/", import.meta.url);

async function directorySize(directory) {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, directory);
    total += entry.isDirectory() ? await directorySize(target) : (await stat(target)).size;
  }
  return total;
}

function pngSize(buffer) {
  assert.equal(buffer.toString("ascii", 1, 4), "PNG");
  return [buffer.readUInt32BE(16), buffer.readUInt32BE(20)];
}

const audioFiles = (await readdir(audioDir)).filter((file) => file.endsWith(".mp3"));
const audioSizes = await Promise.all(audioFiles.map((file) => stat(new URL(file, audioDir))));
assert.ok(audioSizes.every(({ size }) => size < 3 * 1024 * 1024), "Uma faixa excede 3 MB.");
assert.ok(audioSizes.reduce((sum, { size }) => sum + size, 0) < 10 * 1024 * 1024,
  "O catálogo de áudio excede 10 MB.");
assert.ok(await directorySize(publicDir) < 25 * 1024 * 1024, "public excede 25 MB.");

for (const [file, expected] of [
  ["favicon-32.png", 32], ["apple-touch-icon.png", 180], ["icon-192.png", 192],
  ["icon-512.png", 512], ["icon-maskable-512.png", 512],
]) {
  const target = new URL(file, brandingDir);
  const buffer = await readFile(target);
  assert.deepEqual(pngSize(buffer), [expected, expected], `${file} possui dimensões incorretas.`);
  assert.ok(buffer.byteLength < 1024 * 1024, `${file} excede 1 MB.`);
}

const config = await readFile(new URL("vite.config.js", root), "utf8");
assert.ok(!config.includes("**/*.{js,css,html,ico,png,svg,mp3"),
  "MP3 não deve entrar no precache.");
console.log(`Orçamentos aprovados: ${audioFiles.length} faixas; public ${
  (await directorySize(publicDir) / 1024 / 1024).toFixed(2)} MB.`);
