import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { aggregateAdminAnalytics } from "../api/admin-analytics.js";
import { validateAnalyticsEvent } from "../src/core/analytics/AnalyticsPolicy.js";

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
