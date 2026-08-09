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

const accessibility = await import("../src/core/accessibility/AccessibilityPreferencesService.js");

test("Sprint 8B normaliza tamanho, contraste e fonte de leitura sem fonte externa", async () => {
  assert.deepEqual(accessibility.normalizeAccessibilityPreferences({
    textSize: "large", highContrast: true, readingFont: "comfortable",
  }), { version: 1, textSize: "large", highContrast: true, readingFont: "comfortable" });
  assert.equal(accessibility.normalizeAccessibilityPreferences({ textSize: "giant" }).textSize, "standard");
  const css = await readFile(new URL("../src/index.css", import.meta.url), "utf8");
  assert.match(css, /text-size-large/);
  assert.match(css, /high-contrast/);
  assert.match(css, /comfortable-reading/);
  assert.doesNotMatch(css, /@import\s+url|fonts\.googleapis/);
});

test("manifest oferece somente quatro atalhos calmos", async () => {
  const config = await readFile(new URL("../vite.config.js", import.meta.url), "utf8");
  const shortcuts = config.match(/shortcuts:\s*\[([\s\S]*?)\n\s*\],/)?.[1] ?? "";
  for (const path of ["/so-ficar", "/reflexoes", "/momento-do-dia", "/meu-dia"]) assert.match(shortcuts, new RegExp(path));
  assert.equal((shortcuts.match(/\{ name:/g) ?? []).length, 4);
});

test("instalação PWA é capturada de forma discreta e respeita Agora não", async () => {
  const [main, prompt, ui] = await Promise.all([
    readFile(new URL("../src/main.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/core/offline/PWAInstallService.js", import.meta.url), "utf8"),
    readFile(new URL("../src/shared/componentes/InstallSuggestion.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(main, /beforeinstallprompt/);
  assert.match(prompt, /dismissed: true/);
  assert.match(ui, /Agora não/);
  assert.doesNotMatch(ui, /alert\(|confirm\(/);
});

test("offline e atualização usam linguagem humana e continuam confirmados", async () => {
  const [status, update] = await Promise.all([
    readFile(new URL("../src/shared/componentes/OfflineStatus.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/core/offline/PWAUpdateService.js", import.meta.url), "utf8"),
  ]);
  assert.match(status, /O restante do seu Abrigo continua aqui/);
  assert.match(status, /Há uma pequena atualização pronta/);
  assert.match(status, /Atualizar agora/);
  assert.match(update, /updateHandler\(true\)/);
});

test("loader leve e estilos preservam reduced motion", async () => {
  const [loading, css] = await Promise.all([
    readFile(new URL("../src/shared/feedback/Loading.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/shared/feedback/Loading.css", import.meta.url), "utf8"),
  ]);
  assert.match(loading, /Abrindo seu Abrigo/);
  assert.doesNotMatch(loading, /loading-spinner/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
});
