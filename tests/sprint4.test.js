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
globalThis.window = {
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
  setInterval,
  clearInterval,
  setTimeout,
  clearTimeout,
};

const {
  localDateKey, resolvePeriod, previousPeriod,
} = await import("../src/core/intelligence/localDates.js");
const {
  buildMomentMap, calculateStatistics,
} = await import("../src/core/intelligence/StatisticsEngine.js");
const {
  normalizeSearchText, createSearchIndex, searchLocal,
} = await import("../src/core/search/SearchService.js");
const {
  processAchievements,
} = await import("../src/core/services/achievements.js");
const {
  getCompanionSuggestion, respondToSuggestion, selectCompanionSuggestions,
  getPreviousSuggestionSet,
} = await import("../src/core/companion/CompanionService.js");
const { COMPANION_CATALOG } = await import("../src/core/companion/companionCatalog.js");

function data() {
  return {
    diary: [{ id: "d1", title: "Café tranquilo", content: "Manhã boa", createdAt: "2026-07-29T08:00:00Z" }],
    calendar: [{ id: "e1", title: "Consulta", date: "2026-07-30", priority: "high", recurrence: "none" }],
    favorites: [{ id: "f1", title: "Música calma", description: "Acolhedora", type: "music",
      moodTags: ["tired"], primary: true, tags: ["calma"], createdAt: "2026-07-28T12:00:00Z" }],
    goals: [{ id: "g1", title: "Ler", progress: 50, status: "in_progress",
      steps: [{ id: "s1", title: "Capítulo", completed: true }], createdAt: "2026-07-20T12:00:00Z",
      updatedAt: "2026-07-30T12:00:00Z" }],
    habits: [{ id: "h1", name: "Água", frequency: "daily", startDate: "2026-07-20",
      archived: false, completions: ["2026-07-28", "2026-07-29", "2026-07-30"] }],
    moods: [],
    achievements: null,
    letters: null,
  };
}

test("datas locais e período anterior não deslocam um dia", () => {
  assert.equal(localDateKey(new Date(2026, 6, 30, 23, 30)), "2026-07-30");
  const period = resolvePeriod("7d", new Date(2026, 6, 30));
  assert.deepEqual(period, { start: "2026-07-24", end: "2026-07-30" });
  assert.deepEqual(previousPeriod(period), { start: "2026-07-17", end: "2026-07-23" });
});

test("estatísticas calculam módulos e não inventam comparação com pouca amostra", () => {
  const result = calculateStatistics(data(), { start: "2026-07-24", end: "2026-07-30" },
    new Date(2026, 6, 30));
  assert.equal(result.habits.completed, 3);
  assert.equal(result.goals.stepsCompleted, 1);
  assert.equal(result.calendar.total, 1);
  assert.equal(result.general.modulesUsed, 5);
  assert.equal(result.general.comparison, null);
});

test("mapa de momentos elimina duplicidade por módulo e item", () => {
  const source = data();
  source.diary.push({ ...source.diary[0] });
  const map = buildMomentMap(source, 2026);
  assert.equal(map.find((item) => item.date === "2026-07-29").count, 2);
});

test("pesquisa ignora acentos, agrupa e filtra", () => {
  assert.equal(normalizeSearchText("  Coração  "), "coracao");
  const index = createSearchIndex(data());
  const found = searchLocal(index, "musica", { module: "favorites" });
  assert.equal(found.total, 1);
  assert.equal(found.groups.favorites[0].sourceId, "f1");
  assert.equal(searchLocal(index, "consulta", { module: "diary" }).total, 0);
});

test("conquistas são persistentes e idempotentes", () => {
  values.clear();
  values.set("abrigo:diary", JSON.stringify(data().diary));
  const first = processAchievements();
  const second = processAchievements();
  assert.equal(first.data.items.find((item) => item.id === "first_diary").unlocked, true);
  assert.equal(second.newlyUnlocked.length, 0);
});

test("Companheiro prioriza Favorito e respeita bloqueio", () => {
  values.clear();
  values.set("abrigo:personal-favorites:v2", JSON.stringify({ version: 3, items: data().favorites }));
  const first = getCompanionSuggestion();
  assert.ok(first.suggestion);
  respondToSuggestion(first.suggestion.id, "never");
  const next = getCompanionSuggestion();
  assert.notEqual(next.suggestion.id, first.suggestion.id);
});

test("catálogo do Companheiro possui 120 sugestões distintas e leves", async () => {
  assert.equal(COMPANION_CATALOG.length, 120);
  assert.equal(new Set(COMPANION_CATALOG.map((item) => item.title)).size, 120);
  const source = await readFile(new URL("../src/core/companion/companionCatalog.js",
    import.meta.url));
  assert.ok(source.byteLength < 50 * 1024);
  const counts = {};
  COMPANION_CATALOG.forEach((item) => item.categories.forEach((category) => {
    counts[category] = (counts[category] ?? 0) + 1;
  }));
  ["rest","selfcare","organization","creativity","movement","diary","music","quick"]
    .forEach((category) => assert.ok(counts[category] >= 10, category));
  ["outdoors","social","goals","habits","screen","books","starting","closing"]
    .forEach((category) => assert.ok(counts[category] >= 8, category));
});

test("seleção gera cinco itens, respeita filtros, bloqueio e histórico", () => {
  values.clear();
  const first = selectCompanionSuggestions({ mood: "tired" }, new Date(2026, 6, 30, 20));
  assert.equal(first.suggestions.length, 5);
  assert.equal(new Set(first.suggestions.map((item) => item.id)).size, 5);
  const second = selectCompanionSuggestions({ mood: "tired" }, new Date(2026, 6, 30, 20));
  assert.notDeepEqual(second.suggestions.map((item) => item.id),
    first.suggestions.map((item) => item.id));
  assert.deepEqual(getPreviousSuggestionSet().map((item) => item.id),
    first.suggestions.map((item) => item.id));
  const short = selectCompanionSuggestions({ minutes: 2 }, new Date(2026, 6, 31, 9));
  assert.ok(short.suggestions.every((item) => item.minutes <= 2));
  const rest = selectCompanionSuggestions({ category: "rest" }, new Date(2026, 7, 1, 9));
  assert.ok(rest.suggestions.every((item) => item.categories.includes("rest")));
});

test("política de métricas aceita somente eventos e campos fechados", async () => {
  const { validateAnalyticsEvent } = await import("../src/core/analytics/AnalyticsPolicy.js");
  assert.equal(validateAnalyticsEvent("page_view", { page: "home" }), true);
  assert.equal(validateAnalyticsEvent("unknown_event"), false);
  assert.equal(validateAnalyticsEvent("page_view", { page: "home", term: "privado" }), false);
  assert.equal(validateAnalyticsEvent("page_view", { page: "admin" }), false);
  assert.equal(validateAnalyticsEvent("app_error_safe", { errorCode: "render_failed" }), true);
  assert.equal(validateAnalyticsEvent("app_error_safe", { errorCode: "mensagem-original" }), false);
});

test("backup inclui dados pessoais novos e exclui consentimento de métricas", () => {
  return readFile(new URL("../src/core/sync/BackupManager.js", import.meta.url), "utf8")
    .then((source) => {
      assert.match(source, /abrigo:analytics-consent:v1/);
      assert.match(source, /abrigo:search-preferences:v1/);
      assert.match(source, /collectModules/);
      assert.match(source, /isSensitiveStorageKey/);
    });
});

test("migration de métricas não concede leitura pública", async () => {
  const sql = await readFile(new URL("../supabase/migrations/20260801120000_anonymous_analytics.sql",
    import.meta.url), "utf8");
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on public\.analytics_daily from public, anon/i);
  assert.doesNotMatch(sql, /grant\s+select[\s\S]*\s+to\s+anon/i);
  assert.doesNotMatch(sql, /abrigo_id|key_hash/i);
});

test("Navbar mantém menu antes do título e música depois", async () => {
  const source = await readFile(new URL("../src/shared/componentes/Navbar.jsx", import.meta.url), "utf8");
  const header = source.slice(source.indexOf("<header"), source.indexOf("</header>"));
  assert.ok(header.indexOf("abrirMenu") < header.indexOf("navbar-logo"));
  assert.ok(header.indexOf("navbar-logo") < header.indexOf("abrirPlayer"));
});

test("proteção da Sprint 3 mantém envelope e rejeita chave incorreta", async () => {
  const {
    decryptJson, deriveEncryptionKey, encryptJson, ENCRYPTION_PURPOSES,
  } = await import("../src/core/crypto/CryptoService.js");
  const { generateAbrigoKey } = await import("../src/core/sync/AbrigoKey.js");
  const first = await deriveEncryptionKey(generateAbrigoKey(), ENCRYPTION_PURPOSES.BACKUP_EXPORT);
  const second = await deriveEncryptionKey(generateAbrigoKey(), ENCRYPTION_PURPOSES.BACKUP_EXPORT);
  const envelope = await encryptJson({ modules: { diary: ["exemplo"] } }, first,
    ENCRYPTION_PURPOSES.BACKUP_EXPORT);
  assert.deepEqual(await decryptJson(envelope, first, ENCRYPTION_PURPOSES.BACKUP_EXPORT),
    { modules: { diary: ["exemplo"] } });
  await assert.rejects(() => decryptJson(envelope, second, ENCRYPTION_PURPOSES.BACKUP_EXPORT));
  assert.equal(first.extractable, false);
});
