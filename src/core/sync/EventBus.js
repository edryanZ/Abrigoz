const listeners = new Map();

export function subscribe(eventName, listener) {
  const eventListeners = listeners.get(eventName) ?? new Set();
  eventListeners.add(listener);
  listeners.set(eventName, eventListeners);
  return () => unsubscribe(eventName, listener);
}

export function unsubscribe(eventName, listener) {
  listeners.get(eventName)?.delete(listener);
}

export function emit(eventName, payload) {
  listeners.get(eventName)?.forEach((listener) => {
    try { listener(payload); } catch { /* An observer must not block the queue. */ }
  });
}
