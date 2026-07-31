import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const root = path.resolve("dist");
const assetsDirectory = path.join(root, "assets");
const routePrefixes = new Set([
  "Achievements", "AdminAnalytics", "Assistant", "Calendario", "Cartas",
  "Configuracoes", "Diary", "ExportCenter", "Favoritos", "GlobalSearch",
  "Habitos", "Lar", "Metas", "Sobre", "Statistics", "Welcome",
]);

function bytes(value) {
  return `${(value / 1024).toFixed(2)} KiB`;
}

function classify(file, entryFile) {
  if (file === entryFile) return "entrada";
  const prefix = path.basename(file).split("-")[0];
  if (routePrefixes.has(prefix)) return "rota";
  if (/^(fa|jsx-runtime|supabaseClient|workbox-window)/.test(prefix)) return "vendor";
  return "compartilhado";
}

async function collect(directory, base = directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, item.name);
    if (item.isDirectory()) files.push(...await collect(target, base));
    else files.push(path.relative(base, target).replaceAll(path.sep, "/"));
  }
  return files;
}

const indexHtml = await readFile(path.join(root, "index.html"), "utf8");
const entryFile = indexHtml.match(/<script[^>]+src="\/([^"]+index-[^"]+\.js)"/)?.[1];
const assetFiles = (await readdir(assetsDirectory)).filter((file) => /\.(js|css)$/.test(file));
const rows = [];

for (const file of assetFiles) {
  const relative = `assets/${file}`;
  const content = await readFile(path.join(root, relative));
  rows.push({
    file: relative,
    raw: content.byteLength,
    gzip: gzipSync(content, { level: 9 }).byteLength,
    type: classify(relative, entryFile),
  });
}

rows.sort((first, second) => second.raw - first.raw);
console.log("Arquivo".padEnd(58), "Bruto".padStart(11), "Gzip".padStart(11), "Classe");
for (const row of rows) {
  console.log(row.file.padEnd(58), bytes(row.raw).padStart(11),
    bytes(row.gzip).padStart(11), row.type);
}

const js = rows.filter(({ file }) => file.endsWith(".js"));
const css = rows.filter(({ file }) => file.endsWith(".css"));
const swSource = await readFile(path.join(root, "sw.js"), "utf8");
const precacheUrls = [...swSource.matchAll(/"url":\s*"([^"]+)"/g)].map((match) => match[1]);
const uniquePrecacheUrls = [...new Set(precacheUrls)];
let precacheBytes = 0;
for (const url of uniquePrecacheUrls) {
  const target = path.join(root, url);
  try {
    precacheBytes += (await stat(target)).size;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}
const allFiles = await collect(root);
const distBytes = (await Promise.all(allFiles.map((file) =>
  stat(path.join(root, file))))).reduce((total, file) => total + file.size, 0);

console.log("\nTotais");
console.log(`JS: ${bytes(js.reduce((total, row) => total + row.raw, 0))} bruto; ${
  bytes(js.reduce((total, row) => total + row.gzip, 0))} gzip`);
console.log(`CSS: ${bytes(css.reduce((total, row) => total + row.raw, 0))} bruto; ${
  bytes(css.reduce((total, row) => total + row.gzip, 0))} gzip`);
console.log(`Precache: ${precacheUrls.length} entradas (${uniquePrecacheUrls.length} únicas); ${
  bytes(precacheBytes)}`);
console.log(`Dist: ${allFiles.length} arquivos; ${bytes(distBytes)}`);
