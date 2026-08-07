import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const readSource = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const storageValues = new Map();
globalThis.localStorage = {
  getItem: (key) => storageValues.has(key) ? storageValues.get(key) : null,
  setItem: (key, value) => storageValues.set(key, String(value)),
  removeItem: (key) => storageValues.delete(key),
  key: (index) => [...storageValues.keys()][index] ?? null,
  get length() { return storageValues.size; },
};

const { getDailyCare, getDailyMoment, getDailyReflection } = await import(
  "../src/core/emotional/DailyEmotionalService.js"
);
const {
  clearLegacyAssistantHistory, hasLegacyAssistantHistory,
} = await import("../src/core/privacy/LegacyAssistantDataService.js");
const { createSearchIndex } = await import("../src/core/search/SearchService.js");
const { subscribe } = await import("../src/core/sync/EventBus.js");
const { SYNC_EVENT } = await import("../src/core/sync/emitSync.js");

test("navegação apresenta a linguagem emocional e preserva endereços antigos", async () => {
  const [routes, navbar] = await Promise.all([
    readSource("src/app/router/AppRoutes.jsx"),
    readSource("src/shared/componentes/Navbar.jsx"),
  ]);
  for (const label of ["Momento do Dia", "Reflexões", "Coisas que fazem bem",
    "Pequenos Cuidados", "Intenções", "Meu Dia", "Retrospectiva"]) {
    assert.match(navbar, new RegExp(label));
  }
  assert.doesNotMatch(navbar, />Assistente</);
  const redirects = {
    "/assistente": "MOMENT", "/diario": "DIARY", "/metas": "GOALS",
    "/habitos": "HABITS", "/favoritos": "FAVORITES", "/estatisticas": "STATISTICS",
    "/conquistas": "STATISTICS", "/calendario": "CALENDAR", "/home": "HOME",
  };
  for (const [legacy, destination] of Object.entries(redirects)) {
    const escaped = legacy.replace("/", "\\/");
    assert.match(routes, new RegExp(
      `path=["']${escaped}["'][\\s\\S]{0,100}Navigate to=\\{ROUTES\\.${destination}\\}`
    ), `${legacy} deve redirecionar para ${destination}`);
  }
});

test("conteúdo diário é estável no dia e sempre avança no calendário local", () => {
  const samples = [
    [new Date(2026, 7, 7, 0, 5), new Date(2026, 7, 7, 23, 55), new Date(2026, 7, 8, 0, 5)],
    [new Date(2026, 7, 31, 20), new Date(2026, 7, 31, 22), new Date(2026, 8, 1, 1)],
    [new Date(2026, 11, 31, 20), new Date(2026, 11, 31, 23), new Date(2027, 0, 1, 1)],
  ];
  const readers = [getDailyMoment, getDailyReflection, getDailyCare];
  for (const [start, sameDay, nextDay] of samples) {
    for (const reader of readers) {
      const first = reader(start);
      assert.deepEqual(first, reader(sameDay));
      const next = reader(nextDay);
      assert.notEqual(JSON.stringify({ ...first, dateKey: undefined }),
        JSON.stringify({ ...next, dateKey: undefined }));
    }
  }
});

test("conteúdo diário não depende de toISOString para definir o dia", () => {
  const localDate = new Date(2026, 0, 2, 0, 15);
  localDate.toISOString = () => { throw new Error("UTC não deve ser consultado"); };
  assert.equal(getDailyMoment(localDate).dateKey, "2026-01-02");
  assert.equal(getDailyReflection(localDate).dateKey, "2026-01-02");
  assert.equal(getDailyCare(localDate).dateKey, "2026-01-02");
});

test("limpeza voluntária remove só o histórico legado do Assistente", () => {
  storageValues.clear();
  storageValues.set("abrigo:ai-history:v1", JSON.stringify({ version: 1, items: [{ id: "old" }] }));
  storageValues.set("abrigo:ai-preferences:v1", JSON.stringify({ version: 1, enabled: false }));
  storageValues.set("abrigo:diary", JSON.stringify([{ id: "keep" }]));
  let syncOperation = null;
  const unsubscribe = subscribe(SYNC_EVENT, (operation) => { syncOperation = operation; });
  assert.equal(hasLegacyAssistantHistory(), true);
  assert.equal(clearLegacyAssistantHistory(), true);
  unsubscribe();
  assert.equal(hasLegacyAssistantHistory(), false);
  assert.ok(storageValues.has("abrigo:ai-preferences:v1"));
  assert.ok(storageValues.has("abrigo:diary"));
  assert.equal(syncOperation?.module, "legacy-assistant-history");
  assert.equal(syncOperation?.action, "delete");
});

test("Pesquisa adapta linguagem histórica sem alterar dados de origem", () => {
  const achievement = {
    id: "legacy", title: "Meta e conquista", description: "Sequência com progresso",
    unlocked: true,
  };
  const data = {
    diary: [{ id: "d", content: "texto" }], calendar: [], favorites: [], goals: [], habits: [],
    achievements: { items: [achievement] },
  };
  const index = createSearchIndex(data);
  assert.equal(index.find((item) => item.module === "diary").title, "Reflexão guardada");
  const mark = index.find((item) => item.module === "achievements");
  assert.equal(mark.title, "Intenção e marco");
  assert.equal(mark.body, "Continuidade com caminho");
  assert.equal(achievement.title, "Meta e conquista");
});

test("Lar não monta o antigo painel de desempenho", async () => {
  const home = await readSource("src/modules/home/Lar.jsx");
  assert.doesNotMatch(home, /Dashboard|TodayCenter|Companion|Streak|FraseDoDia/);
  assert.match(home, /<MoodSelector/);
  assert.match(home, /getDailyMoment/);
  assert.match(home, /getDailyCare/);
  assert.match(home, /getDailyReflection/);
});

test("experiência atual não expõe módulo de Assistente", async () => {
  const [routes, settings, exportService] = await Promise.all([
    readSource("src/app/router/AppRoutes.jsx"),
    readSource("src/modules/settings/Configuracoes.jsx"),
    readSource("src/core/export/ExportDataService.js"),
  ]);
  assert.doesNotMatch(routes, /modules\/assistant|ROUTES\.ASSISTANT/);
  assert.doesNotMatch(settings, /core\/ai|Assistente externo|Ativar Assistente/);
  assert.doesNotMatch(exportService, /assistant:\s*\{/);
});

test("src não contém runtime ou imports da IA removida", async () => {
  async function sourceFiles(directory) {
    const entries = await readdir(new URL(`../${directory}/`, import.meta.url), { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => entry.isDirectory()
      ? sourceFiles(`${directory}/${entry.name}`)
      : entry.name.match(/\.(js|jsx)$/) ? [`${directory}/${entry.name}`] : []));
    return nested.flat();
  }
  const files = await sourceFiles("src");
  assert.equal(files.some((file) => file.startsWith("src/core/ai/")
    || file.startsWith("src/modules/assistant/")), false);
  const sources = await Promise.all(files.map(readSource));
  const runtime = sources.join("\n");
  for (const forbidden of ["/api/ai", "core/ai/", "modules/assistant/", "AIService", "AIContextBuilder"]) {
    assert.equal(runtime.includes(forbidden), false, forbidden);
  }
});

test("Navbar fechada fica inerte e mantém tratamento de foco", async () => {
  const [navbar, css] = await Promise.all([
    readSource("src/shared/componentes/Navbar.jsx"),
    readSource("src/shared/componentes/Navbar.css"),
  ]);
  assert.match(navbar, /inert=\{menuAberto \? undefined : ""\}/);
  assert.match(navbar, /menuRef\.current\?\.querySelector\("button"\)\?\.focus\(\)/);
  assert.match(navbar, /requestAnimationFrame\(\(\) => menuButtonRef\.current\?\.focus\(\)\)/);
  assert.match(navbar, /event\.key === "Escape"/);
  assert.match(css, /\.navbar-icon:focus-visible/);
  assert.match(css, /\.menu-links a:focus-visible/);
});

test("telas emocionais não aninham main dentro do Container e preservam foco visível", async () => {
  const pages = [
    "src/modules/home/Lar.jsx", "src/modules/moment/MomentoDoDia.jsx",
    "src/modules/diary/pages/Diary.jsx", "src/modules/goals/Metas.jsx",
    "src/modules/habits/Habitos.jsx", "src/modules/statistics/Statistics.jsx",
    "src/modules/search/GlobalSearch.jsx", "src/modules/settings/Configuracoes.jsx",
    "src/modules/home/components/Welcome.jsx", "src/modules/export/ExportCenter.jsx",
    "src/modules/admin/AdminAnalytics.jsx",
  ];
  const sources = await Promise.all(pages.map(readSource));
  assert.equal(sources.some((source) => /<main\b/.test(source)), false);
  const styles = await Promise.all([
    "src/modules/home/components/MoodSelector.css", "src/modules/home/components/Welcome.css",
    "src/modules/diary/styles/Diary.css", "src/modules/goals/Metas.css",
    "src/modules/habits/Habitos.css", "src/modules/moment/MomentoDoDia.css",
    "src/modules/settings/Configuracoes.css",
  ].map(readSource));
  for (const css of styles) assert.match(css, /:focus-visible/);
});

test("Retrospectiva não apresenta porcentagens, sequência ou comparação de desempenho", async () => {
  const source = await readSource("src/modules/statistics/Statistics.jsx");
  assert.match(source, /Retrospectiva/);
  assert.match(source, /Marcos/);
  assert.doesNotMatch(source, /averageProgress|completionRate|currentStreak|Regularidade|Comparação com/);
});
