/* global process */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import handler, {
  aggregateAdminAnalytics, validateAdminRange,
} from "../api/admin-analytics.js";
import { validateAnalyticsEvent } from "../src/core/analytics/AnalyticsPolicy.js";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};
globalThis.window = {
  setInterval, clearInterval, addEventListener() {}, removeEventListener() {},
};
globalThis.document = {
  visibilityState: "visible", addEventListener() {}, removeEventListener() {},
};

test("métricas rejeitam nomes, campos livres e conteúdo pessoal", () => {
  assert.equal(validateAnalyticsEvent("page_view", { page: "home" }), true);
  assert.equal(validateAnalyticsEvent("page_view", { page: "home", text: "privado" }), false);
  assert.equal(validateAnalyticsEvent("app_open", { identifier: "pessoal" }), false);
  assert.equal(validateAnalyticsEvent("diary_saved", { content: "privado" }), false);
});

test("painel agrega dados e protege grupos pequenos", () => {
  const result = aggregateAdminAnalytics({
    online_sessions: 2,
    daily: [{
      date: "2026-07-30",
      sessions: 2,
      page_views: 8,
      safe_errors: 1,
      module_counts: { home: 2 },
      device_counts: { mobile: 2 },
      version_counts: { "2.0.0": 2 },
      execution_mode_counts: { pwa: 2 },
      hour_counts: { 20: 2 },
      session_token_hash: "não deve sair",
    }],
  });
  assert.equal(result.online_sessions, "less_than_5");
  assert.equal(result.summary.estimated_sessions, "less_than_5");
  assert.equal(result.summary.page_views, "less_than_5");
  assert.equal(result.popular_pages[0].count, "less_than_5");
  assert.equal(JSON.stringify(result).includes("session_token_hash"), false);
  assert.equal(JSON.stringify(result).includes("não deve sair"), false);
});

test("migration de agregados mantém escrita anônima fechada e retenção", async () => {
  const source = await readFile(new URL(
    "../supabase/migrations/20260802120000_analytics_admin_aggregates.sql",
    import.meta.url
  ), "utf8");
  assert.match(source, /security definer/);
  assert.match(source, /set search_path = pg_catalog, public/);
  assert.match(source, /p_execution_mode not in \('browser','pwa'\)/);
  assert.match(source, /interval '10 minutes'/);
  assert.match(source, /date < .* - 365/s);
  assert.match(source, /grant execute on function public\.record_analytics_event.*to anon/s);
  assert.doesNotMatch(source, /grant\s+select|grant\s+all\s+on\s+public\.analytics_/i);
});

test("cliente carrega repositório remoto somente depois do consentimento", async () => {
  const tracker = await readFile(new URL(
    "../src/core/analytics/AnalyticsTracker.jsx", import.meta.url
  ), "utf8");
  const service = await readFile(new URL(
    "../src/core/analytics/AnalyticsService.js", import.meta.url
  ), "utf8");
  assert.match(tracker, /getAnalyticsConsent/);
  assert.match(tracker, /import\("\.\/AnalyticsService(?:\.js)?"\)/);
  assert.match(service, /import\("\.\.\/repository\/AnalyticsRepository\.js"\)/);
  assert.doesNotMatch(service, /localStorage|sessionStorage/);
});

test("analytics começa ativado por padrão e pode ser revogado", async () => {
  values.clear();

  const service = await import("../src/core/analytics/AnalyticsService.js");

  assert.equal(service.getAnalyticsConsent(), true);

  await service.setAnalyticsConsent(false);

  assert.equal(service.getAnalyticsConsent(), false);
  assert.equal(
    await service.trackAnonymousEvent("page_view", { page: "home" }),
    false
  );
});

test("intervalos administrativos inválidos e campos extras são rejeitados", () => {
  assert.deepEqual(validateAdminRange({ start: "2026-07-01", end: "2026-07-30" }),
    { start: "2026-07-01", end: "2026-07-30" });
  assert.equal(validateAdminRange({ start: "2026-01-01", end: "2026-07-30" }), null);
  assert.equal(validateAdminRange({ start: "2026-07-30", end: "2026-07-01" }), null);
  assert.equal(validateAdminRange({
    start: "2026-07-01", end: "2026-07-30", session: "proibido",
  }), null);
});

test("endpoint administrativo exige credencial verificada no servidor", async () => {
  const previous = {
    token: process.env.ADMIN_ANALYTICS_TOKEN,
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };
  process.env.ADMIN_ANALYTICS_TOKEN = "credencial-de-teste";
  process.env.SUPABASE_URL = "https://example.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "chave-de-teste";
  let status;
  let payload;
  const response = {
    status(value) { status = value; return this; },
    setHeader() { return this; },
    end(value) { payload = JSON.parse(value); },
  };
  await handler({
    method: "POST",
    headers: { authorization: "Bearer incorreta" },
    body: { start: "2026-07-30", end: "2026-07-30" },
  }, response);
  assert.equal(status, 401);
  assert.deepEqual(payload, { error: "unauthorized" });
  for (const [key, value] of Object.entries({
    ADMIN_ANALYTICS_TOKEN: previous.token,
    SUPABASE_URL: previous.url,
    SUPABASE_SERVICE_ROLE_KEY: previous.key,
  })) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("rota administrativa permanece lazy e fora da navegação comum", async () => {
  const routes = await readFile(new URL("../src/app/router/AppRoutes.jsx", import.meta.url), "utf8");
  const navbar = await readFile(new URL("../src/shared/componentes/Navbar.jsx", import.meta.url), "utf8");
  assert.match(routes, /lazy\(\(\) => import\("\.\.\/\.\.\/modules\/admin\/AdminAnalytics"\)\)/);
  assert.doesNotMatch(navbar, /ADMIN_ACTIVITY|admin\/atividade/);
});

test("sessão anônima é aleatória, somente em memória e transmitida como hash", async () => {
  const source = await readFile(new URL(
    "../src/core/analytics/AnalyticsService.js", import.meta.url
  ), "utf8");
  assert.match(source, /crypto\.getRandomValues\(new Uint8Array\(32\)\)/);
  assert.match(source, /crypto\.subtle\.digest\("SHA-256", token\)/);
  assert.match(source, /sessionTokenHash\s*=\s*null/);
  assert.doesNotMatch(source, /storage\.(?:get|set).*session|localStorage|sessionStorage/i);
});
