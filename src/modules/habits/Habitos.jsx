import "./Habitos.css";

import { useState } from "react";
import { FaPlus } from "react-icons/fa";

import Ceu from "../../shared/componentes/Ceu";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import { useTheme } from "../../shared/contexts/ThemeContext";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import HabitCard from "./components/HabitCard";
import HabitForm from "./components/HabitForm";
import useHabits from "./hooks/useHabits";

export default function Habitos() {
  const { greeting } = useTheme();
  const habits = useHabits();
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const close = () => { setEditing(null); setFormOpen(false); };

  return (
    <>
      <Ceu /><Navbar />
      <Container>
        <PageHeader greeting={`${greeting} 🌿`} title="Hábitos"
          subtitle="Cuide da sua rotina com constância e gentileza." />
        <GlassCard className="habit-toolbar" hover={false}>
          <div role="group" aria-label="Filtrar hábitos">
            <button type="button" className={habits.filter === "active" ? "active" : ""}
              onClick={() => habits.setFilter("active")}>Ativos</button>
            <button type="button" className={habits.filter === "archived" ? "active" : ""}
              onClick={() => habits.setFilter("archived")}>Arquivados</button>
          </div>
          <button type="button" onClick={() => setFormOpen(true)}>
            <FaPlus /> Novo hábito
          </button>
        </GlassCard>
        {formOpen && <GlassCard className="habit-editor" hover={false}>
          <h2>{editing ? "Editar hábito" : "Novo hábito"}</h2>
          <HabitForm habit={editing} onCancel={close} onSave={(habit) => {
            habits.save(habit); close();
          }} />
        </GlassCard>}
        <section className="habit-list">
          {habits.items.map((habit) => <HabitCard key={habit.id} habit={habit}
            onToggle={habits.toggle}
            onEdit={(item) => { setEditing(item); setFormOpen(true); }}
            onArchive={habits.archive}
            onDelete={(item) => {
              if (window.confirm(
                `Excluir “${item.name}” e todo o histórico desse hábito?`
              )) habits.remove(item.id);
            }} />)}
        </section>
        {!habits.items.length && <GlassCard className="habit-empty" hover={false}>
          <span>🌱</span><h2>Rotinas novas começam devagar</h2>
          <p>{habits.filter === "active"
            ? "Crie um hábito simples para começar."
            : "Nenhum hábito arquivado."}</p>
        </GlassCard>}
      </Container>
    </>
  );
}
