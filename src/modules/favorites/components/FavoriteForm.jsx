import { useState } from "react";

import { FAVORITE_TYPES } from "../services/favoritesService";

const EMPTY = {
  title: "",
  type: "text",
  description: "",
  link: "",
  imageUrl: "",
  tags: [],
  pinned: false,
  primary: false,
  moodTags: [],
  approximateDuration: "",
  qualities: [],
  avoidWhenTired: false,
};

export default function FavoriteForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...item }));
  const [error, setError] = useState("");
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="organizer-form"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          onSave(form);
        } catch (saveError) {
          setError(saveError.message);
        }
      }}
    >
      <label htmlFor="favorite-title">Título *</label>
      <input
        id="favorite-title"
        required
        maxLength={100}
        value={form.title}
        onChange={(event) => update("title", event.target.value)}
      />
      <label htmlFor="favorite-type">Tipo</label>
      <select
        id="favorite-type"
        value={form.type}
        onChange={(event) => update("type", event.target.value)}
      >
        {Object.entries(FAVORITE_TYPES).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <label htmlFor="favorite-description">Descrição</label>
      <textarea
        id="favorite-description"
        rows="3"
        value={form.description}
        onChange={(event) => update("description", event.target.value)}
      />
      <label htmlFor="favorite-link">Link</label>
      <input
        id="favorite-link"
        type="url"
        placeholder="https://"
        value={form.link}
        onChange={(event) => update("link", event.target.value)}
      />
      <label htmlFor="favorite-image">Imagem por URL</label>
      <input
        id="favorite-image"
        type="url"
        placeholder="https://"
        value={form.imageUrl}
        onChange={(event) => update("imageUrl", event.target.value)}
      />
      <label htmlFor="favorite-tags">Tags, separadas por vírgula</label>
      <input
        id="favorite-tags"
        value={Array.isArray(form.tags) ? form.tags.join(", ") : form.tags}
        onChange={(event) => update("tags", event.target.value)}
      />
      <div className="organizer-checks">
        <label>
          <input
            type="checkbox"
            checked={form.pinned}
            onChange={(event) => update("pinned", event.target.checked)}
          />
          Deixar por perto
        </label>
      </div>
      {error && <p className="organizer-error" role="alert">{error}</p>}
      <div className="organizer-form-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit">Guardar</button>
      </div>
    </form>
  );
}
