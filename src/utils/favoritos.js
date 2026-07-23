const CHAVE = "abrigo-favoritos";

export function obterFavoritos() {
  return JSON.parse(localStorage.getItem(CHAVE)) || [];
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

  localStorage.setItem(CHAVE, JSON.stringify(favoritos));

  return favoritos;
}