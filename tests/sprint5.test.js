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
