import "./DashboardGrid.css";

import { Link } from "react-router-dom";

import GlassCard from "../../../shared/ui/GlassCard";
import StreakCard from "./StreakCard";

const cards = [
  ["Próximo evento", "Nenhum evento próximo."],
  ["Últimas cartas", "Uma nova carta pode iluminar seu dia."],
  ["Metas", "Você ainda não criou metas."],
  ["Hábitos de hoje", "Seus hábitos aparecerão aqui."],
  ["Resumo semanal", "Sua jornada será resumida aqui ao longo da semana."],
  ["Últimos favoritos", "Nenhum favorito adicionado."],
];

export default function DashboardGrid() {
  return (
    <section className="dashboard-grid" aria-label="Visão geral do Abrigo">
      <GlassCard className="dashboard-card dashboard-card--diary">
        <p className="dashboard-card__eyebrow">Seu espaço</p>
        <h2>Diário</h2>
        <p>Reserve alguns minutos para registrar o que importa hoje.</p>
        <Link className="dashboard-card__action" to="/diario">
          Escrever no diário
        </Link>
      </GlassCard>

      <GlassCard className="dashboard-card dashboard-card--streak">
        <StreakCard />
      </GlassCard>

      {cards.map(([title, message]) => (
        <GlassCard key={title} className="dashboard-card">
          <p className="dashboard-card__eyebrow">Abrigo</p>
          <h2>{title}</h2>
          <p>{message}</p>
        </GlassCard>
      ))}
    </section>
  );
}
