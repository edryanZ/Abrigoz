import "./CalendarioGrid.css";

import { FaCalendarDay, FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { EVENT_CATEGORIES } from "../services/calendarService";
import { toLocalDateKey } from "../utils/calendarDates";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CalendarioGrid({
  month,
  selectedDate,
  occurrences,
  onSelect,
  onChangeMonth,
  onToday,
}) {
  const firstWeekday = new Date(
    month.getFullYear(),
    month.getMonth(),
    1
  ).getDay();
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  const todayKey = toLocalDateKey(new Date());
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(month);

  const days = [
    ...Array.from({ length: firstWeekday }, (_, index) => ({
      empty: true,
      key: `empty-${index}`,
    })),
    ...Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
      const key = toLocalDateKey(date);
      return {
        key,
        day: index + 1,
        events: occurrences.filter((event) => event.occurrenceDate === key),
      };
    }),
  ];

  return (
    <div className="calendario-grid-container">
      <header className="calendario-header">
        <button
          type="button"
          className="btn-mes"
          onClick={() => onChangeMonth(-1)}
          aria-label="Mês anterior"
        >
          <FaChevronLeft />
        </button>
        <h2>{monthLabel}</h2>
        <button
          type="button"
          className="btn-mes"
          onClick={() => onChangeMonth(1)}
          aria-label="Próximo mês"
        >
          <FaChevronRight />
        </button>
      </header>

      <button type="button" className="btn-hoje" onClick={onToday}>
        <FaCalendarDay aria-hidden="true" /> Hoje
      </button>

      <div className="dias-semana">
        {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
      </div>

      <div className="grade-calendario">
        {days.map((item) => item.empty ? (
          <span className="dia vazio" key={item.key} aria-hidden="true" />
        ) : (
          <button
            key={item.key}
            type="button"
            className={[
              "dia",
              item.key === todayKey ? "hoje" : "",
              item.key === selectedDate ? "ativo" : "",
              item.events.length ? "evento" : "",
            ].join(" ")}
            onClick={() => onSelect(item.key)}
            aria-label={`${item.day}, ${item.events.length} evento(s)`}
          >
            <span className="numero-dia">{item.day}</span>
            <span className="calendar-dots" aria-hidden="true">
              {item.events.slice(0, 3).map((event) => (
                <i
                  key={`${event.id}-${event.occurrenceDate}`}
                  style={{
                    background: EVENT_CATEGORIES[event.category]?.color,
                  }}
                />
              ))}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
