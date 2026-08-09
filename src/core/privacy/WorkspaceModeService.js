import STORAGE_KEYS from "../constants/storageKeys.js";

export const WORKSPACE_MODES = Object.freeze({
  PERSONAL: "personal",
  VISITOR: "visitor",
  DEMO: "demo",
});

const SESSION_KEY = "abrigo:workspace-mode:v1";
const ephemeralStores = new Map([
  [WORKSPACE_MODES.VISITOR, new Map()],
  [WORKSPACE_MODES.DEMO, new Map()],
]);

const DEMO_FIXTURES = Object.freeze({
  [STORAGE_KEYS.USER]: {
    id: "demo-user",
    name: "Demonstração",
    createdAt: "2026-01-01T12:00:00.000Z",
    preferences: { theme: "system", music: false, volume: 0.4 },
  },
  [STORAGE_KEYS.DIARY]: [{
    id: "demo-reflection",
    title: "Uma pausa de exemplo",
    content: "Hoje eu percebi como alguns minutos de calma podem mudar o ritmo do dia.",
    createdAt: "2025-07-12T18:00:00.000Z",
  }],
  [STORAGE_KEYS.FAVORITE_ITEMS]: [{
    id: "demo-favorite",
    title: "Caminhar sem pressa",
    description: "Um exemplo fictício de algo que pode fazer bem.",
    createdAt: "2025-08-03T10:00:00.000Z",
  }],
  [STORAGE_KEYS.EVENTS]: [{
    id: "demo-event",
    title: "Tempo para respirar",
    description: "Evento fictício de demonstração.",
    date: "2026-01-15",
    allDay: true,
  }],
  [STORAGE_KEYS.FUTURE_CAPSULES]: {
    version: 1,
    items: [{
      id: "demo-capsule",
      title: "Cápsula de exemplo",
      message: "Este conteúdo é fictício e existe somente na demonstração.",
      openOn: "2025-01-01",
      createdAt: "2024-12-01T12:00:00.000Z",
    }],
  },
});

let currentMode = readSessionMode();
let demoSeeded = false;
const listeners = new Set();

function readSessionMode() {
  try {
    const value = globalThis.sessionStorage?.getItem(SESSION_KEY);
    return Object.values(WORKSPACE_MODES).includes(value)
      ? value
      : WORKSPACE_MODES.PERSONAL;
  } catch {
    return WORKSPACE_MODES.PERSONAL;
  }
}

function clone(value) {
  return value == null ? value : structuredClone(value);
}

function ensureDemo() {
  if (demoSeeded) return;
  const target = ephemeralStores.get(WORKSPACE_MODES.DEMO);
  Object.entries(DEMO_FIXTURES).forEach(([key, value]) => target.set(key, clone(value)));
  demoSeeded = true;
}

export function getWorkspaceMode() {
  return currentMode;
}

export function isPersonalWorkspace() {
  return currentMode === WORKSPACE_MODES.PERSONAL;
}

export function getEphemeralWorkspaceStore() {
  if (currentMode === WORKSPACE_MODES.PERSONAL) return null;
  if (currentMode === WORKSPACE_MODES.DEMO) ensureDemo();
  return ephemeralStores.get(currentMode);
}

export function setWorkspaceMode(mode) {
  if (!Object.values(WORKSPACE_MODES).includes(mode)) {
    throw new Error("Modo do Abrigo inválido.");
  }
  if (mode === WORKSPACE_MODES.DEMO) ensureDemo();
  if (mode === WORKSPACE_MODES.VISITOR) ephemeralStores.get(mode).clear();
  currentMode = mode;
  try { globalThis.sessionStorage?.setItem(SESSION_KEY, mode); } catch { /* session optional */ }
  listeners.forEach((listener) => listener(mode));
  return mode;
}

export function endEphemeralWorkspace() {
  if (currentMode !== WORKSPACE_MODES.PERSONAL) {
    ephemeralStores.get(currentMode)?.clear();
    if (currentMode === WORKSPACE_MODES.DEMO) demoSeeded = false;
  }
  return setWorkspaceMode(WORKSPACE_MODES.PERSONAL);
}

export function subscribeWorkspaceMode(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const WorkspaceModeService = {
  getMode: getWorkspaceMode,
  setMode: setWorkspaceMode,
  isPersonal: isPersonalWorkspace,
  endEphemeral: endEphemeralWorkspace,
  subscribe: subscribeWorkspaceMode,
};

export default WorkspaceModeService;
