import STORAGE_KEYS from "../constants/storageKeys";
import storage from "../lib/storage";

export function obterFavoritos() {
  return storage.getOrDefault(STORAGE_KEYS.FAVORITES, []);
}

export function favorito(cartaId) {
  return obterFavoritos().includes(cartaId);
}

export function alternarFavorito(cartaId) {
  const favoritos = obterFavoritos();

  const indice = favoritos.indexOf(cartaId);

  if (indice >= 0) {
    favoritos.splice(indice, 1);
  } else {
    favoritos.push(cartaId);
  }

  storage.set(STORAGE_KEYS.FAVORITES, favoritos);

  return favoritos;
}