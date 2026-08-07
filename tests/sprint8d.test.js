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

const search = await import("../src/core/search/SearchService.js");
const special = await import("../src/core/memory/SpecialDatesService.js");
const memory = await import("../src/core/memory/MemoryService.js");
const memoryMap = await import("../src/core/memory/MemoryMapService.js");

test("Sprint 8D pesquisa filtra por tipo, este mês, ano passado e mês nominal", () => {
  const now = new Date(2026, 7, 7, 12);
  assert.deepEqual(search.resolveSearchPeriod("this_month", now), { start: "2026-08-01", end: "2026-08-31" });
  assert.deepEqual(search.resolveSearchPeriod("last_year", now), { start: "2025-01-01", end: "2025-12-31" });
  const index = [
    { id: "diary:1", module: "diary", title: "Calma", body: "", date: "2025-07-10", category: "", tags: [], status: "", route: "/reflexoes" },
    { id: "calendar:2", module: "calendar", title: "Dia", body: "", date: "2026-07-10", category: "", tags: [], status: "", route: "/meu-dia" },
  ];
  assert.equal(search.searchLocal(index, "", { module: "diary", month: 7 }).total, 1);
  assert.equal(search.searchLocal(index, "", { month: 7 }).total, 2);
});

test("datas especiais são opcionais, locais e removíveis", () => {
  values.clear();
  const item = special.saveSpecialDate({ date: "2026-08-07" });
  assert.equal(special.listSpecialDates()[0].name, "");
  assert.equal(item.description, "");
  assert.equal(special.deleteSpecialDate(item.id), true);
  assert.equal(special.listSpecialDates().length, 0);
});

test("Meu Dia produz somente indicadores discretos de conteúdo", () => {
  values.clear();
  values.set("abrigo:diary", JSON.stringify([{ id: "r", createdAt: "2026-08-07T10:00:00.000Z", content: "segredo" }]));
  values.set("abrigo:future-capsules:v1", JSON.stringify({ version: 1, items: [{ id: "c", openOn: "2026-08-07", message: "segredo 2" }] }));
  const indicators = memory.buildContentIndicatorMap({ calendar: [], diary: [{ id: "r", createdAt: "2026-08-07T10:00:00.000Z" }], favorites: [] });
  assert.deepEqual(indicators["2026-08-07"], ["reflection", "capsule"]);
  assert.doesNotMatch(JSON.stringify(indicators), /segredo/);
});

test("Este dia, outro ano respeita memórias desativadas e itens ocultados", () => {
  values.clear();
  const data = { diary: [{ id: "old", createdAt: "2025-08-07T10:00:00.000Z", content: "lembrança" }], favorites: [] };
  const reference = new Date(2026, 7, 7, 12);
  const found = memory.getSameDayMemory(reference, data);
  assert.equal(found.id, "reflection:old");
  memory.hideGentleMemory(found.id);
  assert.equal(memory.getSameDayMemory(reference, data), null);
  values.set("abrigo:hidden-memories:v1", JSON.stringify({ version: 1, ids: [] }));
  memory.saveMemoryPreferences({ enabled: false });
  assert.equal(memory.getSameDayMemory(reference, data), null);
});

test("mapa é abstrato e constelação simbólica não é contador", () => {
  const data = { diary: Array.from({ length: 30 }, (_, index) => ({ id: index, createdAt: `2025-${String(index % 12 + 1).padStart(2, "0")}-01` })), favorites: [], calendar: [] };
  const markers = memoryMap.buildAbstractMemoryMap(data);
  const stars = memoryMap.buildSymbolicConstellation(data, new Date(2026, 7, 7));
  assert.ok(markers.length <= 8);
  assert.equal(stars.length, 7);
  assert.notEqual(stars.length, data.diary.length);
  for (const marker of markers) { assert.ok(marker.x >= 10 && marker.x <= 90); assert.ok(marker.y >= 12 && marker.y <= 84); }
});

test("Retrospectiva integra mapa e constelação sem GPS ou gamificação", async () => {
  const source = await readFile(new URL("../src/modules/statistics/Statistics.jsx", import.meta.url), "utf8");
  assert.match(source, /Mapa de memórias/);
  assert.match(source, /Constelação de memórias/);
  assert.match(source, /Este dia, outro ano/);
  assert.doesNotMatch(source, /geolocation|latitude|longitude|pontos ganhos|ranking/i);
});
