import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key),
  key: (index) => [...values.keys()][index] ?? null, get length() { return values.size; },
};

const nav = await import("../src/core/personalization/NavigationPreferencesService.js");
const visibility = await import("../src/core/privacy/ContentVisibilityService.js");

test("Sprint 8F Quero menos coisas oculta navegação sem apagar dados", () => {
  values.clear();
  values.set("abrigo:goals:v1", JSON.stringify({ version: 1, items: [{ id: "keep" }] }));
  const preferences = nav.saveNavigationPreferences({ simplified: true });
  assert.equal(nav.isNavigationItemVisible("goals", preferences), false);
  assert.match(values.get("abrigo:goals:v1"), /keep/);
  const restored = nav.saveNavigationPreferences({ simplified: false });
  assert.equal(nav.isNavigationItemVisible("goals", restored), true);
});

test("módulos podem ser ocultados e reativados sem alterar seu storage", () => {
  const hidden = nav.saveNavigationPreferences({ hiddenModules: ["calendar"] });
  assert.equal(nav.isNavigationItemVisible("calendar", hidden), false);
  const visible = nav.saveNavigationPreferences({ hiddenModules: [] });
  assert.equal(nav.isNavigationItemVisible("calendar", visible), true);
});

test("atalhos favoritos são limitados a três", () => {
  nav.saveNavigationPreferences({ favorites: [] });
  nav.setNavigationFavorite("moment", true); nav.setNavigationFavorite("diary", true); nav.setNavigationFavorite("calendar", true);
  assert.equal(nav.loadNavigationPreferences().favorites.length, 3);
  assert.throws(() => nav.setNavigationFavorite("letters", true), /no máximo 3/);
});

test("ocultação universal não exclui registro e permite restaurar", () => {
  values.set("abrigo:diary", JSON.stringify([{ id: "r1", content: "continua aqui" }]));
  visibility.hideContent({ id: "reflection:r1", type: "memory", label: "Uma reflexão" });
  assert.equal(visibility.isContentHidden("reflection:r1"), true);
  assert.match(values.get("abrigo:diary"), /continua aqui/);
  visibility.restoreHiddenContent("reflection:r1");
  assert.equal(visibility.isContentHidden("reflection:r1"), false);
  assert.match(values.get("abrigo:diary"), /continua aqui/);
});

test("Ctrl+K abre Pesquisa sem capturar editores e Escape fecha atalho", async () => {
  const [navbar, search] = await Promise.all([
    readFile(new URL("../src/shared/componentes/Navbar.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/modules/search/GlobalSearch.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(navbar, /event\.ctrlKey \|\| event\.metaKey/);
  assert.match(navbar, /INPUT.*TEXTAREA.*SELECT/);
  assert.match(navbar, /event\.key === "Escape"/);
  assert.match(navbar, /fromShortcut/);
  assert.match(search, /autoFocus=\{Boolean\(location\.state\?\.fromShortcut\)\}/);
});

test("Novidades é local, versionada e fica em Mais sem changelog técnico", async () => {
  const [news, navbar] = await Promise.all([
    readFile(new URL("../src/modules/profile/Novidades.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/shared/componentes/Navbar.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(news, /RELEASE_NOTES/); assert.match(news, /version: "2\.8"/);
  assert.doesNotMatch(news, /commit hash|[0-9a-f]{40}/i);
  assert.match(navbar, /nome: "Mais"[\s\S]*Novidades/);
});
