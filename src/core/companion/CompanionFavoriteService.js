import { saveFavorite } from "../../modules/favorites/services/favoritesService.js";

export function saveCompanionSuggestion(suggestion) {
  return saveFavorite({
    title: suggestion.title,
    type: "idea",
    description: suggestion.description,
    tags: suggestion.categories,
  });
}
