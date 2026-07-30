import { useCallback, useMemo, useState } from "react";

import {
  deleteFavorite,
  filterFavorites,
  loadFavorites,
  saveFavorite,
  togglePinned,
} from "../services/favoritesService";

export default function useFavorites() {
  const [items, setItems] = useState(() => loadFavorites().items);
  const [filters, setFilters] = useState({
    query: "",
    type: "all",
    tag: "",
    order: "recent",
  });
  const refresh = useCallback(() => setItems(loadFavorites().items), []);

  return {
    items: useMemo(() => filterFavorites(items, filters), [filters, items]),
    allItems: items,
    filters,
    setFilter: (key, value) =>
      setFilters((current) => ({ ...current, [key]: value })),
    save: (input) => {
      const result = saveFavorite(input);
      refresh();
      return result;
    },
    remove: (id) => {
      const result = deleteFavorite(id);
      refresh();
      return result;
    },
    togglePinned: (id) => {
      const result = togglePinned(id);
      refresh();
      return result;
    },
  };
}
