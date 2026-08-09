import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const localValues = new Map();
const sessionValues = new Map();
function fakeStorage(values) {
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    key: (index) => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  };
}
globalThis.localStorage = fakeStorage(localValues);
globalThis.sessionStorage = fakeStorage(sessionValues);

const modes = await import("../src/core/privacy/WorkspaceModeService.js");
const pin = await import("../src/core/privacy/DevicePinService.js");
const { storage } = await import("../src/core/storage/storage.js");

test("Sprint 8A isola Pessoal, Visitante e Demonstração no core de storage", () => {
  localValues.clear();
  modes.setWorkspaceMode(modes.WORKSPACE_MODES.PERSONAL);
  storage.set("abrigo:diary", [{ id: "pessoal", content: "privado" }]);

  modes.setWorkspaceMode(modes.WORKSPACE_MODES.VISITOR);
  assert.equal(storage.get("abrigo:diary"), null);
  storage.set("abrigo:diary", [{ id: "visita" }]);
  assert.doesNotMatch(localValues.get("abrigo:diary"), /visita/);

  modes.setWorkspaceMode(modes.WORKSPACE_MODES.DEMO);
  assert.equal(storage.get("abrigo:user").name, "Demonstração");
  assert.notEqual(storage.get("abrigo:diary")?.[0]?.id, "pessoal");

  modes.endEphemeralWorkspace();
  assert.equal(storage.get("abrigo:diary")[0].id, "pessoal");
});

test("Visitante é descartado ao encerrar", () => {
  modes.setWorkspaceMode(modes.WORKSPACE_MODES.VISITOR);
  storage.set("temp", { text: "somente sessão" });
  modes.endEphemeralWorkspace();
  modes.setWorkspaceMode(modes.WORKSPACE_MODES.VISITOR);
  assert.equal(storage.get("temp"), null);
  modes.endEphemeralWorkspace();
});

test("PIN usa PBKDF2 e nunca persiste o valor original", async () => {
  localValues.clear();
  await pin.enableDevicePin("483726", { autoLock: "minutes", timeoutMinutes: 3 });
  const raw = localValues.get(pin.DEVICE_PIN_STORAGE_KEY);
  assert.ok(raw);
  assert.doesNotMatch(raw, /483726/);
  assert.match(raw, /PBKDF2-SHA-256/);
  assert.equal(await pin.verifyDevicePin("483726"), true);
  assert.equal(await pin.verifyDevicePin("111111"), false);
  assert.equal(pin.getPinConfiguration().timeoutMinutes, 3);
});

test("PIN pode ser trocado e desativado somente com PIN atual", async () => {
  await assert.rejects(pin.changeDevicePin("000000", "912345"), /incorreto/);
  await pin.changeDevicePin("483726", "912345");
  assert.equal(await pin.verifyDevicePin("483726"), false);
  assert.equal(await pin.verifyDevicePin("912345"), true);
  await assert.rejects(pin.disableDevicePin("483726"), /incorreto/);
  assert.equal(await pin.disableDevicePin("912345"), true);
  assert.equal(pin.getPinConfiguration().enabled, false);
});

test("Visitante e Demo bloqueiam sync e analytics e componentes não acessam storage direto", async () => {
  const [emit, analytics, settings, app] = await Promise.all([
    readFile(new URL("../src/core/sync/emitSync.js", import.meta.url), "utf8"),
    readFile(new URL("../src/core/analytics/AnalyticsService.js", import.meta.url), "utf8"),
    readFile(new URL("../src/modules/settings/components/PrivacySpaceSettings.jsx", import.meta.url), "utf8"),
    readFile(new URL("../src/app/App.jsx", import.meta.url), "utf8"),
  ]);
  assert.match(emit, /isPersonalWorkspace/);
  assert.match(analytics, /isPersonalWorkspace/);
  assert.match(app, /WorkspaceRuntime\s+key=\{workspaceMode\}/);
  assert.doesNotMatch(settings, /localStorage|sessionStorage|Supabase/);
});
