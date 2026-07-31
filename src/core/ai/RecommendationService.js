export function prioritizeRecommendations({ favorites = [], local = [], external = [] }) {
  return [
    ...favorites.map((item) => ({ ...item, origin: "Favorito local" })),
    ...local.map((item) => ({ ...item, origin: "Catálogo local" })),
    ...external.map((item) => ({ ...item, origin: "Serviço externo" })),
  ];
}
