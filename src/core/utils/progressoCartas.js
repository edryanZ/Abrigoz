import storage from "../storage/storage";

export function obterProgresso(categoria) {
  const historico = storage.getOrDefault(
    `cartas-${categoria.id}`,
    []
  );

  return {
    lidas: historico.length,
    total: categoria.cartas.length,
    completo: historico.length >= categoria.cartas.length,
    percentual:
      categoria.cartas.length === 0
        ? 0
        : Math.round(
            (historico.length / categoria.cartas.length) * 100
          ),
  };
}