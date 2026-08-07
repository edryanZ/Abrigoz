import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
  key: (index) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};
globalThis.window = { dispatchEvent() {} };

const {
  getDailyCare, getDailyMoment, getDailyReflection,
} = await import("../src/core/emotional/DailyEmotionalService.js");
const {
  nextSkyBoundary, resolveColorMode, resolveSkyPeriod,
} = await import("../src/core/atmosphere/SkyThemeService.js");
const {
  DEFAULT_SKY_PREFERENCES, loadSkyPreferences, normalizeSkyPreferences,
} = await import("../src/core/atmosphere/SkyThemePreferencesService.js");
const {
  decryptCapsule, encryptCapsule,
} = await import("../src/core/sharing/CapsuleCryptoService.js");
const {
  createLocalCapsule, listCapsules, revokeCapsule,
} = await import("../src/core/sharing/CapsuleRepository.js");
const {
  prepareShareSelection,
} = await import("../src/core/sharing/ShareService.js");
const {
  loadOfflinePreferences,
} = await import("../src/core/offline/OfflinePreferencesService.js");
const {
  collectExportData, removeExportFields,
} = await import("../src/core/export/ExportDataService.js");
const {
  toCsv, toHtml, toMarkdown,
} = await import("../src/core/export/ExportFormatService.js");
const {
  createSingleFileZip,
} = await import("../src/core/export/ZipStoreService.js");
const {
  protectExport,
} = await import("../src/core/export/ExportCryptoService.js");
const {
  safeFilename,
} = await import("../src/core/export/ExportDownloadService.js");
const {
  createBackup, createLocalExportBackup, validateBackup,
} = await import("../src/core/sync/BackupManager.js");

test("Momento, reflexão e cuidado do dia são locais e determinísticos", () => {
  const date = new Date(2026, 7, 7, 12, 0);
  assert.deepEqual(getDailyMoment(date), getDailyMoment(date));
  assert.deepEqual(getDailyReflection(date), getDailyReflection(date));
  assert.deepEqual(getDailyCare(date), getDailyCare(date));
  assert.ok(getDailyMoment(date).message.length > 20);
});

test("céu respeita os seis períodos e limites locais", () => {
  const at = (hour, minute = 0) => new Date(2026, 6, 30, hour, minute);
  assert.equal(resolveSkyPeriod(at(0)), "madrugada");
  assert.equal(resolveSkyPeriod(at(4, 59)), "madrugada");
  assert.equal(resolveSkyPeriod(at(5)), "amanhecer");
  assert.equal(resolveSkyPeriod(at(7, 29)), "amanhecer");
  assert.equal(resolveSkyPeriod(at(7, 30)), "manha");
  assert.equal(resolveSkyPeriod(at(11, 59)), "manha");
  assert.equal(resolveSkyPeriod(at(12)), "tarde");
  assert.equal(resolveSkyPeriod(at(16, 59)), "tarde");
  assert.equal(resolveSkyPeriod(at(17)), "entardecer");
  assert.equal(resolveSkyPeriod(at(18, 59)), "entardecer");
  assert.equal(resolveSkyPeriod(at(19)), "noite");
  assert.equal(resolveSkyPeriod(at(23, 59)), "noite");
});

test("céu calcula próxima mudança sem verificar a cada segundo", () => {
  assert.equal(nextSkyBoundary(new Date(2026, 6, 30, 4, 0)).getHours(), 5);
  const nextDay = nextSkyBoundary(new Date(2026, 6, 30, 21, 0));
  assert.equal(nextDay.getDate(), 31);
  assert.equal(nextDay.getHours(), 0);
});

test("tema do céu diferencia claro, escuro e sistema", () => {
  assert.equal(resolveColorMode("light", true), "light");
  assert.equal(resolveColorMode("dark", false), "dark");
  assert.equal(resolveColorMode("system", true), "dark");
  assert.equal(resolveColorMode("system", false), "light");
});

test("preferências do céu preservam escolhas válidas e corrigem migração inválida", () => {
  values.clear();
  const chosen = {
    version: 1, automatic: false, staticBackground: true, showStars: false,
    showGlows: false, allowAnimations: false, reduceEffects: true,
    useDeviceTime: false, intensity: "soft", colorMode: "dark",
  };
  values.set("abrigo:sky-preferences:v1", JSON.stringify(chosen));
  assert.deepEqual(loadSkyPreferences(), chosen);
  assert.deepEqual(normalizeSkyPreferences({
    version: 1, automatic: "false", staticBackground: "true",
    showStars: "yes", showGlows: null, allowAnimations: 1,
    intensity: "invalid", colorMode: "night",
  }), DEFAULT_SKY_PREFERENCES);
});

test("céu é global, persistente entre rotas e não reinicia o player", async () => {
  const app = await readFile(new URL("../src/app/App.jsx", import.meta.url), "utf8");
  const providers = await readFile(
    new URL("../src/app/providers/AppProviders.jsx", import.meta.url), "utf8"
  );
  assert.equal((app.match(/<Ceu\s*\/>/g) ?? []).length, 1);
  assert.ok(app.indexOf("<Ceu />") < app.indexOf("<AppRoutes />"));
  assert.match(app, /<AppProviders>[\s\S]*<Ceu \/>[\s\S]*<AppRoutes \/>[\s\S]*<\/AppProviders>/);
  assert.match(providers, /<MusicProvider>[\s\S]*\{children\}[\s\S]*<\/MusicProvider>/);

  const routeFiles = [
    "modules/admin/AdminAnalytics.jsx", "modules/calendar/Calendario.jsx",
    "modules/diary/pages/Diary.jsx", "modules/export/ExportCenter.jsx",
    "modules/favorites/Favoritos.jsx", "modules/goals/Metas.jsx",
    "modules/habits/Habitos.jsx", "modules/home/Lar.jsx",
    "modules/home/components/Welcome.jsx", "modules/letters/Cartas.jsx", "modules/moment/MomentoDoDia.jsx",
    "modules/profile/Sobre.jsx", "modules/search/GlobalSearch.jsx",
    "modules/settings/Configuracoes.jsx", "modules/statistics/Statistics.jsx",
  ];
  for (const file of routeFiles) {
    const source = await readFile(new URL(`../src/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /<Ceu|import Ceu/);
  }
});

test("empilhamento mantém céu visível com estrelas, brilhos e fallback", async () => {
  const skyCss = await readFile(
    new URL("../src/shared/componentes/Ceu.css", import.meta.url), "utf8"
  );
  const globalCss = await readFile(new URL("../src/index.css", import.meta.url), "utf8");
  assert.doesNotMatch(skyCss, /z-index\s*:\s*-10/);
  assert.match(skyCss, /\.ceu\s*\{[^}]*z-index\s*:\s*-1[^}]*pointer-events\s*:\s*none/s);
  assert.doesNotMatch(skyCss, /:root\s*\{[^}]*background\s*:/s);
  assert.match(globalCss, /#root\s*\{[^}]*position\s*:\s*relative[^}]*isolation\s*:\s*isolate/s);
  assert.match(globalCss, /html\s*\{[^}]*linear-gradient/s);
  assert.match(skyCss, /\.sky-noite\s*\{[^}]*--sky-top[^}]*--sky-middle[^}]*--sky-bottom/s);
  assert.match(skyCss, /\.ceu\.has-stars::after/);
  assert.match(skyCss, /\.ceu\.has-glows::before/);
  assert.match(skyCss, /@supports not \(background:color-mix/);
  assert.match(skyCss, /@supports not[\s\S]*rgba\(135,103,202,\.28\)/);
  assert.match(skyCss, /\[data-color-mode=light\] \.ceu/);
  assert.match(skyCss, /\[data-color-mode=dark\] \.sky-manha/);
});

test("compartilhamento remove metadados não escolhidos", () => {
  const selection = prepareShareSelection({
    title: "Carta", text: "Olá", date: "2026-07-30", mood: "bem", tags: ["pessoal"],
  }, { hideDate: true, hideMood: true, hideTags: true });
  assert.deepEqual(selection, { title: "Carta", text: "Olá" });
});

test("cápsula usa AES-GCM e chave fica fora do registro", async () => {
  values.clear();
  const protectedContent = await encryptCapsule({ title: "Memória", text: "conteúdo" });
  const opened = await decryptCapsule(protectedContent.envelope, protectedContent.key);
  assert.equal(opened.text, "conteúdo");
  const record = await createLocalCapsule(protectedContent.envelope, "hour");
  const serialized = [...values.values()].join("");
  assert.ok(!serialized.includes(protectedContent.key));
  assert.ok(!serialized.includes(record.token));
  assert.equal(listCapsules().length, 1);
  revokeCapsule(record.id);
  assert.ok(listCapsules()[0].revokedAt);
});

test("offline preserva dados e atualização exige ação", async () => {
  values.clear();
  assert.equal(loadOfflinePreferences().updateWhenConfirmed, true);
  const source = await readFile(new URL("../src/core/offline/StorageManagerService.js",
    import.meta.url), "utf8");
  assert.ok(!source.includes("localStorage.clear"));
  assert.ok(!source.includes("storage.clear"));
  const main = await readFile(new URL("../src/main.jsx", import.meta.url), "utf8");
  assert.match(main, /onNeedRefresh/);
  assert.doesNotMatch(main, /onNeedRefresh:\\s*\\(\\).*updateSW/);
});

test("Central de Exportação seleciona módulos e exclui campos internos", () => {
  values.clear();
  values.set("abrigo:diary", JSON.stringify([{ id: "1", text: "registro",
    keyHash: "não exportar", mood: "calmo", createdAt: "2026-07-30" }]));
  const document = collectExportData(["diary"]);
  assert.equal(document.modules.diary.length, 1);
  assert.ok(!JSON.stringify(document).includes("keyHash"));
  const filtered = removeExportFields(document, { hideMood: true, hideDates: true });
  assert.ok(!JSON.stringify(filtered).includes("calmo"));
  assert.ok(!JSON.stringify(filtered).includes("2026-07-30"));
});

test("exportadores geram CSV, Markdown, HTML e ZIP válido", () => {
  const document = { modules: { goals: [{ id: "1", title: "Caminhar" }] } };
  assert.match(toCsv(document), /Caminhar/);
  assert.match(toMarkdown(document), /## goals/);
  assert.match(toHtml(document), /<!doctype html>/);
  const zip = createSingleFileZip("abrigo-export.json", JSON.stringify(document));
  assert.equal(new TextDecoder().decode(zip.slice(0, 2)), "PK");
  assert.equal(safeFilename("../../ Meu arquivo", "json"), "Meu-arquivo.json");
});

test("JSON protegido não mantém conteúdo em texto aberto", async () => {
  const protectedDocument = await protectExport({ private: "conteúdo pessoal" }, "senha-segura");
  assert.equal(protectedDocument.algorithm, "AES-GCM");
  assert.ok(!JSON.stringify(protectedDocument).includes("conteúdo pessoal"));
});

test("backup remoto preserva histórico legado e exportação local não o expõe", () => {
  values.clear();
  values.set("abrigo:sky-preferences:v1", JSON.stringify({ version: 1, intensity: "soft" }));
  values.set("abrigo:ai-history:v1", JSON.stringify({
    version: 1, items: [{ id: "a", request: "pedido", response: "resposta" }],
  }));
  values.set("abrigo:share-capsules:v1", JSON.stringify({
    version: 1,
    items: [{ id: "c", createdAt: "2026-07-30T00:00:00.000Z", expiresAt: null,
      revokedAt: null, tokenHash: "a".repeat(64),
      envelope: { ciphertext: "conteúdo-protegido" } }],
  }));
  const remote = createBackup();
  assert.equal(validateBackup(remote), true);
  assert.equal(remote.modules["abrigo:sky-preferences:v1"].intensity, "soft");
  assert.ok(remote.modules["abrigo:ai-history:v1"]);
  assert.ok(!JSON.stringify(remote).includes("conteúdo-protegido"));
  assert.ok(!JSON.stringify(remote).includes("tokenHash"));
  const plaintext = createLocalExportBackup();
  assert.equal(plaintext.modules["abrigo:ai-history:v1"], undefined);
});

test("Sprint 5 não contém módulo ou rota Galeria", async () => {
  const routes = await readFile(new URL("../src/core/constants/routes.js", import.meta.url), "utf8");
  assert.doesNotMatch(routes, /galeria/i);
  const appRoutes = await readFile(new URL("../src/app/router/AppRoutes.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(appRoutes, /galeria/i);
});
