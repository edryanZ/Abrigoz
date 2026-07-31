import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = new URL("../", import.meta.url);
const publicDir = new URL("../public/", import.meta.url);
const audioDir = new URL("../public/audio/", import.meta.url);
const brandingDir = new URL("../public/branding/", import.meta.url);
const distDir = new URL("../dist/", import.meta.url);

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
assert.equal((await readdir(publicDir, { recursive: true }))
  .some((file) => /\.(mp4|webm|gif)$/i.test(file)), false, "Vídeo ou GIF pesado encontrado.");

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
try {
  const assets = await readdir(new URL("assets/", distDir));
  const javascript = assets.filter((file) => file.endsWith(".js"));
  const sizes = Object.fromEntries(await Promise.all(javascript.map(async (file) =>
    [file, (await stat(new URL(`assets/${file}`, distDir))).size])));
  const main = Object.entries(sizes).filter(([file]) => file.startsWith("index-"))
    .sort((first, second) => second[1] - first[1])[0];
  const assistant = Object.entries(sizes).find(([file]) => file.startsWith("Assistant-"));
  const exportChunk = Object.entries(sizes).find(([file]) => file.startsWith("ExportCenter-"));
  assert.ok(main?.[1] < 400 * 1024, "Bundle principal excede 400 KB.");
  assert.ok(assistant?.[1] < 100 * 1024, "Chunk do Assistente ausente ou excessivo.");
  assert.ok(exportChunk?.[1] < 100 * 1024, "Chunk da Exportação ausente ou excessivo.");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
console.log(`Orçamentos aprovados: ${audioFiles.length} faixas; public ${
  (await directorySize(publicDir) / 1024 / 1024).toFixed(2)} MB.`);
