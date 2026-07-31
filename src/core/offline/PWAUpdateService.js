let updateHandler = null;

export function configurePWAUpdate(handler) {
  updateHandler = handler;
}

export function announcePWAUpdate() {
  window.dispatchEvent(new CustomEvent("abrigo:pwa-update"));
}

export async function applyPWAUpdate() {
  if (!updateHandler) return false;
  await updateHandler(true);
  return true;
}
