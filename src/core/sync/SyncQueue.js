import { loadQueue, saveQueue } from "../storage/SyncStorage";

let queue = loadQueue();
let processing = false;

export function enqueue(operation) {
  queue = [...queue, { ...operation, id: crypto.randomUUID(), status: "pending", attempts: 0 }];
  saveQueue(queue);
}
export async function processQueue(handler = async () => {}) {
  if (processing) return;
  processing = true;
  try {
    const next = queue.find((item) => item.status === "pending" || item.status === "failed");
    if (!next) return;
    next.status = "processing"; saveQueue(queue);
    try { await handler(next); queue = queue.filter((item) => item.id !== next.id); }
    catch { next.status = "failed"; next.attempts += 1; }
    saveQueue(queue);
  } finally { processing = false; }
}
export function getQueue() { return [...queue]; }
