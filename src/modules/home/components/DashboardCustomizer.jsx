import { useState } from "react";

import {
  DEFAULT_DASHBOARD_CARDS,
  loadDashboardPreferences,
  saveDashboardPreferences,
} from "../../../core/intelligence/DashboardIntelligence";

const LABELS = {
  today: "Hoje", organization: "Organização", weekly: "Resumo semanal",
  memory: "Memórias", companion: "Companheiro", achievements: "Conquistas",
  protection: "Proteção",
};

export default function DashboardCustomizer() {
  const [preferences, setPreferences] = useState(loadDashboardPreferences);
  const toggle = (id) => setPreferences(saveDashboardPreferences({
    ...preferences,
    hidden: preferences.hidden.includes(id)
      ? preferences.hidden.filter((item) => item !== id)
      : [...preferences.hidden, id],
  }));
  const move = (id, direction) => {
    const order = [...preferences.order];
    const index = order.indexOf(id);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= order.length) return;
    [order[index], order[next]] = [order[next], order[index]];
    setPreferences(saveDashboardPreferences({ ...preferences, order }));
  };
  return (
    <details className="dashboard-customizer">
      <summary>Personalizar Dashboard</summary>
      <p>Escolha o que aparece e ajuste a ordem dos grupos.</p>
      {preferences.order.map((id) => <div key={id}>
        <label><input type="checkbox" checked={!preferences.hidden.includes(id)}
          onChange={() => toggle(id)} />{LABELS[id]}</label>
        <button type="button" onClick={() => move(id, -1)} aria-label={`Mover ${LABELS[id]} para cima`}>↑</button>
        <button type="button" onClick={() => move(id, 1)} aria-label={`Mover ${LABELS[id]} para baixo`}>↓</button>
      </div>)}
      <button type="button" onClick={() => setPreferences(saveDashboardPreferences({
        ...preferences, order: DEFAULT_DASHBOARD_CARDS, hidden: [],
      }))}>Restaurar padrão</button>
    </details>
  );
}
