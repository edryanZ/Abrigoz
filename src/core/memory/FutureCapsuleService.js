import STORAGE_KEYS from "../constants/storageKeys.js";
import { localDateKey } from "../intelligence/localDates.js";
import { storage } from "../storage/storage.js";
import { emitSync } from "../sync/emitSync.js";

const VERSION = 1;
const MAX_MESSAGE_LENGTH = 2400;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function loadRecords() {
  const raw = storage.get(STORAGE_KEYS.FUTURE_CAPSULES);
  return raw?.version === VERSION && Array.isArray(raw.items) ? raw.items : [];
}

function persist(items) {
  if (!storage.set(STORAGE_KEYS.FUTURE_CAPSULES, { version: VERSION, items })) {
    throw new Error("Não foi possível guardar esta cápsula agora.");
  }
}

export function isValidLocalDateKey(value) {
  if (!DATE_PATTERN.test(String(value))) return false;
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function addLocalMonths(date, months) {
  const source = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  const day = source.getDate();
  source.setDate(1);
  source.setMonth(source.getMonth() + months);
  const lastDay = new Date(source.getFullYear(), source.getMonth() + 1, 0, 12).getDate();
  source.setDate(Math.min(day, lastDay));
  return localDateKey(source);
}

export function resolveCapsuleDate(preset, now = new Date()) {
  if (preset === "1m") return addLocalMonths(now, 1);
  if (preset === "3m") return addLocalMonths(now, 3);
  if (preset === "1y") return addLocalMonths(now, 12);
  return "";
}

export function createFutureCapsule({ message, openOn }, now = new Date()) {
  const content = String(message ?? "").trim();
  if (!content) throw new Error("Escreva uma mensagem antes de selar a cápsula.");
  if (content.length > MAX_MESSAGE_LENGTH) throw new Error("A mensagem está longa demais para esta cápsula.");
  if (!isValidLocalDateKey(openOn) || openOn <= localDateKey(now)) {
    throw new Error("Escolha uma data futura para abrir a cápsula.");
  }
  const record = {
    id: crypto.randomUUID(),
    message: content,
    createdOn: localDateKey(now),
    openOn,
  };
  persist([...loadRecords(), record]);
  emitSync({ module: "future-capsules", action: "create", recordId: record.id });
  return { ...record, message: undefined, sealed: true };
}

export function listFutureCapsules(now = new Date()) {
  const today = localDateKey(now);
  return loadRecords().map((record) => {
    const sealed = today < record.openOn;
    return {
      id: record.id,
      createdOn: record.createdOn,
      openOn: record.openOn,
      sealed,
      ...(sealed ? {} : { message: record.message }),
    };
  });
}

export function deleteFutureCapsule(id) {
  const records = loadRecords();
  if (!records.some((record) => record.id === id)) return false;
  persist(records.filter((record) => record.id !== id));
  emitSync({ module: "future-capsules", action: "delete", recordId: id });
  return true;
}

export { VERSION as FUTURE_CAPSULE_VERSION };
