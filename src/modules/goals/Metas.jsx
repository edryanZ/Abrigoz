import "./Metas.css";

import { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";

import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import PrivacyNotice from "../../shared/componentes/PrivacyNotice";
import { useTheme } from "../../shared/contexts/ThemeContext";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import GoalCard from "./components/GoalCard";
import GoalForm from "./components/GoalForm";
import useGoals from "./hooks/useGoals";
import { GOAL_STATUSES } from "./services/goalsService";

export default function Metas() {
  const { greeting } = useTheme();
  const goals = useGoals();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const close = () => { setFormOpen(false); setEditing(null); };
  const average = goals.allItems.length
    ? Math.round(goals.allItems.reduce((sum, goal) => sum + goal.progress, 0)
      / goals.allItems.length)
    : 0;

  return (
    <>
      <Navbar />
      <Container>
        <PageHeader greeting={`${greeting} 🎯`} title="Metas"
          subtitle="Transforme planos grandes em passos possíveis." />
        <PrivacyNotice />
        <section className="goal-summary">
          <GlassCard hover={false}><strong>{goals.allItems.length}</strong>
            <span>metas guardadas</span></GlassCard>
          <GlassCard hover={false}><strong>{average}%</strong>
            <span>progresso geral</span></GlassCard>
          <GlassCard hover={false}><strong>{
            goals.allItems.filter((goal) => goal.status === "completed").length
          }</strong><span>concluídas</span></GlassCard>
        </section>
        <GlassCard className="goal-toolbar" hover={false}>
          <label><span>Buscar</span><div className="goal-search"><FaSearch />
            <input value={goals.filters.query}
              onChange={(event) => goals.setFilter("query", event.target.value)}
              placeholder="Buscar meta" /></div></label>
          <label><span>Status</span><select value={goals.filters.status}
            onChange={(event) => goals.setFilter("status", event.target.value)}>
            <option value="all">Todos</option>
            {Object.entries(GOAL_STATUSES).map(([value, label]) =>
              <option key={value} value={value}>{label}</option>)}
          </select></label>
          <label><span>Categoria</span><select value={goals.filters.category}
            onChange={(event) => goals.setFilter("category", event.target.value)}>
            <option value="all">Todas</option>
            {goals.categories.map((category) =>
              <option key={category} value={category}>{category}</option>)}
          </select></label>
          <label><span>Prioridade</span><select value={goals.filters.priority}
            onChange={(event) => goals.setFilter("priority", event.target.value)}>
            <option value="all">Todas</option><option value="high">Alta</option>
            <option value="medium">Média</option><option value="low">Baixa</option>
          </select></label>
          <label><span>Ordenar</span><select value={goals.filters.order}
            onChange={(event) => goals.setFilter("order", event.target.value)}>
            <option value="due">Prazo</option><option value="progress">Progresso</option>
            <option value="created">Criação</option>
          </select></label>
          <button type="button" onClick={() => setFormOpen(true)}>
            <FaPlus /> Nova meta
          </button>
        </GlassCard>
        {formOpen && <GlassCard className="goal-editor" hover={false}>
          <h2>{editing ? "Editar meta" : "Nova meta"}</h2>
          <GoalForm goal={editing} onCancel={close} onSave={(goal) => {
            goals.save(goal); close();
          }} />
        </GlassCard>}
        <section className="goal-list">
          {goals.items.map((goal) => <GoalCard key={goal.id} goal={goal}
            onEdit={(item) => { setEditing(item); setFormOpen(true); }}
            onDelete={(item) => {
              if (window.confirm(`Excluir a meta “${item.title}”?`)) {
                goals.remove(item.id);
              }
            }}
            onComplete={goals.complete} onAddStep={goals.addStep}
            onToggleStep={goals.toggleStep} onRemoveStep={goals.removeStep} />)}
        </section>
        {!goals.items.length && <GlassCard className="goal-empty" hover={false}>
          <span>🌱</span><h2>Uma meta pode começar pequena</h2>
          <p>Crie seu primeiro objetivo ou ajuste os filtros.</p>
        </GlassCard>}
      </Container>
    </>
  );
}
