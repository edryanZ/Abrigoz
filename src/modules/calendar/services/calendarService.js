import STORAGE_KEYS from "../../../core/constants/storageKeys";
import { storage } from "../../../core/storage/storage";
import { emitSync } from "../../../core/sync";
import { eventos as legacyBuiltInEvents } from "../../../data/eventos";
import { fromLocalDateKey, toLocalDateKey } from "../utils/calendarDates";

export const CALENDAR_SCHEMA_VERSION = 2;
export const EVENT_CATEGORIES = {
  personal: { label: "Pessoal", color: "#8b7cf6" },
  work: { label: "Trabalho", color: "#4f9ee8" },
  health: { label: "Saúde", color: "#45b98f" },
  study: { label: "Estudos", color: "#e3a84b" },
  celebration: { label: "Comemoração", color: "#e6759d" },
  other: { label: "Outro", color: "#8993a4" },
};

function safeDate(year, month, day) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
    ? toLocalDateKey(date)
    : toLocalDateKey(new Date());
}

function normalizeEvent(event, index = 0) {
  const now = new Date().toISOString();
  const legacyDate = event.date
    ?? safeDate(new Date().getFullYear(), Number(event.mes), Number(event.dia));
  const legacyAnnual = !event.date && event.dia && event.mes;

  return {
    id: String(event.id ?? crypto.randomUUID()),
    title: String(event.title ?? event.titulo ?? "Evento sem título").trim(),
    description: String(event.description ?? event.descricao ?? ""),
    date: fromLocalDateKey(legacyDate) ? legacyDate : toLocalDateKey(new Date()),
    time: /^\d{2}:\d{2}$/.test(event.time ?? "") ? event.time : "",
    allDay: event.allDay ?? !event.time,
    category: EVENT_CATEGORIES[event.category ?? event.categoria]
      ? (event.category ?? event.categoria)
      : legacyAnnual
        ? "celebration"
        : "other",
    location: String(event.location ?? ""),
    priority: ["low", "medium", "high"].includes(event.priority)
      ? event.priority
      : "medium",
    recurrence: legacyAnnual
      ? "yearly"
      : ["none", "daily", "weekly", "monthly", "yearly"].includes(
        event.recurrence
      )
        ? event.recurrence
        : "none",
    recurrenceEnd: fromLocalDateKey(event.recurrenceEnd)
      ? event.recurrenceEnd
      : "",
    excludedDates: Array.isArray(event.excludedDates)
      ? event.excludedDates.filter(fromLocalDateKey)
      : [],
    createdAt: event.createdAt ?? now,
    updatedAt: event.updatedAt ?? now,
    legacyOrder: index,
  };
}

function legacyDefaults() {
  return legacyBuiltInEvents.map((event, index) =>
    normalizeEvent({ ...event, id: `legacy-${event.id}` }, index)
  );
}

function migrateCalendar(raw) {
  const rawItems = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items)
      ? raw.items
      : [];
  const normalized = rawItems.map(normalizeEvent);
  const ids = new Set(normalized.map((event) => event.id));

  legacyDefaults().forEach((event) => {
    if (!ids.has(event.id)) normalized.push(event);
  });

  return { version: CALENDAR_SCHEMA_VERSION, items: normalized };
}

function writeCalendar(data) {
  if (!storage.set(STORAGE_KEYS.EVENTS, data)) {
    throw new Error("Não foi possível salvar os eventos.");
  }
}

export function loadCalendar() {
  const raw = storage.get(STORAGE_KEYS.EVENTS);
  const migrated = migrateCalendar(raw);
  if (
    raw?.version !== CALENDAR_SCHEMA_VERSION
    || migrated.items.length !== (raw?.items?.length ?? 0)
  ) {
    writeCalendar(migrated);
  }
  return migrated;
}

export function saveEvent(input) {
  const data = loadCalendar();
  const title = String(input.title ?? "").trim();
  if (!title) throw new Error("O título é obrigatório.");

  const existing = data.items.find((event) => event.id === input.id);
  const event = normalizeEvent({
    ...existing,
    ...input,
    id: existing?.id ?? crypto.randomUUID(),
    title,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  data.items = existing
    ? data.items.map((item) => item.id === event.id ? event : item)
    : [...data.items, event];
  writeCalendar(data);
  emitSync({
    module: "calendar",
    action: existing ? "update" : "create",
    recordId: event.id,
  });
  return event;
}

export function deleteEvent(id, occurrenceDate = null, scope = "series") {
  const data = loadCalendar();
  const event = data.items.find((item) => item.id === id);
  if (!event) return false;

  if (scope === "occurrence" && event.recurrence !== "none" && occurrenceDate) {
    event.excludedDates = [...new Set([
      ...(event.excludedDates ?? []),
      occurrenceDate,
    ])];
    event.updatedAt = new Date().toISOString();
  } else {
    data.items = data.items.filter((item) => item.id !== id);
  }

  writeCalendar(data);
  emitSync({ module: "calendar", action: "delete", recordId: id });
  return true;
}
