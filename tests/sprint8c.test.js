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

const { collectExportData, EXPORT_MODULES } = await import("../src/core/export/ExportDataService.js");
const { createBackup, inspectBackupDocument, summarizeBackup } = await import("../src/core/sync/BackupManager.js");

test("Sprint 8C exportação seletiva cobre conteúdo pessoal aplicável e preferências", () => {
  values.clear();
  values.set("abrigo:diary", JSON.stringify([{ id: "r1", content: "reflexão" }]));
  values.set("abrigo:future-capsules:v1", JSON.stringify({ version: 1, items: [{ id: "c1", message: "cápsula" }] }));
  values.set("abrigo:accessibility:v1", JSON.stringify({ version: 1, textSize: "large" }));
  const exported = collectExportData(["diary", "capsules", "preferences"]);
  assert.ok(exported.modules.diary);
  assert.ok(exported.modules.capsules);
  assert.equal(exported.modules.preferences["abrigo:accessibility:v1"].textSize, "large");
  for (const id of ["diary", "calendar", "favorites", "letters", "capsules", "preferences"]) assert.ok(EXPORT_MODULES[id]);
});

test("campos internos sensíveis continuam excluídos da exportação", () => {
  values.set("abrigo:diary", JSON.stringify([{ id: "r", content: "ok", deviceId: "privado", keyHash: "privado" }]));
  const text = JSON.stringify(collectExportData(["diary"]));
  assert.doesNotMatch(text, /deviceId|keyHash/);
  assert.match(text, /ok/);
});

test("preview de backup mostra categorias e nunca conteúdo integral", () => {
  const backup = createBackup({
    "abrigo:diary": [{ id: "r", content: "segredo que não deve virar preview" }],
    "abrigo:events": [{ id: "e", title: "evento privado" }],
  }, { source: "test" });
  const summary = summarizeBackup(backup);
  assert.deepEqual(summary, ["Reflexões", "Meu Dia"]);
  assert.doesNotMatch(JSON.stringify(summary), /segredo|evento privado/);
  assert.deepEqual(inspectBackupDocument(backup).categories, summary);
  assert.equal(inspectBackupDocument({ nope: true }).valid, false);
});

test("restauração na interface exige preview/confirmacão explícita", async () => {
  const ui = await readFile(new URL("../src/modules/settings/components/SyncSettings.jsx", import.meta.url), "utf8");
  assert.match(ui, /Ver prévia segura/);
  assert.match(ui, /Este arquivo contém/);
  assert.match(ui, /restoreConfirmed/);
  assert.match(ui, /!restoreConfirmed/);
  assert.match(ui, /A prévia mostra somente categorias/);
});

test("backup visual mantém detalhes técnicos fora do resumo humano", async () => {
  const ui = await readFile(new URL("../src/modules/settings/components/SyncSettings.jsx", import.meta.url), "utf8");
  assert.match(ui, /Neste dispositivo/);
  assert.match(ui, /Última proteção/);
  assert.doesNotMatch(ui.match(/sync-protection-path[\s\S]{0,500}/)?.[0] ?? "", /AES-GCM|HKDF|RPC/);
});
