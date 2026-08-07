import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const storageValues = new Map();
globalThis.localStorage = {
  getItem: (key) => storageValues.has(key) ? storageValues.get(key) : null,
  setItem: (key, value) => storageValues.set(key, String(value)),
  removeItem: (key) => storageValues.delete(key),
  key: (index) => [...storageValues.keys()][index] ?? null,
  get length() { return storageValues.size; },
};

const {
  buildDailySkyScene,
  getSplashPhrase,
  getMoonMessage,
  localDayKey,
  resolveAtmosphereLevel,
  resolveLunarPhase,
  resolveSkyPalette,
  resolveSkyTransition,
  seedFromLocalDate,
} = await import("../src/core/atmosphere/SkyThemeService.js");

test("Sprint 7A interpola atmosfera usando hora e data locais", () => {
  const early = new Date(2026, 7, 7, 17, 5);
  const late = new Date(2026, 7, 7, 18, 45);
  assert.equal(resolveSkyTransition(early).period, "entardecer");
  assert.ok(resolveSkyTransition(late).progress > resolveSkyTransition(early).progress);
  assert.notDeepEqual(resolveSkyPalette(early).colors, resolveSkyPalette(late).colors);
  assert.equal(localDayKey(new Date(2026, 0, 2, 23, 55)), "2026-01-02");
});

test("Sprint 7A mantém variação diária determinística e lua local testável", () => {
  const date = new Date(2026, 7, 7, 22, 0);
  assert.equal(seedFromLocalDate(date), seedFromLocalDate(date));
  assert.deepEqual(buildDailySkyScene(date), buildDailySkyScene(date));
  const moon = resolveLunarPhase(date);
  assert.ok(moon.phase >= 0 && moon.phase <= 1);
  assert.ok(moon.illumination >= 0 && moon.illumination <= 1);
});

test("Sprint 7A aplica níveis silenciosos a conteúdo importante", () => {
  assert.equal(resolveAtmosphereLevel("/"), "high");
  assert.equal(resolveAtmosphereLevel("/lar"), "medium");
  assert.equal(resolveAtmosphereLevel("/reflexoes"), "low");
  assert.equal(resolveAtmosphereLevel("/configuracoes"), "minimal");
});

test("Splash é global, curta, sem rota e respeita reduced motion", async () => {
  const app = await readFile(new URL("../src/app/App.jsx", import.meta.url), "utf8");
  const routes = await readFile(new URL("../src/app/router/AppRoutes.jsx", import.meta.url), "utf8");
  const splash = await readFile(new URL("../src/shared/componentes/AbrigoSplash.jsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../src/shared/componentes/AbrigoSplash.css", import.meta.url), "utf8");
  assert.equal((app.match(/<AbrigoSplash/g) ?? []).length, 1);
  assert.doesNotMatch(routes, /AbrigoSplash/);
  assert.match(splash, /SPLASH_DURATION_MS = 1200/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.ok(getSplashPhrase(new Date(2026, 7, 7, 23)).length > 10);
});

test("Sprint 7B mantém interações locais e Modo Só Ficar sem API", async () => {
  const date = new Date(2026, 7, 7, 22);
  assert.equal(getMoonMessage(date), getMoonMessage(date));
  assert.equal(resolveAtmosphereLevel("/so-ficar"), "maximum");
  const page = await readFile(new URL("../src/modules/pause/PauseMode.jsx", import.meta.url), "utf8");
  assert.match(page, /Janela do Abrigo/);
  assert.match(page, /Modo Silêncio/);
  assert.doesNotMatch(page, /fetch\(|localStorage|Supabase|geolocation/);
});

test("sons ambientes ficam indisponíveis sem assets locais apropriados", async () => {
  const { AMBIENT_SOUND_SLOTS, getAvailableAmbientSounds } = await import(
    "../src/core/atmosphere/AmbientSoundService.js"
  );
  assert.equal(AMBIENT_SOUND_SLOTS.length, 5);
  assert.equal(getAvailableAmbientSounds().length, 0);
});

test("preferências da atmosfera normalizam modo silêncio e eventos sem acesso de componente ao storage", async () => {
  const { normalizeAtmospherePreferences } = await import(
    "../src/core/atmosphere/AtmospherePreferencesService.js"
  );
  const value = normalizeAtmospherePreferences({
    version: 1, silenceMode: true, interactiveSky: false, rareEvents: false,
    ambientEnabled: false, ambientVolume: 4,
  });
  assert.equal(value.silenceMode, true);
  assert.equal(value.interactiveSky, false);
  assert.equal(value.ambientVolume, 1);
  const page = await readFile(new URL("../src/modules/pause/PauseMode.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(page, /localStorage|sessionStorage|IndexedDB/);
});

test("Sprint 7C mantém cápsula selada até a data local e permite exclusão explícita", async () => {
  storageValues.clear();
  const {
    createFutureCapsule, deleteFutureCapsule, listFutureCapsules, resolveCapsuleDate,
  } = await import("../src/core/memory/FutureCapsuleService.js");
  const createdAt = new Date(2026, 0, 31, 12);
  const openOn = resolveCapsuleDate("1m", createdAt);
  assert.equal(openOn, "2026-02-28");
  const capsule = createFutureCapsule({ message: "Mensagem para depois", openOn }, createdAt);
  assert.equal(capsule.sealed, true);
  assert.equal(capsule.message, undefined);
  assert.equal(listFutureCapsules(new Date(2026, 1, 20, 12))[0].message, undefined);
  assert.equal(listFutureCapsules(new Date(2026, 1, 28, 12))[0].message, "Mensagem para depois");
  assert.equal(deleteFutureCapsule(capsule.id), true);
  assert.equal(listFutureCapsules(new Date(2026, 2, 1, 12)).length, 0);
});

test("Cápsulas e momentos salvos entram no backup consolidado sem estrutura remota nova", async () => {
  storageValues.clear();
  const { createFutureCapsule } = await import("../src/core/memory/FutureCapsuleService.js");
  const { savePauseMoment } = await import("../src/core/memory/MemoryService.js");
  const { createBackup } = await import("../src/core/sync/BackupManager.js");
  createFutureCapsule({ message: "Para o futuro", openOn: "2027-01-01" }, new Date(2026, 7, 7, 12));
  savePauseMoment({ phrase: "Uma pausa", period: "noite" }, new Date(2026, 7, 7, 23));
  const backup = createBackup();
  assert.ok(backup.modules["abrigo:future-capsules:v1"]);
  assert.ok(backup.modules["abrigo:pause-moments:v1"]);
  assert.doesNotMatch(JSON.stringify(backup), /keyHash|syncQueue|deviceId/);
});

test("Guardar momento usa core compartilhado e preserva formato histórico de favoritos", async () => {
  storageValues.clear();
  storageValues.set("abrigo:personal-favorites:v2", JSON.stringify({
    version: 2, items: [{ id: "old", titulo: "Legado" }],
  }));
  const { saveWellbeingMoment } = await import("../src/core/memory/WellbeingMemoryService.js");
  saveWellbeingMoment({ title: "Um instante", description: "Sem pressa", source: "test" });
  const saved = JSON.parse(storageValues.get("abrigo:personal-favorites:v2"));
  assert.equal(saved.version, 2);
  assert.equal(saved.items.length, 2);
  assert.equal(saved.items[1].titulo, "Legado");
});

test("memórias reaparecem deterministicamente e podem ser ocultadas", async () => {
  storageValues.clear();
  storageValues.set("abrigo:diary", JSON.stringify([{
    id: "r1", title: "Uma lembrança", content: "Texto", createdAt: "2025-01-01T12:00:00.000Z",
  }]));
  const { getGentleMemory, hideGentleMemory } = await import("../src/core/memory/MemoryService.js");
  const reference = new Date(2026, 7, 7, 12);
  const first = getGentleMemory(reference);
  assert.deepEqual(first, getGentleMemory(reference));
  assert.ok(first);
  hideGentleMemory(first.id);
  assert.equal(getGentleMemory(reference), null);
});

test("Reflexões permite não escrever sem persistência e módulos guardam momentos via core", async () => {
  const diary = await readFile(new URL("../src/modules/diary/pages/Diary.jsx", import.meta.url), "utf8");
  const moment = await readFile(new URL("../src/modules/moment/MomentoDoDia.jsx", import.meta.url), "utf8");
  const letters = await readFile(new URL("../src/modules/home/components/CartaModal.jsx", import.meta.url), "utf8");
  assert.match(diary, /Hoje não quero escrever/);
  assert.match(diary, /setAnswer\(""\)/);
  for (const source of [diary, moment, letters]) {
    assert.match(source, /saveWellbeingMoment/);
    assert.doesNotMatch(source, /modules\/favorites/);
  }
});
