import "./ModalEvento.css";

import { useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";

import { EVENT_CATEGORIES } from "../services/calendarService";

const EMPTY_EVENT = {
  title: "",
  description: "",
  date: "",
  time: "",
  allDay: true,
  category: "personal",
  location: "",
  priority: "medium",
  recurrence: "none",
  recurrenceEnd: "",
};

export default function ModalEvento({ event, selectedDate, onClose, onSave }) {
  const [form, setForm] = useState(
    () => ({ ...EMPTY_EVENT, date: selectedDate, ...event })
  );
  const titleRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => titleRef.current?.focus(), 0);
    const handleKey = (keyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  const update = (field, value) => setForm((current) => ({
    ...current,
    [field]: value,
  }));

  return (
    <div className="modal-overlay" role="presentation">
      <section
        className="modal-evento calendar-event-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-form-title"
      >
        <button
          type="button"
          className="modal-fechar"
          onClick={onClose}
          aria-label="Fechar"
        >
          <FaTimes />
        </button>
        <h2 id="event-form-title">{event ? "Editar evento" : "Novo evento"}</h2>

        <form
          className="calendar-event-form"
          onSubmit={(submitEvent) => {
            submitEvent.preventDefault();
            onSave(form);
          }}
        >
          <label htmlFor="event-title">Título *</label>
          <input
            ref={titleRef}
            id="event-title"
            required
            maxLength={100}
            value={form.title}
            onChange={(changeEvent) => update("title", changeEvent.target.value)}
          />

          <label htmlFor="event-description">Descrição</label>
          <textarea
            id="event-description"
            rows="3"
            value={form.description}
            onChange={(changeEvent) =>
              update("description", changeEvent.target.value)}
          />

          <div className="calendar-form-grid">
            <div>
              <label htmlFor="event-date">Data *</label>
              <input
                id="event-date"
                type="date"
                required
                value={form.date}
                onChange={(changeEvent) => update("date", changeEvent.target.value)}
              />
            </div>
            <div>
              <label htmlFor="event-time">Horário</label>
              <input
                id="event-time"
                type="time"
                disabled={form.allDay}
                value={form.time}
                onChange={(changeEvent) => update("time", changeEvent.target.value)}
              />
            </div>
          </div>

          <label className="calendar-checkbox">
            <input
              type="checkbox"
              checked={form.allDay}
              onChange={(changeEvent) => update("allDay", changeEvent.target.checked)}
            />
            Evento de dia inteiro
          </label>

          <div className="calendar-form-grid">
            <div>
              <label htmlFor="event-category">Categoria</label>
              <select
                id="event-category"
                value={form.category}
                onChange={(changeEvent) =>
                  update("category", changeEvent.target.value)}
              >
                {Object.entries(EVENT_CATEGORIES).map(([value, details]) => (
                  <option key={value} value={value}>{details.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="event-priority">Prioridade</label>
              <select
                id="event-priority"
                value={form.priority}
                onChange={(changeEvent) =>
                  update("priority", changeEvent.target.value)}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>

          <label htmlFor="event-location">Localização</label>
          <input
            id="event-location"
            maxLength={160}
            value={form.location}
            onChange={(changeEvent) => update("location", changeEvent.target.value)}
          />

          <div className="calendar-form-grid">
            <div>
              <label htmlFor="event-recurrence">Repetição</label>
              <select
                id="event-recurrence"
                value={form.recurrence}
                onChange={(changeEvent) =>
                  update("recurrence", changeEvent.target.value)}
              >
                <option value="none">Nenhuma</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
                <option value="yearly">Anualmente</option>
              </select>
            </div>
            <div>
              <label htmlFor="event-recurrence-end">Repetir até</label>
              <input
                id="event-recurrence-end"
                type="date"
                disabled={form.recurrence === "none"}
                min={form.date}
                value={form.recurrenceEnd}
                onChange={(changeEvent) =>
                  update("recurrenceEnd", changeEvent.target.value)}
              />
            </div>
          </div>

          <div className="calendar-modal-actions">
            <button type="button" className="secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit">Salvar evento</button>
          </div>
        </form>
      </section>
    </div>
  );
}
