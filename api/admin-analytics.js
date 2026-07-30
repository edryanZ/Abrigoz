/* global Buffer, process */
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";

const MAX_RANGE_DAYS = 366;

function json(response, status, body) {
  response.status(status).setHeader("Content-Type", "application/json");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(body));
}

export default async function handler(request, response) {
  if (request.method !== "POST") return json(response, 405, { error: "method_not_allowed" });
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
  const start = /^\d{4}-\d{2}-\d{2}$/.test(request.body?.start ?? "")
    ? request.body.start : new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const end = /^\d{4}-\d{2}-\d{2}$/.test(request.body?.end ?? "")
    ? request.body.end : new Date().toISOString().slice(0, 10);
  const span = (new Date(`${end}T12:00:00`) - new Date(`${start}T12:00:00`)) / 86400000;
  if (span < 0 || span > MAX_RANGE_DAYS) return json(response, 400, { error: "invalid_range" });
  const client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc("get_analytics_admin_summary", {
    p_start_date: start, p_end_date: end,
  });
  if (error) return json(response, 502, { error: "admin_query_failed" });
  return json(response, 200, { data });
}
