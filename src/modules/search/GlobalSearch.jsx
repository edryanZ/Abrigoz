import "./GlobalSearch.css";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  clearSearchHistory,
  createSearchIndex,
  loadSearchPreferences,
  rememberSearch,
  saveSearchPreferences,
  searchLocal,
} from "../../core/search/SearchService";
import { subscribe } from "../../core/sync/EventBus";
import { SYNC_EVENT } from "../../core/sync/emitSync";
import { isPrivacyModeEnabled } from "../../core/privacy/PrivacyService";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

const LABELS = {
  diary: "Reflexões", calendar: "Meu Dia", favorites: "Coisas que fazem bem",
  goals: "Intenções", habits: "Pequenos Cuidados", achievements: "Marcos", letters: "Cartas",
};

function Highlight({ text, query, hidden }) {
  if (hidden) return "Conteúdo oculto";
  const normalized = query.trim();
  if (!normalized) return text;
  const index = text.toLocaleLowerCase("pt-BR").indexOf(normalized.toLocaleLowerCase("pt-BR"));
  if (index < 0) return text;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + normalized.length)}</mark>{
    text.slice(index + normalized.length)}</>;
}

export default function GlobalSearch() {
  const [index, setIndex] = useState(createSearchIndex);
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("all");
  const [order, setOrder] = useState("relevance");
  const [filters, setFilters] = useState({
    start: "", end: "", category: "", tag: "", status: "",
  });
  const [result, setResult] = useState({ total: 0, groups: {} });
  const [preferences, setPreferences] = useState(loadSearchPreferences);
  const [privacy] = useState(isPrivacyModeEnabled);

  useEffect(() => subscribe(SYNC_EVENT, () => setIndex(createSearchIndex())), []);
  useEffect(() => {
    let current = true;
    const timer = window.setTimeout(() => {
      if (!current) return;
      const next = searchLocal(index, query, { module, order, ...filters });
      setResult(next);
      if (next.total) setPreferences(rememberSearch(query));
    }, 250);
    return () => { current = false; window.clearTimeout(timer); };
  }, [filters, index, module, order, query]);
  const updateFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value }));

  const groups = useMemo(() => Object.entries(result.groups), [result.groups]);
  const toggleHistory = () => {
    const next = saveSearchPreferences({
      ...preferences, historyEnabled: !preferences.historyEnabled,
      recent: !preferences.historyEnabled ? preferences.recent : [],
    });
    setPreferences(next);
  };

  return (
    <>
      <Navbar />
      <Container>
        <PageHeader title="Pesquisa" subtitle="Reencontre, com calma, o que você guardou neste dispositivo." />
        <div className="global-search">
          <GlassCard className="global-search__controls">
            <label>Pesquisar
              <input type="search" value={query} autoComplete="off"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Digite pelo menos duas letras" />
            </label>
            <div className="global-search__filters">
              <label>Módulo<select value={module} onChange={(event) => setModule(event.target.value)}>
                <option value="all">Todos</option>
                {Object.entries(LABELS).map(([value, label]) =>
                  <option value={value} key={value}>{label}</option>)}
              </select></label>
              <label>Ordem<select value={order} onChange={(event) => setOrder(event.target.value)}>
                <option value="relevance">Relevância</option><option value="date">Data</option>
              </select></label>
              <label>Data inicial<input type="date" value={filters.start}
                onChange={(event) => updateFilter("start", event.target.value)} /></label>
              <label>Data final<input type="date" value={filters.end}
                onChange={(event) => updateFilter("end", event.target.value)} /></label>
              <label>Categoria<input value={filters.category} maxLength={80}
                onChange={(event) => updateFilter("category", event.target.value)} /></label>
              <label>Tag<input value={filters.tag} maxLength={40}
                onChange={(event) => updateFilter("tag", event.target.value)} /></label>
              <label>Status<input value={filters.status} maxLength={40}
                onChange={(event) => updateFilter("status", event.target.value)} /></label>
            </div>
            <label className="global-search__check">
              <input type="checkbox" checked={preferences.historyEnabled} onChange={toggleHistory} />
              Guardar pesquisas recentes somente neste dispositivo
            </label>
            {preferences.historyEnabled && preferences.recent.length > 0 && <div>
              <p>Recentes:</p>
              {preferences.recent.map((item) =>
                <button type="button" key={item} onClick={() => setQuery(item)}>{item}</button>)}
              <button type="button" onClick={() => setPreferences(clearSearchHistory())}>Limpar</button>
            </div>}
          </GlassCard>
          {query.trim().length < 2
            ? <p className="global-search__empty">Digite algo que queira reencontrar.</p>
            : result.total === 0
              ? <p className="global-search__empty">Nada apareceu por aqui. Tente outras palavras.</p>
              : <>
                <p aria-live="polite">{result.total} resultado(s).</p>
                {groups.map(([group, items]) => <section key={group}>
                  <h2>{LABELS[group] ?? group}</h2>
                  <div className="global-search__results">
                    {items.slice(0, result.limit).map((item) =>
                      <Link to={item.route} key={item.id}>
                        <strong><Highlight text={item.title} query={query} hidden={privacy} /></strong>
                        <p><Highlight text={item.body.slice(0, 180)} query={query} hidden={privacy} /></p>
                        {item.date && <small>{item.date.slice(0, 10)}</small>}
                      </Link>)}
                  </div>
                </section>)}
              </>}
        </div>
      </Container>
    </>
  );
}
