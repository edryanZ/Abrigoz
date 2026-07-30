import { FaArchive, FaEdit, FaTrash, FaUndo } from "react-icons/fa";

import { habitStats, isHabitScheduled } from "../services/habitsService";
import { localDateKey, parseLocalDate, weekDays } from "../utils/habitDates";

export default function HabitCard({
  habit,
  onToggle,
  onEdit,
  onArchive,
  onDelete,
}) {
  const today = new Date();
  const todayKey = localDateKey(today);
  const doneToday = habit.completions.includes(todayKey);
  const stats = habitStats(habit, today);
  const week = weekDays(today);

  return (
    <article className="habit-card" style={{ "--habit-color": habit.color }}>
      <header>
        <span className="habit-icon">{habit.icon}</span>
        <div><h2>{habit.name}</h2>
          <p>{habit.description || "Um passo de cada vez."}</p></div>
      </header>
      <div className="habit-week" aria-label="Histórico desta semana">
        {week.map(({ key, date }) => {
          const scheduled = isHabitScheduled(habit, date);
          const completed = habit.completions.includes(key);
          return <button key={key} type="button"
            disabled={!scheduled || habit.archived}
            className={completed ? "completed" : ""}
            onClick={() => onToggle(habit.id, key)}
            aria-label={`${key}: ${completed ? "concluído" : "não concluído"}`}>
            <span>{new Intl.DateTimeFormat("pt-BR", { weekday: "narrow" })
              .format(date)}</span><strong>{date.getDate()}</strong>
          </button>;
        })}
      </div>
      <dl className="habit-stats">
        <div><dt>Sequência</dt><dd>{stats.currentStreak} dias</dd></div>
        <div><dt>Maior</dt><dd>{stats.longestStreak} dias</dd></div>
        <div><dt>Conclusão</dt><dd>{stats.completionRate}%</dd></div>
      </dl>
      {!habit.archived && isHabitScheduled(habit, today) && (
        <button type="button" className="habit-today"
          onClick={() => onToggle(habit.id, todayKey)}>
          {doneToday ? <><FaUndo /> Desfazer hoje</> : "Concluir hoje"}
        </button>
      )}
      <footer>
        <button type="button" onClick={() => onEdit(habit)}><FaEdit /> Editar</button>
        <button type="button" onClick={() => onArchive(habit.id, !habit.archived)}>
          <FaArchive /> {habit.archived ? "Reativar" : "Arquivar"}
        </button>
        <button type="button" onClick={() => onDelete(habit)}><FaTrash /> Excluir</button>
      </footer>
      <small>Desde {new Intl.DateTimeFormat("pt-BR").format(
        parseLocalDate(habit.startDate)
      )}</small>
    </article>
  );
}
