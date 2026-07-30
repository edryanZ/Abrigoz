import { loadDevice, saveDevice } from "../storage/DeviceStorage";

function createId() { return crypto.randomUUID(); }
export function getDevice() {
  const stored = loadDevice();
  if (stored?.id) return stored;
  const device = { id: createId(), name: "Este dispositivo", createdAt: new Date().toISOString(), lastSyncAt: null };
  saveDevice(device);
  return device;
}
export function updateDeviceName(name) { const device = { ...getDevice(), name: name.trim() || "Este dispositivo" }; saveDevice(device); return device; }
export function markDeviceSynced() { const device = { ...getDevice(), lastSyncAt: new Date().toISOString() }; saveDevice(device); return device; }
