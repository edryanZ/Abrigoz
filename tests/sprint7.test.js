import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const {
  buildDailySkyScene,
  getSplashPhrase,
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
