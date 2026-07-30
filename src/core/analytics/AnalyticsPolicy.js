export const ALLOWED_ANALYTICS_EVENTS = Object.freeze([
  "app_open", "page_view", "pwa_installed", "sync_success", "sync_failure",
  "backup_export_started", "backup_export_completed", "app_error_safe",
]);
export const ALLOWED_ANALYTICS_PAGES = Object.freeze([
  "home", "diary", "calendar", "letters", "favorites", "goals", "habits",
  "statistics", "achievements", "search", "settings",
]);
export const ALLOWED_SAFE_ERRORS = Object.freeze([
  "render_failed", "storage_unavailable", "network_unavailable",
]);

export function validateAnalyticsEvent(name, fields = {}) {
  if (!ALLOWED_ANALYTICS_EVENTS.includes(name)) return false;
  const allowedKeys = name === "page_view" ? ["page"]
    : name === "app_error_safe" ? ["errorCode"] : [];
  if (Object.keys(fields).some((key) => !allowedKeys.includes(key))) return false;
  if (name === "page_view" && !ALLOWED_ANALYTICS_PAGES.includes(fields.page)) return false;
  if (name === "app_error_safe" && !ALLOWED_SAFE_ERRORS.includes(fields.errorCode)) return false;
  return true;
}
