import { FaEdit, FaExternalLinkAlt, FaThumbtack, FaTrash } from "react-icons/fa";

import { FAVORITE_TYPES } from "../services/favoritesService";

export default function FavoriteCard({ item, onEdit, onDelete, onPin }) {
  return (
    <article className={`favorite-card ${item.primary ? "is-primary" : ""}`}>
      {item.imageUrl && (
        <img src={item.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
      )}
      <div className="favorite-card__body">
        <span>{FAVORITE_TYPES[item.type]}</span>
        <h2>{item.title}</h2>
        {item.description && <p>{item.description}</p>}
        {!!item.tags.length && (
          <div className="favorite-tags">
            {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </div>
        )}
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            Abrir link <FaExternalLinkAlt aria-hidden="true" />
          </a>
        )}
      </div>
      <div className="favorite-card__actions">
        <button
          type="button"
          className={item.pinned ? "active" : ""}
          onClick={() => onPin(item.id)}
          aria-label={item.pinned ? "Desafixar favorito" : "Fixar favorito"}
        >
          <FaThumbtack />
        </button>
        <button type="button" onClick={() => onEdit(item)} aria-label="Editar">
          <FaEdit />
        </button>
        <button type="button" onClick={() => onDelete(item)} aria-label="Excluir">
          <FaTrash />
        </button>
      </div>
    </article>
  );
}
