import STORAGE_KEYS from "../constants/storageKeys";

export function resetAbrigo() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}