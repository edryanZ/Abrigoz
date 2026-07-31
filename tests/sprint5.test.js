import assert from "node:assert/strict";
import test from "node:test";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
  key: (index) => [...values.keys()][index] ?? null,
  get length() { return values.size; },
};
globalThis.window = { dispatchEvent() {} };

const { loadAIPreferences } = await import("../src/core/ai/AIPreferencesService.js");
const { buildAIContext } = await import("../src/core/ai/AIContextBuilder.js");
const { redactPersonalInformation } = await import("../src/core/ai/AIRedactionService.js");
const { AIService } = await import("../src/core/ai/AIService.js");
const {
  prioritizeRecommendations,
} = await import("../src/core/ai/RecommendationService.js");
const {
  nextSkyBoundary, resolveColorMode, resolveSkyPeriod,
} = await import("../src/core/atmosphere/SkyThemeService.js");

test("Assistente inicia desativado e sem contexto automático", () => {
  values.clear();
  const preferences = loadAIPreferences();
  assert.equal(preferences.assistantEnabled, false);
  assert.equal(preferences.allowSelectedContent, false);
  const context = buildAIContext({
    instruction: "Organize meu dia",
    selections: [{ label: "Diário", content: "privado", selected: false }],
  });
  assert.deepEqual(context.selections, []);
});

test("redaction oculta dados comuns e identificadores", () => {
  const hash = "a".repeat(64);
  const result = redactPersonalInformation(
    `Contato teste@example.com, (69) 99999-9999 e ${hash}`
  );
  assert.ok(!result.includes("teste@example.com"));
  assert.ok(!result.includes("99999-9999"));
  assert.ok(!result.includes(hash));
});

test("Assistente local funciona sem serviço externo", () => {
  assert.match(AIService.localSuggestion("goal"), /meta/i);
});

test("recomendações mantêm prioridade local", () => {
  const result = prioritizeRecommendations({
    favorites: [{ id: "favorite" }],
    local: [{ id: "local" }],
    external: [{ id: "external" }],
  });
  assert.deepEqual(result.map((item) => item.id), ["favorite", "local", "external"]);
  assert.equal(result.at(-1).origin, "Serviço externo");
});

test("céu respeita os seis períodos e limites locais", () => {
  const at = (hour, minute = 0) => new Date(2026, 6, 30, hour, minute);
  assert.equal(resolveSkyPeriod(at(0)), "madrugada");
  assert.equal(resolveSkyPeriod(at(4, 59)), "madrugada");
  assert.equal(resolveSkyPeriod(at(5)), "amanhecer");
  assert.equal(resolveSkyPeriod(at(7, 29)), "amanhecer");
  assert.equal(resolveSkyPeriod(at(7, 30)), "manha");
  assert.equal(resolveSkyPeriod(at(11, 59)), "manha");
  assert.equal(resolveSkyPeriod(at(12)), "tarde");
  assert.equal(resolveSkyPeriod(at(16, 59)), "tarde");
  assert.equal(resolveSkyPeriod(at(17)), "entardecer");
  assert.equal(resolveSkyPeriod(at(18, 59)), "entardecer");
  assert.equal(resolveSkyPeriod(at(19)), "noite");
  assert.equal(resolveSkyPeriod(at(23, 59)), "noite");
});

test("céu calcula próxima mudança sem verificar a cada segundo", () => {
  assert.equal(nextSkyBoundary(new Date(2026, 6, 30, 4, 0)).getHours(), 5);
  const nextDay = nextSkyBoundary(new Date(2026, 6, 30, 21, 0));
  assert.equal(nextDay.getDate(), 31);
  assert.equal(nextDay.getHours(), 0);
});

test("tema do céu diferencia claro, escuro e sistema", () => {
  assert.equal(resolveColorMode("light", true), "light");
  assert.equal(resolveColorMode("dark", false), "dark");
  assert.equal(resolveColorMode("system", true), "dark");
  assert.equal(resolveColorMode("system", false), "light");
});
