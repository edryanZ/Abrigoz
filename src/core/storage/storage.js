const storage = {
  get(key) {
    const value = localStorage.getItem(key);
    if (value === null) return null;

    try {
      return JSON.parse(value);
    } catch {
      return value;
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
    return localStorage.getItem(key) !== null;
  },

  remove(key) {
    localStorage.removeItem(key);
  },

  removeMany(keys) {
    keys.forEach((key) => localStorage.removeItem(key));
  },

  keys() {
    return Array.from(
      { length: localStorage.length },
      (_, index) => localStorage.key(index)
    ).filter(Boolean);
  },

  clear(prefix = null) {
    if (!prefix) {
      localStorage.clear();
      return;
    }

    this.keys().forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  },
};

export { storage };

export default storage;
