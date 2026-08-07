export const ATMOSPHERE_FOCUS_EVENT = "abrigo:atmosphere-focus";

function publish(focused) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ATMOSPHERE_FOCUS_EVENT, { detail: Boolean(focused) }));
  }
}

export function enterReadingFocus() { publish(true); }
export function leaveReadingFocus() { publish(false); }
