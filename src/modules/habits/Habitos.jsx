import "./Habitos.css";

import { useState } from "react";
import { FaHeart, FaLeaf } from "react-icons/fa";

import { getDailyCare } from "../../core/emotional/DailyEmotionalService";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import PrivacyNotice from "../../shared/componentes/PrivacyNotice";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import useHabits from "./hooks/useHabits";
import { localDateKey } from "./utils/habitDates";

export default function Habitos() {
  const habits = useHabits();
  const [dailyCare] = useState(getDailyCare);
  const [customCare, setCustomCare] = useState("");
  const [message, setMessage] = useState("");
  const today = localDateKey();

  function saveCare(name) {
    const trimmed = String(name).trim();
    if (!trimmed) return null;
    const existing = habits.allItems.find((item) => item.name === trimmed);
    if (existing) return existing;
    return habits.save({
      name: trimmed.slice(0, 180), description: "", icon: "🌿",
      frequency: "daily", weekdays: [], target: 1, archived: false,
    });
  }

  function markDailyCare() {
    const care = saveCare(dailyCare.text);
    if (care && !care.completions.includes(today)) habits.toggle(care.id, today);
    setMessage("Que bom que esse pequeno cuidado coube no seu dia.");
  }

  function addCustomCare(event) {
    event.preventDefault();
    if (!customCare.trim()) return;
    saveCare(customCare);
    setCustomCare("");
    setMessage("Cuidado guardado. Use quando fizer sentido, sem obrigação.");
  }

  return <>
    <Navbar />
    <Container>
      <PageHeader greeting="🌿" title="Pequenos Cuidados"
        subtitle="Sugestões leves para cuidar de você, sem sequência e sem cobrança." />
      <PrivacyNotice compact />
      <div className="cares-page">
        <GlassCard className="daily-care" hover={false}>
          <span>Um pequeno cuidado para hoje</span>
          <h2>{dailyCare.text}</h2>
          <button type="button" onClick={markDailyCare}>
            <FaHeart aria-hidden="true" /> Fiz isso por mim hoje
          </button>
          {message && <p role="status">{message}</p>}
        </GlassCard>

        <form className="care-compose" onSubmit={addCustomCare}>
          <label htmlFor="custom-care">Tem algum cuidado simples que faz bem para você?</label>
          <div><input id="custom-care" maxLength="180" value={customCare}
            onChange={(event) => setCustomCare(event.target.value)}
            placeholder="Ex.: ouvir uma música com calma" />
            <button type="submit" disabled={!customCare.trim()}>Guardar</button></div>
        </form>

        <div className="care-filter" role="group" aria-label="Mostrar cuidados">
          <button type="button" aria-pressed={habits.filter === "active"}
            onClick={() => habits.setFilter("active")}>Para quando fizer sentido</button>
          <button type="button" aria-pressed={habits.filter === "archived"}
            onClick={() => habits.setFilter("archived")}>Guardados no histórico</button>
        </div>

        <section className="care-list" aria-label="Pequenos cuidados guardados">
          {habits.items.map((habit) => {
            const doneToday = habit.completions.includes(today);
            return <GlassCard key={habit.id} className="care-card" hover={false}>
              <div><span aria-hidden="true">{habit.icon || "🌿"}</span><h2>{habit.name}</h2></div>
              {habit.description && <p>{habit.description}</p>}
              {!habit.archived && <button type="button" className={doneToday ? "is-done" : ""}
                onClick={() => habits.toggle(habit.id, today)}>
                {doneToday ? "Desfazer marcação de hoje" : "Fiz isso por mim hoje"}
              </button>}
              <button type="button" className="care-archive"
                onClick={() => habits.archive(habit.id, !habit.archived)}>
                <FaLeaf aria-hidden="true" /> {habit.archived ? "Trazer de volta" : "Guardar no histórico"}
              </button>
            </GlassCard>;
          })}
        </section>
        {!habits.items.length && <p className="care-empty">
          {habits.filter === "active"
            ? "Nada para acompanhar. Escolha algo somente quando tiver vontade."
            : "Nenhum cuidado foi guardado no histórico."}
        </p>}
      </div>
    </Container>
  </>;
}
