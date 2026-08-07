import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key), key: (index) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};

const rituals = await import("../src/core/memory/MonthlyRitualService.js");

test("Sprint 8E detecta rituais somente nas bordas do mês", () => {
  assert.equal(rituals.getMonthlyRitualPhase(new Date(2026, 7, 1)), "opening");
  assert.equal(rituals.getMonthlyRitualPhase(new Date(2026, 7, 15)), null);
  assert.equal(rituals.getMonthlyRitualPhase(new Date(2026, 7, 31)), "closing");
});

test("ritual só persiste quando saveMonthlyRitual é chamado explicitamente", async () => {
  values.clear();
  const ui = await readFile(new URL("../src/shared/componentes/MonthlyRitual.jsx", import.meta.url), "utf8");
  assert.match(ui, /Só pensar nisso/);
  assert.equal(rituals.listMonthlyRituals().length, 0);
  rituals.saveMonthlyRitual({ phase: "opening", text: "Ir com calma" }, new Date(2026, 7, 1));
  assert.equal(rituals.listMonthlyRituals().length, 1);
});

test("cartão visual é criado localmente e não injeta metadados pessoais", async () => {
  const source = await readFile(new URL("../src/core/sharing/ShareImageService.js", import.meta.url), "utf8");
  assert.match(source, /document\.createElement\("canvas"\)/);
  assert.match(source, /image\/png/);
  assert.match(source, /skyInspired/);
  assert.doesNotMatch(source, /fetch\(|Supabase|geolocation|user\.name|location/i);
});

test("Momento e Carta oferecem compartilhamento visual explicitamente escolhido", async () => {
  const [moment, letter] = await Promise.all([
    readFile(new URL("../src/modules/moment/MomentoDoDia.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/modules/letters/components/CartaModal.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(moment, /Compartilhar como imagem/);
  assert.match(letter, /Compartilhar como imagem/);
  assert.match(letter, /Apresentar carta/);
  assert.match(letter, /Escape/);
});

test("Modo Apresentação prioriza texto e saída fácil", async () => {
  const css = await readFile(new URL("../src/modules/letters/components/CartaModal.css", import.meta.url), "utf8");
  assert.match(css, /carta-modal--presentation/);
  assert.match(css, /favorito-btn[\s\S]*display:none/);
});

test("Surpresa do Abrigo já é coberta pelos eventos raros do Céu 2.0 sem gamificação", async () => {
  const [sky, scene] = await Promise.all([
    readFile(new URL("../src/shared/componentes/Ceu.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/core/atmosphere/SkyThemeService.js", import.meta.url), "utf8"),
  ]);
  assert.match(sky, /showRareEvents/);
  assert.match(scene, /shootingStar/);
  assert.match(scene, /meteor/);
  assert.doesNotMatch(sky, /badge|achievement|reward|ranking/i);
});
