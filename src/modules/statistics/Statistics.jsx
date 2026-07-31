import "./Statistics.css";

import { useEffect, useMemo, useState } from "react";

import { readLocalData } from "../../core/intelligence/LocalDataSource";
import { buildMomentMap, calculateStatistics } from "../../core/intelligence/StatisticsEngine";
import { resolvePeriod } from "../../core/intelligence/localDates";
import { subscribe } from "../../core/sync/EventBus";
import { SYNC_EVENT } from "../../core/sync/emitSync";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import ActivityMap from "./components/ActivityMap";

const PERIODS = {
  today: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  month: "Mês atual",
  year: "Ano atual",
  all: "Todo o período",
};

export default function Statistics() {
  const [periodKind, setPeriodKind] = useState("30d");
  const [data, setData] = useState(readLocalData);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mapModule, setMapModule] = useState("all");
  const [custom, setCustom] = useState({ start: "", end: "" });

  useEffect(() => subscribe(SYNC_EVENT, () => setData(readLocalData())), []);
  const period = useMemo(() => resolvePeriod(periodKind, new Date(), custom), [custom, periodKind]);
  const stats = useMemo(() => calculateStatistics(data, period), [data, period]);
  const moments = useMemo(() => buildMomentMap(data, year, mapModule), [data, year, mapModule]);

  return (
    <>
      <Navbar />
      <Container>
        <PageHeader title="Estatísticas" subtitle="Um olhar gentil para a sua própria jornada." />
        <main className="statistics-page">
          <label className="statistics-period">
            Período
            <select value={periodKind} onChange={(event) => setPeriodKind(event.target.value)}>
              {Object.entries(PERIODS).map(([value, label]) =>
                <option key={value} value={value}>{label}</option>)}
              <option value="custom">Intervalo personalizado</option>
            </select>
          </label>
          {periodKind === "custom" && <div className="statistics-custom">
            <label>Início<input type="date" value={custom.start}
              onChange={(event) => setCustom((value) => ({ ...value, start: event.target.value }))} /></label>
            <label>Fim<input type="date" value={custom.end}
              onChange={(event) => setCustom((value) => ({ ...value, end: event.target.value }))} /></label>
          </div>}

          <section className="statistics-grid" aria-label="Resumo do período">
            <GlassCard><span>Dias ativos</span><strong>{stats.general.activeDays}</strong>
              <small>Dias com alguma atividade registrada.</small></GlassCard>
            <GlassCard><span>Hábitos</span><strong>{stats.habits.rate}%</strong>
              <small>{stats.habits.completed} de {stats.habits.planned} previstos.</small></GlassCard>
            <GlassCard><span>Metas</span><strong>{stats.goals.averageProgress}%</strong>
              <small>Média simples do progresso das metas.</small></GlassCard>
            <GlassCard><span>Calendário</span><strong>{stats.calendar.total}</strong>
              <small>Eventos iniciados no período escolhido.</small></GlassCard>
            <GlassCard><span>Diário</span><strong>{stats.diary.days}</strong>
              <small>Dias diferentes com registros.</small></GlassCard>
            <GlassCard><span>Favoritos</span><strong>{stats.favorites.added}</strong>
              <small>Itens guardados neste período.</small></GlassCard>
          </section>

          <GlassCard className="statistics-comparison">
            <h2>Comparação com seu período anterior</h2>
            {stats.general.comparison === null
              ? <p>Quando houver pelo menos três dias ativos em cada período, mostramos uma comparação cuidadosa.</p>
              : <p>Foram {Math.abs(stats.general.comparison)} dia(s) ativo(s) {
                stats.general.comparison >= 0 ? "a mais" : "a menos"} que no período anterior. Descanso também faz parte.</p>}
          </GlassCard>

          <GlassCard className="statistics-bars">
            <h2>Regularidade por dia da semana</h2>
            {stats.habits.planned ? stats.habits.regularDays.map((item, index) =>
              <div key={item.day}>
                <span>{["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][index]}</span>
                <div><i style={{ width: `${item.rate}%` }} /></div><strong>{item.rate}%</strong>
              </div>) : <p>Ainda não há hábitos previstos neste período.</p>}
            <p className="sr-only">As barras mostram a porcentagem de hábitos previstos que foram concluídos em cada dia da semana.</p>
          </GlassCard>

          <ActivityMap moments={moments} year={year} setYear={setYear}
            module={mapModule} setModule={setMapModule} />
        </main>
      </Container>
    </>
  );
}
