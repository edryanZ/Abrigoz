import { loadQueue, saveQueue } from "../storage/SyncStorage.js";

let queue = loadQueue().map((item) =>
  item.status === "processing" ? { ...item, status: "failed" } : item
);
saveQueue(queue);
let processing = false;

export function enqueue(operation) {
  const item = {
    id: crypto.randomUUID(),
    module: String(operation?.module ?? "unknown").slice(0, 60),
    action: String(operation?.action ?? "updated").slice(0, 30),
    recordId: operation?.recordId == null
      ? null
      : String(operation.recordId).slice(0, 120),
    timestamp: Number.isNaN(Date.parse(operation?.timestamp))
      ? new Date().toISOString()
      : operation.timestamp,
    status: "pending",
    attempts: 0,
  };
  queue = [...queue, item];
  saveQueue(queue);
  return item;
}
export async function processQueue(handler = async () => {}) {
  if (processing) return false;
  processing = true;
  try {
    const next = queue.find((item) => item.status === "pending" || item.status === "failed");
    if (!next) return false;
    next.status = "processing"; saveQueue(queue);
    try {
      await handler(next);
      queue = queue.filter((item) => item.id !== next.id);
    } catch (error) {
      next.status = "failed";
      next.attempts += 1;
      saveQueue(queue);
      throw error;
    }
    saveQueue(queue);
    return true;
  } finally { processing = false; }
}
export function getQueue() { return [...queue]; }
