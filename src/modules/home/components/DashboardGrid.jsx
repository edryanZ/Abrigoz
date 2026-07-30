import "./DashboardGrid.css";

import { Link } from "react-router-dom";

import useOrganizationSummary from "../../../core/organization/useOrganizationSummary";
import GlassCard from "../../../shared/ui/GlassCard";
import StreakCard from "./StreakCard";

function DashboardCard({ eyebrow, title, children, to, action }) {
  return (
    <GlassCard className="dashboard-card">
      <p className="dashboard-card__eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <div className="dashboard-card__content">{children}</div>
      <Link className="dashboard-card__action" to={to}>{action}</Link>
    </GlassCard>
  );
}

export default function DashboardGrid() {
  const summary = useOrganizationSummary();
  const nextDate = summary.calendar.next
    ? new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
    }).format(new Date(`${summary.calendar.next.date}T12:00:00`))
    : null;

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

      <DashboardCard eyebrow="Calendário" title="Próximo compromisso"
        to="/calendario" action="Abrir calendário">
        <strong>{summary.calendar.todayCount} evento(s) hoje</strong>
        <p>{summary.calendar.next
          ? `${summary.calendar.next.title} · ${nextDate}${
            summary.calendar.next.time ? ` às ${summary.calendar.next.time}` : ""
          }`
          : "Nenhum compromisso próximo. Seu tempo está livre."}</p>
      </DashboardCard>

      <DashboardCard eyebrow="Favoritos" title="Guardados com carinho"
        to="/favoritos" action="Ver favoritos">
        {summary.favorites.length
          ? <ul>{summary.favorites.map((item) =>
            <li key={item.id}>{item.pinned ? "📌 " : ""}{item.title}</li>)}</ul>
          : <p>Nenhum favorito adicionado ainda.</p>}
      </DashboardCard>

      <DashboardCard eyebrow="Metas" title="Seus próximos passos"
        to="/metas" action="Ver metas">
        <strong>{summary.goals.active} em andamento</strong>
        <p>{summary.goals.dueSoon} próxima(s) do prazo · {
          summary.goals.progress}% de progresso geral</p>
      </DashboardCard>

      <DashboardCard eyebrow="Hábitos" title="Hábitos de hoje"
        to="/habitos" action="Cuidar da rotina">
        <strong>{summary.habits.completed} de {summary.habits.total} concluído(s)</strong>
        <p>{summary.habits.highlightStreak
          ? `Sequência em destaque: ${summary.habits.highlightStreak} dias`
          : "Uma pequena ação já pode começar uma sequência."}</p>
      </DashboardCard>
    </section>
  );
}
