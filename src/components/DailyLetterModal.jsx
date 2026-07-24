import "./DailyLetterModal.css";

import { FaEnvelopeOpen, FaTimes } from "react-icons/fa";

export default function DailyLetterModal({
  open,
  title,
  message,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="daily-letter-overlay" onClick={onClose}>
      <div
        className="daily-letter-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="daily-letter-close"
          onClick={onClose}
          aria-label="Fechar"
        >
          <FaTimes />
        </button>

        <div className="daily-letter-icon">
          <FaEnvelopeOpen />
        </div>

        <h2>Carta do Dia</h2>

        <h3>{title}</h3>

        <div className="daily-letter-divider" />

        <p>{message}</p>

        <button
          className="daily-letter-button"
          onClick={onClose}
        >
          Guardar Carta
        </button>
      </div>
    </div>
  );
}