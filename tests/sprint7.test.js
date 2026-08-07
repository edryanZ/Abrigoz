import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
