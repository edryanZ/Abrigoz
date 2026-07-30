import { getSupabaseClient, isSupabaseAvailable } from "../supabase/supabaseClient";

function available() {
  return isSupabaseAvailable();
}

async function rpc(name, params) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, reason: "unavailable" };
  try {
    const { data, error } = await client.rpc(name, params);
    if (error) return { ok: false, reason: "remote_error" };
    return { ok: true, data };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}

export const AnalyticsRepository = Object.freeze({
  isAvailable: available,
  recordEvent(event) {
    return rpc("record_analytics_event", {
      p_session_token_hash: event.sessionTokenHash,
      p_event_name: event.name,
      p_page_name: event.page ?? null,
      p_device_category: event.deviceCategory,
      p_app_version: event.appVersion,
      p_error_code: event.errorCode ?? null,
    });
  },
  heartbeat(presence) {
    return rpc("analytics_heartbeat", {
      p_session_token_hash: presence.sessionTokenHash,
      p_device_category: presence.deviceCategory,
      p_app_version: presence.appVersion,
    });
  },
});
