import "./Achievements.css";

import { useEffect, useMemo, useState } from "react";

import {
  processAchievements,
  setAchievementPreferences,
} from "../../core/services/achievements";
import { subscribe } from "../../core/sync/EventBus";
import { SYNC_EVENT } from "../../core/sync/emitSync";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

export default function Achievements() {
  const [data, setData] = useState(() => processAchievements().data);
  useEffect(() => subscribe(SYNC_EVENT, () => setData(processAchievements().data)), []);
  const categories = useMemo(() => Object.groupBy
    ? Object.groupBy(data.items, (item) => item.category)
    : data.items.reduce((groups, item) => {
      (groups[item.category] ??= []).push(item); return groups;
    }, {}), [data.items]);
  const unlocked = data.items.filter((item) => item.unlocked).length;

  const updatePreferences = (changes) => setData(setAchievementPreferences({
    notificationsEnabled: data.notificationsEnabled,
    celebrationsEnabled: data.celebrationsEnabled,
    ...changes,
  }));

  return (
    <>
      <Navbar />
      <Container>
        <PageHeader title="Conquistas" subtitle="Marcos de cuidado, descoberta e constância no seu ritmo." />
        <main className="achievements-page">
          <GlassCard className="achievements-summary">
            <strong>{unlocked} de {data.items.length}</strong>
            <span>conquistas guardadas</span>
            <div className="achievements-progress" role="progressbar"
              aria-valuenow={unlocked} aria-valuemin="0" aria-valuemax={data.items.length}>
              <i style={{ width: `${(unlocked / data.items.length) * 100}%` }} />
            </div>
            <label><input type="checkbox" checked={data.notificationsEnabled}
              onChange={(event) => updatePreferences({ notificationsEnabled: event.target.checked })} />
              Avisar quando uma conquista for desbloqueada</label>
            <label><input type="checkbox" checked={data.celebrationsEnabled}
              onChange={(event) => updatePreferences({ celebrationsEnabled: event.target.checked })} />
              Mostrar celebrações discretas</label>
          </GlassCard>
          {Object.entries(categories).map(([category, items]) => <section key={category}>
            <h2>{category.replace("_", " ")}</h2>
            <div className="achievements-grid">
              {items.map((item) => <GlassCard key={item.id}
                className={`achievement-card ${item.unlocked ? "is-unlocked" : "is-locked"}`}>
                <span className="achievement-card__icon" aria-hidden="true">
                  {item.unlocked || !item.secret ? item.icon : "❔"}
                </span>
                <h3>{item.unlocked || !item.secret ? item.title : "Conquista secreta"}</h3>
                <p>{item.unlocked || !item.secret
                  ? item.description : "Continue explorando com tranquilidade."}</p>
                <progress value={item.progress} max="100"
                  aria-label={`Progresso de ${item.title}: ${item.progress}%`} />
                <small>{item.unlocked ? "Guardada" : `${item.progress}% do caminho`}</small>
              </GlassCard>)}
            </div>
          </section>)}
        </main>
      </Container>
    </>
  );
}
