/* global Buffer, process */
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

const MAX_RANGE_DAYS = 30;
let lastRequestAt = 0;

function json(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

function addCounts(target, source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) return;
  for (const [key, value] of Object.entries(source)) {
    const count = Number(value);
    if (Number.isFinite(count) && count >= 0) target[key] = (target[key] ?? 0) + count;
  }
}

function protectedCount(value) {
  const count = Math.max(0, Number(value) || 0);
  return count > 0 && count < 5 ? "less_than_5" : count;
}

function ranked(counts) {
  return Object.entries(counts).map(([name, count]) => ({
    name,
    count: protectedCount(count),
  })).sort((first, second) => Number(second.count) - Number(first.count));
}

export function validateAdminRange(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)
      || Object.keys(body).some((key) => !["start", "end"].includes(key))) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.start ?? "")
      || !/^\d{4}-\d{2}-\d{2}$/.test(body.end ?? "")) return null;
  const startTime = Date.parse(`${body.start}T12:00:00Z`);
  const endTime = Date.parse(`${body.end}T12:00:00Z`);
  const span = (endTime - startTime) / 86400000;
  if (!Number.isFinite(span) || span < 0 || span > MAX_RANGE_DAYS) return null;
  return { start: body.start, end: body.end };
}

export function aggregateAdminAnalytics(payload = {}) {
  const dailySource = Array.isArray(payload.daily) ? payload.daily : [];
  const modules = {};
  const devices = {};
  const versions = {};
  const modes = {};
  const hours = {};
  let estimatedSessions = 0;
  let pageViews = 0;
  let technicalErrors = 0;
  const daily = dailySource.map((day) => {
    const sessions = Math.max(0, Number(day.sessions) || 0);
    const views = Math.max(0, Number(day.page_views) || 0);
    const errors = Math.max(0, Number(day.safe_errors) || 0);
    estimatedSessions += sessions;
    pageViews += views;
    technicalErrors += errors;
    addCounts(modules, day.module_counts);
    addCounts(devices, day.device_counts);
    addCounts(versions, day.version_counts);
    addCounts(modes, day.execution_mode_counts);
    addCounts(hours, day.hour_counts);
    const privateDay = sessions > 0 && sessions < 5;
    return {
      date: day.date,
      estimated_sessions: protectedCount(sessions),
      page_views: privateDay ? "less_than_5" : views,
      technical_errors: privateDay ? "less_than_5" : errors,
    };
  });
  return {
    online_sessions: protectedCount(payload.online_sessions),
    summary: {
      estimated_sessions: protectedCount(estimatedSessions),
      page_views: estimatedSessions > 0 && estimatedSessions < 5
        ? "less_than_5" : pageViews,
      technical_errors: estimatedSessions > 0 && estimatedSessions < 5
        ? "less_than_5" : technicalErrors,
    },
    daily,
    popular_pages: ranked(modules),
    devices: ranked(devices),
    app_versions: ranked(versions),
    execution_modes: ranked(modes),
    peak_hours: ranked(hours),
    updated_at: new Date().toISOString(),
  };
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "method_not_allowed" });
  if (Date.now() - lastRequestAt < 500) {
    return json(response, 429, { error: "rate_limited" });
  }
  lastRequestAt = Date.now();
  const configuredToken = process.env.ADMIN_ANALYTICS_TOKEN;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!configuredToken || !url || !serviceKey) {
    return json(response, 503, { error: "admin_not_configured" });
  }
  const authorization = request.headers.authorization ?? "";
  const supplied = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const left = Buffer.from(supplied);
  const right = Buffer.from(configuredToken);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return json(response, 401, { error: "unauthorized" });
  }
  const range = validateAdminRange(request.body);
  if (!range) return json(response, 400, { error: "invalid_range" });
  const { start, end } = range;
  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc("get_analytics_admin_summary", {
    p_start_date: start, p_end_date: end,
  });
  if (error) return json(response, 502, { error: "admin_query_failed" });
  return json(response, 200, aggregateAdminAnalytics(data));
}
