import { useState } from "react";
import { Link } from "react-router-dom";

import {
  getPreviousSuggestionSet,
  respondToSuggestion,
  selectCompanionSuggestions,
} from "../../../core/companion/CompanionService";
import { saveCompanionSuggestion } from "../../../core/companion/CompanionFavoriteService";
import GlassCard from "../../../shared/ui/GlassCard";

const FILTERS = [
  ["2 min", { minutes: 2 }], ["5 min", { minutes: 5 }],
  ["10 min", { minutes: 10 }], ["15 min", { minutes: 15 }],
  ["Descansar", { category: "rest" }], ["Movimentar", { category: "movement" }],
  ["Distrair", { category: "distraction" }], ["Organizar", { category: "organization" }],
  ["Criar", { category: "creativity" }], ["Ouvir", { category: "music" }],
  ["Ao ar livre", { category: "outdoors" }],
];

export default function CompanionCard() {
  const [options, setOptions] = useState({});
  const [state, setState] = useState(() => selectCompanionSuggestions());
  const [expanded, setExpanded] = useState(false);
  if (!state.enabled) return null;

  const refresh = (next = options) => {
    setOptions(next);
    setState(selectCompanionSuggestions(next));
  };
  const act = (suggestion, action) => {
    respondToSuggestion(suggestion.id, action, suggestion.categories);
    if (["later", "never", "not_helped"].includes(action)) refresh();
  };

  return (
    <GlassCard className="companion-card">
      <div className="companion-card__heading">
        <div><p className="dashboard-card__eyebrow">Companheiro do Dia</p>
          <h2>Sugestões para este momento</h2>
          <p>Opções locais e sem cobrança. Escolha somente se fizer sentido.</p></div>
        <button type="button" onClick={() => refresh({ surprise: Date.now() })}>
          Surpreenda-me
        </button>
      </div>
      <div className="companion-filters" aria-label="Filtros rápidos">
        {FILTERS.map(([label, filter]) => <button type="button" key={label}
          aria-pressed={Object.entries(filter).every(([key, value]) => options[key] === value)}
          onClick={() => refresh(filter)}>{label}</button>)}
        <button type="button" onClick={() => refresh({})}>Limpar filtros</button>
      </div>
      <div className={`companion-list ${expanded ? "is-expanded" : ""}`}>
        {state.suggestions.map((suggestion) => <article key={suggestion.id}
          className="companion-suggestion">
          <div><span>{suggestion.minutes} min</span><span>{suggestion.categories[0]}</span></div>
          <h3>{suggestion.title}</h3>
          <p>{suggestion.description}</p>
          <small>{suggestion.reason}</small>
          <div className="companion-suggestion__actions">
            <Link to={suggestion.route}>Começar atividade</Link>
            <button type="button" onClick={() => act(suggestion, "liked")}>Gostei</button>
            <button type="button" onClick={() => act(suggestion, "helped")}>Isso ajudou</button>
            <button type="button" onClick={() => act(suggestion, "not_helped")}>Não ajudou</button>
            <button type="button" onClick={() => act(suggestion, "later")}>Não agora</button>
            <button type="button" onClick={() => act(suggestion, "more")}>Mais deste tipo</button>
            <button type="button" onClick={() => act(suggestion, "less")}>Menos deste tipo</button>
            <button type="button" onClick={() => saveCompanionSuggestion(suggestion)}>
              Salvar nos Favoritos
            </button>
            <button type="button" onClick={() => act(suggestion, "never")}>
              Não recomendar novamente
            </button>
          </div>
        </article>)}
      </div>
      <div className="companion-card__footer">
        <button type="button" className="companion-mobile-more"
          onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Mostrar menos" : "Ver todas as sugestões"}
        </button>
        <button type="button" onClick={() => {
          const previous = getPreviousSuggestionSet();
          if (previous.length) setState((current) => ({ ...current, suggestions: previous }));
        }}>Voltar às sugestões anteriores</button>
        <button type="button" onClick={() => refresh()}>Ver outras sugestões</button>
      </div>
    </GlassCard>
  );
}
