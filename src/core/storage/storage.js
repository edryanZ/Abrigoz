const storage = {
  get(key) {
    try {
      const value = localStorage.getItem(key);

      return value !== null
        ? JSON.parse(value)
        : null;
    } catch (error) {
      console.error(`Erro ao ler "${key}".`, error);
      return null;
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
    return Object.keys(localStorage);
  },

  clear(prefix = null) {
    if (!prefix) {
      localStorage.clear();
      return;
    }

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  },
};

export { storage };

export default storage;