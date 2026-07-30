import STORAGE_KEYS from "../../../core/constants/storageKeys";
import { storage } from "../../../core/storage/storage";
import { emitSync } from "../../../core/sync";

export const FAVORITES_VERSION = 2;
export const FAVORITE_TYPES = {
  text: "Texto",
  link: "Link",
  music: "Música",
  movie: "Filme ou série",
  book: "Livro",
  place: "Lugar",
  idea: "Ideia",
  custom: "Personalizado",
};

export function isValidOptionalUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeTags(tags) {
  const values = Array.isArray(tags) ? tags : String(tags ?? "").split(",");
  return [...new Set(
    values.map((tag) => tag.trim().toLocaleLowerCase("pt-BR")).filter(Boolean)
  )].slice(0, 12);
}

function normalizeFavorite(item) {
  const now = new Date().toISOString();
  return {
    id: String(item.id ?? crypto.randomUUID()),
    title: String(item.title ?? item.titulo ?? "Sem título").trim(),
    type: FAVORITE_TYPES[item.type ?? item.tipo]
      ? (item.type ?? item.tipo)
      : "custom",
    description: String(item.description ?? item.descricao ?? item.texto ?? ""),
    link: String(item.link ?? item.url ?? ""),
    imageUrl: String(item.imageUrl ?? item.imagem ?? ""),
    tags: normalizeTags(item.tags),
    pinned: Boolean(item.pinned ?? item.fixado),
    primary: Boolean(item.primary ?? item.principal),
    createdAt: item.createdAt ?? item.dataCriacao ?? now,
    updatedAt: item.updatedAt ?? now,
  };
}

function migrate(raw) {
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items) ? raw.items : [];
  return { version: FAVORITES_VERSION, items: items.map(normalizeFavorite) };
}

function persist(data) {
  if (!storage.set(STORAGE_KEYS.FAVORITE_ITEMS, data)) {
    throw new Error("Não foi possível salvar este favorito.");
  }
}

export function loadFavorites() {
  const raw = storage.get(STORAGE_KEYS.FAVORITE_ITEMS);
  const migrated = migrate(raw);
  if (raw?.version !== FAVORITES_VERSION) persist(migrated);
  return migrated;
}

export function saveFavorite(input) {
  const data = loadFavorites();
  const title = String(input.title ?? "").trim();
  if (!title) throw new Error("O título é obrigatório.");
  if (!isValidOptionalUrl(input.link) || !isValidOptionalUrl(input.imageUrl)) {
    throw new Error("Use um endereço válido começando com http ou https.");
  }
  const existing = data.items.find((item) => item.id === input.id);
  const favorite = normalizeFavorite({
    ...existing,
    ...input,
    title,
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  data.items = existing
    ? data.items.map((item) => item.id === favorite.id ? favorite : item)
    : [favorite, ...data.items];
  persist(data);
  emitSync({
    module: "favorites",
    action: existing ? "update" : "create",
    recordId: favorite.id,
  });
  return favorite;
}

export function deleteFavorite(id) {
  const data = loadFavorites();
  if (!data.items.some((item) => item.id === id)) return false;
  data.items = data.items.filter((item) => item.id !== id);
  persist(data);
  emitSync({ module: "favorites", action: "delete", recordId: id });
  return true;
}

export function togglePinned(id) {
  const item = loadFavorites().items.find((favorite) => favorite.id === id);
  if (!item) return null;
  return saveFavorite({ ...item, pinned: !item.pinned });
}

export function filterFavorites(items, {
  query = "",
  type = "all",
  tag = "",
  order = "recent",
} = {}) {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const normalizedTag = tag.trim().toLocaleLowerCase("pt-BR");
  return items
    .filter((item) => {
      const searchable = `${item.title} ${item.description} ${item.tags.join(" ")}`
        .toLocaleLowerCase("pt-BR");
      return (!normalizedQuery || searchable.includes(normalizedQuery))
        && (type === "all" || item.type === type)
        && (!normalizedTag || item.tags.includes(normalizedTag));
    })
    .sort((first, second) => {
      if (first.pinned !== second.pinned) return first.pinned ? -1 : 1;
      if (order === "oldest") {
        return first.createdAt.localeCompare(second.createdAt);
      }
      if (order === "alphabetical") {
        return first.title.localeCompare(second.title, "pt-BR");
      }
      return second.createdAt.localeCompare(first.createdAt);
    });
}
