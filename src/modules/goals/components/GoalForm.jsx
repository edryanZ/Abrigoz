import { useState } from "react";

import { GOAL_STATUSES } from "../services/goalsService";

const EMPTY = {
  title: "",
  description: "",
  category: "Pessoal",
  startDate: new Date().toLocaleDateString("en-CA"),
  dueDate: "",
  priority: "medium",
  progress: 0,
  status: "not_started",
  notes: "",
};

export default function GoalForm({ goal, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...goal }));
  const [error, setError] = useState("");
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));

  return (
    <form
      className="goal-form"
      onSubmit={(event) => {
        event.preventDefault();
        try {
          onSave(form);
        } catch (saveError) {
          setError(saveError.message);
        }
      }}
    >
      <label>Título *<input required value={form.title}
        onChange={(event) => update("title", event.target.value)} /></label>
      <label>Descrição<textarea rows="3" value={form.description}
        onChange={(event) => update("description", event.target.value)} /></label>
      <div className="goal-form-grid">
        <label>Categoria<input value={form.category}
          onChange={(event) => update("category", event.target.value)} /></label>
        <label>Prioridade<select value={form.priority}
          onChange={(event) => update("priority", event.target.value)}>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
        </select></label>
        <label>Data inicial<input type="date" value={form.startDate}
          onChange={(event) => update("startDate", event.target.value)} /></label>
        <label>Prazo<input type="date" value={form.dueDate}
          onChange={(event) => update("dueDate", event.target.value)} /></label>
        <label>Status<select value={form.status}
          onChange={(event) => update("status", event.target.value)}>
          {Object.entries(GOAL_STATUSES).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select></label>
        <label>Progresso: {form.progress}%<input type="range" min="0" max="100"
          value={form.progress}
          disabled={form.status === "completed"}
          onChange={(event) => update("progress", event.target.value)} /></label>
      </div>
      <label>Observações<textarea rows="3" value={form.notes}
        onChange={(event) => update("notes", event.target.value)} /></label>
      {error && <p className="goal-error" role="alert">{error}</p>}
      <div className="goal-form-actions">
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit">Salvar meta</button>
      </div>
    </form>
  );
}
