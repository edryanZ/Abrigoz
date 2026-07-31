import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
  clear: () => values.clear(),
  key: (index) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};

const { storage } = await import("../src/core/storage/storage.js");
const { getStatistics } = await import("../src/core/services/statistics.js");
const { getStreakData } = await import("../src/core/services/streak.js");

test("storage aceita texto simples e falha de gravação sem lançar ou registrar dados", () => {
  values.clear();
  values.set("texto", "dark");
  assert.equal(storage.get("texto"), "dark");
  const original = globalThis.localStorage;
  globalThis.localStorage = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("full"); },
    removeItem() { throw new Error("blocked"); },
    get length() { throw new Error("blocked"); },
  };
  assert.equal(storage.get("ausente"), null);
  assert.equal(storage.set("privado", { content: "não registrar" }), false);
  assert.equal(storage.remove("privado"), false);
  assert.deepEqual(storage.keys(), []);
  globalThis.localStorage = original;
});

test("estatísticas e sequência recuperam formato corrompido sem apagar outros dados", () => {
  values.clear();
  values.set("abrigo_statistics", "{incompleto");
  values.set("abrigo_streak", JSON.stringify({ currentStreak: 3, uniqueVisits: "inválido" }));
  values.set("abrigo:diary", JSON.stringify([{ id: "preservado" }]));
  assert.equal(getStatistics().visits, 0);
  assert.deepEqual(getStreakData().uniqueVisits, []);
  assert.equal(getStreakData().currentStreak, 3);
  assert.match(values.get("abrigo:diary"), /preservado/);
});

test("serviços centralizam persistência e componentes não acessam localStorage", async () => {
  const files = [
    "../src/core/services/statistics.js",
    "../src/core/services/streak.js",
    "../src/core/storage/BackupStorage.js",
    "../src/core/storage/DeviceStorage.js",
    "../src/core/services/reset.js",
  ];
  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /\blocalStorage\b/);
  }
  const componentFiles = [
    "../src/modules/admin/AdminAnalytics.jsx",
    "../src/modules/settings/components/AnalyticsSettings.jsx",
    "../src/shared/feedback/ErrorBoundary.jsx",
  ];
  for (const file of componentFiles) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /localStorage|sessionStorage|@supabase|supabaseClient/);
  }
});

test("player, céu e tema evitam intervalos curtos globais", async () => {
  const music = await readFile(new URL(
    "../src/shared/contexts/MusicContext.jsx", import.meta.url
  ), "utf8");
  const sky = await readFile(new URL(
    "../src/core/atmosphere/useSkyTheme.js", import.meta.url
  ), "utf8");
  const theme = await readFile(new URL(
    "../src/shared/contexts/ThemeContext.jsx", import.meta.url
  ), "utf8");
  assert.doesNotMatch(music, /setInterval/);
  assert.doesNotMatch(sky, /setInterval/);
  assert.doesNotMatch(theme, /setInterval/);
  assert.match(music, /POSITION_WRITE_INTERVAL_MS\s*=\s*5_000/);
  assert.match(theme, /setTimeout\(atualizarPeriodo/);
});

test("falhas de renderização não expõem stack e usam somente erro seguro", async () => {
  const source = await readFile(new URL(
    "../src/shared/feedback/ErrorBoundary.jsx", import.meta.url
  ), "utf8");
  assert.doesNotMatch(source, /console\.(?:error|log|warn)/);
  assert.match(source, /errorCode:\s*"render_failed"/);
});
