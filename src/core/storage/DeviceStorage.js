const KEY = "abrigo:device:v1";
export function loadDevice() { try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; } }
export function saveDevice(device) { localStorage.setItem(KEY, JSON.stringify(device)); }
export { KEY as DEVICE_STORAGE_KEY };
