import { useState } from "react";
import { FaCheck, FaEdit, FaPlus, FaTrash } from "react-icons/fa";

import { GOAL_STATUSES, isGoalOverdue } from "../services/goalsService";

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onComplete,
  onAddStep,
  onToggleStep,
  onRemoveStep,
}) {
  const [stepTitle, setStepTitle] = useState("");
  const overdue = isGoalOverdue(goal);
  return (
    <article className={`goal-card ${overdue ? "is-overdue" : ""}`}>
      <header>
        <div>
          <span>{goal.category} · prioridade {
            goal.priority === "high" ? "alta"
              : goal.priority === "low" ? "baixa" : "média"
          }</span>
          <h2>{goal.title}</h2>
        </div>
        <strong>{GOAL_STATUSES[goal.status]}</strong>
      </header>
      {goal.description && <p>{goal.description}</p>}
      <div className="goal-progress">
        <div><i style={{ width: `${goal.progress}%` }} /></div>
        <span>{goal.progress}%</span>
      </div>
      {goal.dueDate && (
        <p className="goal-due">
          {overdue ? "Prazo atrasado: " : "Prazo: "}
          {new Intl.DateTimeFormat("pt-BR").format(
            new Date(`${goal.dueDate}T12:00:00`)
          )}
        </p>
      )}
      <div className="goal-steps">
        {goal.steps.map((step) => (
          <div key={step.id}>
            <label>
              <input type="checkbox" checked={step.completed}
                onChange={() => onToggleStep(goal.id, step.id)} />
              <span>{step.title}</span>
            </label>
            <button type="button" onClick={() => onRemoveStep(goal.id, step.id)}
              aria-label={`Remover etapa ${step.title}`}><FaTrash /></button>
          </div>
        ))}
        <form onSubmit={(event) => {
          event.preventDefault();
          if (stepTitle.trim()) {
            onAddStep(goal.id, stepTitle);
            setStepTitle("");
          }
        }}>
          <input value={stepTitle} onChange={(event) => setStepTitle(event.target.value)}
            placeholder="Nova etapa" aria-label="Nova etapa" />
          <button type="submit" aria-label="Adicionar etapa"><FaPlus /></button>
        </form>
      </div>
      {goal.notes && <p className="goal-notes">{goal.notes}</p>}
      <footer>
        <button type="button"
          onClick={() => onComplete(goal.id, goal.status !== "completed")}>
          <FaCheck /> {goal.status === "completed" ? "Reabrir" : "Concluir"}
        </button>
        <button type="button" onClick={() => onEdit(goal)}><FaEdit /> Editar</button>
        <button type="button" onClick={() => onDelete(goal)}><FaTrash /> Excluir</button>
      </footer>
    </article>
  );
}
