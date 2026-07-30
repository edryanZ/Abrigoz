import { useState } from "react";
import { Link } from "react-router-dom";

import {
  getCompanionSuggestion,
  respondToSuggestion,
} from "../../../core/companion/CompanionService";
import GlassCard from "../../../shared/ui/GlassCard";

export default function CompanionCard() {
  const [state, setState] = useState(getCompanionSuggestion);
  if (!state.enabled) return null;
  const suggestion = state.suggestion;
  return (
    <GlassCard className="companion-card">
      <p className="dashboard-card__eyebrow">Para você hoje</p>
      <h2>{suggestion.title}</h2>
      <p>{suggestion.reason}</p>
      <small>É apenas uma sugestão opcional e pode não combinar com este momento.</small>
      <div className="companion-card__actions">
        <Link to={suggestion.route}>Começar</Link>
        <button type="button" onClick={() =>
          setState(respondToSuggestion(suggestion.id, "later"))}>Não agora</button>
        <button type="button" onClick={() =>
          setState(respondToSuggestion(suggestion.id, "never"))}>Não recomendar novamente</button>
      </div>
    </GlassCard>
  );
}
