import { useState } from "react";
import { getMonthlyRitualPhase, saveMonthlyRitual } from "../../core/memory/MonthlyRitualService.js";
import { loadPersonalization } from "../../core/atmosphere/PersonalizationService.js";
import GlassCard from "../ui/GlassCard.jsx";

export default function MonthlyRitual() {
  const [phase] = useState(getMonthlyRitualPhase); const [enabled] = useState(() => loadPersonalization().monthlyRituals);
  const [text, setText] = useState(""); const [carry, setCarry] = useState(""); const [release, setRelease] = useState(""); const [done, setDone] = useState(false);
  if (!enabled || !phase || done) return null;
  const opening = phase === "opening";
  return <GlassCard className="monthly-ritual" hover={false}>
    <span>{opening ? "Começo do mês" : "Fechamento do mês"}</span>
    <h2>{opening ? "Tem alguma intenção leve para acompanhar este mês?" : "O que você quer levar e o que pode deixar passar?"}</h2>
    {opening ? <textarea aria-label="Intenção opcional" value={text} onChange={(event) => setText(event.target.value)} maxLength={500} /> : <>
      <textarea aria-label="Algo que quer levar" placeholder="Algo que quero levar comigo" value={carry} onChange={(event) => setCarry(event.target.value)} maxLength={300} />
      <textarea aria-label="Algo que pode deixar passar" placeholder="Algo que posso deixar passar" value={release} onChange={(event) => setRelease(event.target.value)} maxLength={300} />
    </>}
    <div><button type="button" onClick={() => { setText(""); setCarry(""); setRelease(""); setDone(true); }}>Só pensar nisso</button>
      <button type="button" onClick={() => { saveMonthlyRitual({ phase, text, carry, release }); setDone(true); }}>Guardar para mim</button></div>
  </GlassCard>;
}
