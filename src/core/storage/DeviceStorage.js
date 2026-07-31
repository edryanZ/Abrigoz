import { storage } from "./storage.js";

const KEY = "abrigo:device:v1";
export function loadDevice() { return storage.get(KEY); }
export function saveDevice(device) { return storage.set(KEY, device); }
export { KEY as DEVICE_STORAGE_KEY };
