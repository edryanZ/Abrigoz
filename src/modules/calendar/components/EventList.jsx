import { FaClock, FaEdit, FaMapMarkerAlt, FaTrash } from "react-icons/fa";

import { EVENT_CATEGORIES } from "../services/calendarService";

export default function EventList({ events, onEdit, onDelete }) {
  if (!events.length) {
    return (
      <div className="calendar-empty">
        <span aria-hidden="true">🌿</span>
        <h3>Nada marcado por aqui</h3>
        <p>Este dia está livre para você ou para um novo momento especial.</p>
      </div>
    );
  }

  return (
    <div className="calendar-event-list">
      {events.map((event) => (
        <article
          className="calendar-event-item"
          key={`${event.id}-${event.occurrenceDate}`}
          style={{
            "--event-color": EVENT_CATEGORIES[event.category]?.color,
          }}
        >
          <div>
            <span className="calendar-event-category">
              {EVENT_CATEGORIES[event.category]?.label ?? "Outro"}
            </span>
            <h3>{event.title}</h3>
            {event.description && <p>{event.description}</p>}
            <div className="calendar-event-meta">
              <span><FaClock /> {event.allDay ? "Dia inteiro" : event.time}</span>
              {event.location && <span><FaMapMarkerAlt /> {event.location}</span>}
              <span>Prioridade {event.priority === "high"
                ? "alta"
                : event.priority === "low" ? "baixa" : "média"}</span>
            </div>
          </div>
          <div className="calendar-event-actions">
            <button type="button" onClick={() => onEdit(event)}>
              <FaEdit aria-hidden="true" /> Editar
            </button>
            <button type="button" onClick={() => onDelete(event)}>
              <FaTrash aria-hidden="true" /> Excluir
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
