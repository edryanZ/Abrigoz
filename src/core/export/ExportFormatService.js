const escapeCsv = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const flatten = (value, prefix = "", result = {}) => {
  if (!value || typeof value !== "object") result[prefix] = value;
  else Object.entries(value).forEach(([key, item]) =>
    flatten(item, prefix ? `${prefix}.${key}` : key, result));
  return result;
};

export function toCsv(document) {
  const rows = Object.entries(document.modules).flatMap(([module, data]) =>
    (Array.isArray(data) ? data : [data]).map((item) => ({ module, ...flatten(item) })));
  const headers = [...new Set(rows.flatMap(Object.keys))];
  return [headers.map(escapeCsv).join(","), ...rows.map((row) =>
    headers.map((header) => escapeCsv(row[header])).join(","))].join("\n");
}

export function toMarkdown(document) {
  return Object.entries(document.modules).map(([module, data]) =>
    `## ${module}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``).join("\n\n");
}

export function toHtml(document) {
  const escape = (value) => String(value).replace(/[&<>"]/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);
  return `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Exportação do Abrigo</title>
  <style>body{font:16px system-ui;max-width:900px;margin:auto;padding:32px;color:#17213d}
  pre{white-space:pre-wrap;background:#f2f3fa;padding:16px;border-radius:12px}</style>
  <h1>Exportação do Abrigo</h1>${Object.entries(document.modules).map(([module, data]) =>
    `<section><h2>${escape(module)}</h2><pre>${escape(JSON.stringify(data, null, 2))}</pre></section>`).join("")}</html>`;
}

export function toCalendar(document) {
  const events = Array.isArray(document.modules.calendar) ? document.modules.calendar : [];
  const clean = (value) => String(value ?? "").replace(/[\\,;]/g, "\\$&").replace(/\n/g, "\\n");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Abrigo//Export//PT-BR",
    ...events.flatMap((event) => ["BEGIN:VEVENT",`UID:${clean(event.id ?? crypto.randomUUID())}@abrigo.local`,
      `SUMMARY:${clean(event.title ?? event.titulo)}`,`DTSTART;VALUE=DATE:${String(event.date ?? event.data ?? "").replaceAll("-", "")}`,
      "END:VEVENT"]),"END:VCALENDAR"].join("\r\n");
}
