import "./Metas.css";

import { useMemo, useState } from "react";
import { FaLeaf, FaSearch } from "react-icons/fa";

import { getSuggestedIntentions } from "../../core/emotional/DailyEmotionalService";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import PrivacyNotice from "../../shared/componentes/PrivacyNotice";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import useGoals from "./hooks/useGoals";

export default function Metas() {
  const goals = useGoals();
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const suggestions = useMemo(() => getSuggestedIntentions(), []);
  const items = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-BR");
    return goals.allItems.filter((item) => !normalized
      || `${item.title} ${item.description ?? ""}`.toLocaleLowerCase("pt-BR").includes(normalized));
  }, [goals.allItems, query]);

  function saveIntention(value = text) {
    const title = String(value).trim();
    if (!title) {
      setMessage("Escreva uma intenção curta, se quiser guardar uma.");
      return;
    }
    try {
      goals.save({
        title: title.slice(0, 180), description: "", category: "Intenção",
        dueDate: "", priority: "medium", progress: 0, status: "not_started", notes: "",
      });
      setText("");
      setMessage("Sua intenção ficou guardada aqui.");
    } catch {
      setMessage("Não foi possível guardar essa intenção agora.");
    }
  }

  return <>
    <Navbar />
    <Container>
      <PageHeader greeting="🌿" title="Intenções"
        subtitle="Coisas que você gostaria de levar consigo, sem prazo e sem cobrança." />
      <PrivacyNotice compact />
      <div className="intentions-page">
        <GlassCard className="intention-compose" hover={false}>
          <h2>O que você gostaria de cultivar?</h2>
          <p>Pode ser uma frase simples. Não precisa virar meta nem compromisso.</p>
          <label htmlFor="intention-text">Minha intenção</label>
          <textarea id="intention-text" rows="3" maxLength="180" value={text}
            placeholder="Quero respeitar mais o meu próprio ritmo."
            onChange={(event) => { setText(event.target.value); setMessage(""); }} />
          <button type="button" onClick={() => saveIntention()}>Guardar intenção</button>
          {message && <p role="status" className="intention-message">{message}</p>}
        </GlassCard>

        <section className="intention-suggestions" aria-labelledby="intention-suggestions-title">
          <h2 id="intention-suggestions-title">Se quiser, escolha uma destas</h2>
          <div>{suggestions.map((suggestion) => <button type="button" key={suggestion}
            onClick={() => saveIntention(suggestion)}><FaLeaf aria-hidden="true" />{suggestion}</button>)}</div>
        </section>

        <label className="intention-search"><span>Reencontrar uma intenção</span>
          <div><FaSearch aria-hidden="true" /><input type="search" value={query}
            onChange={(event) => setQuery(event.target.value)} placeholder="Buscar pelo texto" /></div>
        </label>

        <section className="intention-list" aria-label="Intenções guardadas">
          {items.map((item) => {
            const ended = item.status === "completed";
            return <GlassCard key={item.id} className={`intention-card ${ended ? "is-ended" : ""}`}
              hover={false}>
              <span>{ended ? "Intenção encerrada" : "Intenção guardada"}</span>
              <h2>{item.title}</h2>
              {item.description && <p>{item.description}</p>}
              {!ended && <button type="button" onClick={() => goals.complete(item.id, true)}>
                Encerrar por agora
              </button>}
            </GlassCard>;
          })}
        </section>
        {!items.length && <p className="intention-empty">
          {query ? "Nenhuma intenção apareceu com essas palavras." : "Você não precisa guardar nenhuma intenção agora."}
        </p>}
        {goals.allItems.some((item) => item.category !== "Intenção") && <p className="legacy-note">
          Suas metas antigas continuam preservadas. Aqui elas aparecem apenas como registros, sem prazos ou porcentagens.
        </p>}
      </div>
    </Container>
  </>;
}
