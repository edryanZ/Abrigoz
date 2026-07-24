import storage from "../../core/storage/storage";

export function sortearCarta(categoria) {
  const chave = `cartas-${categoria.id}`;

  let historico = storage.getOrDefault(chave, []);

  const restantes = categoria.cartas.filter(
    ({ id }) => !historico.includes(id)
  );

  if (restantes.length === 0) {
    historico = [];
    storage.remove(chave);

    return sortearCarta(categoria);
  }

  const carta =
    restantes[
      Math.floor(Math.random() * restantes.length)
    ];

  historico.push(carta.id);

  storage.set(chave, historico);

  return carta;
}