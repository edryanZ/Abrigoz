import { useState } from "react";

import { localDateKey } from "../utils/habitDates";

const EMPTY = {
  name: "",
  description: "",
  icon: "🌱",
  color: "#7d8ff2",
  frequency: "daily",
  weekdays: [],
  time: "",
  target: 1,
  startDate: localDateKey(),
  archived: false,
};
const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function HabitForm({ habit, onSave, onCancel }) {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...habit }));
  const [error, setError] = useState("");
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const toggleDay = (day) => update(
    "weekdays",
    form.weekdays.includes(day)
      ? form.weekdays.filter((value) => value !== day)
      : [...form.weekdays, day]
  );

  return (
    <form className="habit-form" onSubmit={(event) => {
      event.preventDefault();
      try { onSave(form); } catch (saveError) { setError(saveError.message); }
    }}>
      <div className="habit-form-grid compact">
        <label>Emoji<input value={form.icon} maxLength={8}
          onChange={(event) => update("icon", event.target.value)} /></label>
        <label>Cor<input type="color" value={form.color}
          onChange={(event) => update("color", event.target.value)} /></label>
      </div>
      <label>Nome *<input required value={form.name}
        onChange={(event) => update("name", event.target.value)} /></label>
      <label>Descrição<textarea rows="3" value={form.description}
        onChange={(event) => update("description", event.target.value)} /></label>
      <div className="habit-form-grid">
        <label>Frequência<select value={form.frequency}
          onChange={(event) => update("frequency", event.target.value)}>
          <option value="daily">Diariamente</option>
          <option value="weekdays">Dias específicos</option>
          <option value="weekly_count">Vezes por semana</option>
        </select></label>
        <label>Horário opcional<input type="time" value={form.time}
          onChange={(event) => update("time", event.target.value)} /></label>
        <label>Meta {form.frequency === "weekly_count" ? "semanal" : "diária"}
          <input type="number" min="1" max="7" value={form.target}
            onChange={(event) => update("target", event.target.value)} /></label>
        <label>Data inicial<input type="date" value={form.startDate}
          onChange={(event) => update("startDate", event.target.value)} /></label>
      </div>
      {form.frequency === "weekdays" && <fieldset className="habit-weekdays">
        <legend>Dias da semana</legend>
        {DAYS.map((day, index) => <label key={day}>
          <input type="checkbox" checked={form.weekdays.includes(index)}
            onChange={() => toggleDay(index)} />{day}</label>)}
      </fieldset>}
      {error && <p className="habit-error" role="alert">{error}</p>}
      <div className="habit-form-actions">
        <button type="button" className="secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit">Salvar hábito</button>
      </div>
    </form>
  );
}
