import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("todas as páginas permanecem lazy e a estrutura global é estável", async () => {
  const routes = await readFile(new URL("../src/app/router/AppRoutes.jsx", import.meta.url), "utf8");
  const app = await readFile(new URL("../src/app/App.jsx", import.meta.url), "utf8");
  const expected = [
    "Welcome", "Lar", "Calendario", "Favoritos", "Metas", "Habitos", "Cartas",
    "Sobre", "Configuracoes", "Diary", "Statistics", "GlobalSearch",
    "Achievements", "AdminAnalytics", "Assistant", "ExportCenter",
  ];
  for (const name of expected) {
    assert.match(routes, new RegExp(`const ${name} = lazy\\(`), name);
  }
  assert.equal((app.match(/<Ceu\s*\/>/g) ?? []).length, 1);
  assert.equal((app.match(/<AppRoutes\s*\/>/g) ?? []).length, 1);
  assert.doesNotMatch(`${routes}\n${app}`, /Galeria|Gallery/);
});

test("entrada local não importa cliente Supabase nem serviços remotos diretamente", async () => {
  const files = [
    "../src/main.jsx",
    "../src/app/App.jsx",
    "../src/app/providers/AppProviders.jsx",
    "../src/core/analytics/AnalyticsTracker.jsx",
  ];
  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), "utf8");
    assert.doesNotMatch(source, /supabaseClient|@supabase\/supabase-js|AnalyticsRepository/);
  }
});

test("PWA exige confirmação, exclui dados privados e MP3 do precache", async () => {
  const config = await readFile(new URL("../vite.config.js", import.meta.url), "utf8");
  const update = await readFile(new URL(
    "../src/shared/componentes/OfflineStatus.jsx", import.meta.url
  ), "utf8");
  assert.match(config, /registerType:\s*"prompt"/);
  assert.match(config, /globPatterns:\s*\["\*\*\/\*\.\{js,css,html,png,webp,webmanifest\}"\]/);
  assert.doesNotMatch(config, /globPatterns:[^\n]*mp3/);
  assert.match(config, /cleanupOutdatedCaches:\s*true/);
  assert.match(config, /navigateFallbackDenylist:\s*\[\/\^\\\/api/);
  assert.doesNotMatch(config, /supabase.*(?:CacheFirst|NetworkFirst)/is);
  assert.match(update, /applyPWAUpdate/);
});

test("orçamentos verificam entrada bruta, gzip e exclusão de áudio", async () => {
  const source = await readFile(new URL("../scripts/check-budgets.mjs", import.meta.url), "utf8");
  assert.match(source, /gzipSync/);
  assert.match(source, /270 \* 1024/);
  assert.match(source, /88 \* 1024/);
  assert.match(source, /MP3 não deve entrar no precache/);
});

test("céu cancela frames, limpa listeners e respeita movimento reduzido", async () => {
  const component = await readFile(new URL(
    "../src/shared/componentes/Ceu.jsx", import.meta.url
  ), "utf8");
  const hook = await readFile(new URL(
    "../src/core/atmosphere/useSkyTheme.js", import.meta.url
  ), "utf8");
  assert.match(component, /cancelAnimationFrame/);
  assert.match(component, /removeEventListener\("pointermove"/);
  assert.match(component, /visibilityState === "hidden"/);
  assert.match(component, /sky\.motion/);
  assert.match(hook, /reduceEffects|allowAnimations/);
  assert.match(hook, /prefers-reduced-motion/);
  assert.match(hook, /clearTimeout/);
});

test("player salva a posição final e limpa listeners e temporizador", async () => {
  const source = await readFile(new URL(
    "../src/shared/contexts/MusicContext.jsx", import.meta.url
  ), "utf8");
  assert.match(source, /persistPosition\(true\)/);
  assert.match(source, /removeEventListener\("timeupdate"/);
  assert.match(source, /removeEventListener\("ended"/);
  assert.match(source, /clearTimeout\(timer\)/);
  assert.equal((source.match(/loadMusicPreferences\(\)/g) ?? []).length, 1);
});
