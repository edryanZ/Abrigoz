import { getEphemeralWorkspaceStore } from "../privacy/WorkspaceModeService.js";

const storage = {
  get(key) {
    const ephemeral = getEphemeralWorkspaceStore();
    if (ephemeral) return ephemeral.has(key) ? structuredClone(ephemeral.get(key)) : null;
    try {
      const value = localStorage.getItem(key);
      if (value === null) return null;
      return JSON.parse(value);
    } catch {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
  },

  getOrDefault(key, defaultValue) {
    const value = this.get(key);

    return value === null ? defaultValue : value;
  },

  set(key, value) {
    const ephemeral = getEphemeralWorkspaceStore();
    if (ephemeral) {
      ephemeral.set(key, structuredClone(value));
      return true;
    }
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch {
      return false;
    }
  },

  setMany(values) {
    Object.entries(values).forEach(([key, value]) => {
      this.set(key, value);
    });
  },

  has(key) {
    const ephemeral = getEphemeralWorkspaceStore();
    if (ephemeral) return ephemeral.has(key);
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  remove(key) {
    const ephemeral = getEphemeralWorkspaceStore();
    if (ephemeral) return ephemeral.delete(key) || true;
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  removeMany(keys) {
    return keys.every((key) => this.remove(key));
  },

  keys() {
    const ephemeral = getEphemeralWorkspaceStore();
    if (ephemeral) return [...ephemeral.keys()];
    try {
      return Array.from(
        { length: localStorage.length },
        (_, index) => localStorage.key(index)
      ).filter(Boolean);
    } catch {
      return [];
    }
  },

  clear(prefix = null) {
    const ephemeral = getEphemeralWorkspaceStore();
    if (ephemeral) {
      if (!prefix) ephemeral.clear();
      else [...ephemeral.keys()].filter((key) => key.startsWith(prefix)).forEach((key) => ephemeral.delete(key));
      return true;
    }
    if (!prefix) {
      try {
        localStorage.clear();
        return true;
      } catch {
        return false;
      }
    }

    this.keys().forEach((key) => {
      if (key.startsWith(prefix)) {
        this.remove(key);
      }
    });
    return true;
  },
};

export { storage };

export default storage;
