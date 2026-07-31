const storage = {
  get(key) {
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
    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );

      return true;
    } catch (error) {
      console.error(`Erro ao salvar "${key}".`, error);
      return false;
    }
  },

  setMany(values) {
    Object.entries(values).forEach(([key, value]) => {
      this.set(key, value);
    });
  },

  has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },

  removeMany(keys) {
    keys.forEach((key) => localStorage.removeItem(key));
  },

  keys() {
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
        localStorage.removeItem(key);
      }
    });
    return true;
  },
};

export { storage };

export default storage;
