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

const { loadAIPreferences } = await import("../src/core/ai/AIPreferencesService.js");
const { buildAIContext } = await import("../src/core/ai/AIContextBuilder.js");
const { redactPersonalInformation } = await import("../src/core/ai/AIRedactionService.js");
const { AIService } = await import("../src/core/ai/AIService.js");
const {
  prioritizeRecommendations,
} = await import("../src/core/ai/RecommendationService.js");
const {
  nextSkyBoundary, resolveColorMode, resolveSkyPeriod,
} = await import("../src/core/atmosphere/SkyThemeService.js");
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

test("Assistente inicia desativado e sem contexto automático", () => {
  values.clear();
  const preferences = loadAIPreferences();
  assert.equal(preferences.assistantEnabled, false);
  assert.equal(preferences.allowSelectedContent, false);
  const context = buildAIContext({
    instruction: "Organize meu dia",
    selections: [{ label: "Diário", content: "privado", selected: false }],
  });
  assert.deepEqual(context.selections, []);
});

test("redaction oculta dados comuns e identificadores", () => {
  const hash = "a".repeat(64);
  const result = redactPersonalInformation(
    `Contato teste@example.com, (69) 99999-9999 e ${hash}`
  );
  assert.ok(!result.includes("teste@example.com"));
  assert.ok(!result.includes("99999-9999"));
  assert.ok(!result.includes(hash));
});

test("Assistente local funciona sem serviço externo", () => {
  assert.match(AIService.localSuggestion("goal"), /meta/i);
});

test("recomendações mantêm prioridade local", () => {
  const result = prioritizeRecommendations({
    favorites: [{ id: "favorite" }],
    local: [{ id: "local" }],
    external: [{ id: "external" }],
  });
  assert.deepEqual(result.map((item) => item.id), ["favorite", "local", "external"]);
  assert.equal(result.at(-1).origin, "Serviço externo");
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

test("backup inclui preferências elegíveis sem segredos de cápsula", () => {
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
