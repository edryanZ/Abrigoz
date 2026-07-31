import "./Assistant.css";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../shared/componentes/Navbar";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";
import PageHeader from "../../shared/componentes/PageHeader";
import { useTheme } from "../../shared/contexts/ThemeContext";
import { AIService } from "../../core/ai/AIService";
import { buildAIContext, contextPreview } from "../../core/ai/AIContextBuilder";
import { loadAIPreferences } from "../../core/ai/AIPreferencesService";
import {
  deleteAIConversation, loadAIHistory,
} from "../../core/ai/AIHistoryRepository";

export default function Assistant() {
  const { greeting } = useTheme();
  const [preferences] = useState(loadAIPreferences);
  const [instruction, setInstruction] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [includeText, setIncludeText] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [response, setResponse] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState(() =>
    loadAIHistory(loadAIPreferences().saveHistory));
  const context = useMemo(() => buildAIContext({
    instruction,
    autoRedact: preferences.autoRedact,
    selections: [{ label: "Texto escolhido pelo usuário", content: selectedText, selected: includeText }],
  }), [includeText, instruction, preferences.autoRedact, selectedText]);

  useEffect(() => () => AIService.cancel(), []);
  const local = (kind) => {
    setResponse(AIService.localSuggestion(kind));
    setMessage("Sugestão criada no dispositivo, sem envio externo.");
  };
  const send = async () => {
    setBusy(true); setMessage("");
    try {
      setResponse(await AIService.request({ ...context, confirmed: true }));
      setHistory(loadAIHistory(preferences.saveHistory));
      setReviewing(false);
    } catch (error) {
      setMessage(error.message);
    } finally { setBusy(false); }
  };

  return <><Navbar /><Container><main className="assistant-page">
    <PageHeader greeting={greeting} title="Assistente do Abrigo"
      subtitle="Ajuda opcional, somente com o contexto que você escolher." />
    <GlassCard className="assistant-card">
      <p className="assistant-note">Esta é uma sugestão opcional baseada somente nas informações que você escolheu compartilhar.</p>
      <div className="assistant-local"><button onClick={() => local("day")}>Organizar meu dia</button>
        <button onClick={() => local("goal")}>Dividir uma meta</button>
        <button onClick={() => local("diary")}>Pergunta para o Diário</button>
        <button onClick={() => local("routine")}>Sugerir rotina</button></div>
      <label htmlFor="assistant-request">O que você deseja organizar?</label>
      <textarea id="assistant-request" value={instruction}
        onChange={(event) => setInstruction(event.target.value)} rows="4" />
      <label className="assistant-check"><input type="checkbox" checked={includeText}
        onChange={(event) => setIncludeText(event.target.checked)} />
        Incluir um texto escolhido por mim</label>
      {includeText && <><label htmlFor="assistant-context">Texto selecionado</label>
        <textarea id="assistant-context" value={selectedText}
          onChange={(event) => setSelectedText(event.target.value)} rows="6" /></>}
      <button disabled={!preferences.assistantEnabled || !instruction.trim()}
        onClick={() => setReviewing(true)}>Revisar antes de enviar</button>
      {!preferences.assistantEnabled && <p>O Assistente externo está desativado. As sugestões locais continuam disponíveis.</p>}
      {message && <p role="status">{message}</p>}
      {response && <section className="assistant-response"><h2>Sugestão</h2><p>{response}</p></section>}
      {preferences.saveHistory && history.length > 0 && <section className="assistant-history">
        <h2>Histórico salvo</h2>{history.map((item) => <article key={item.id}>
          <p><strong>{item.request}</strong></p><p>{item.response}</p>
          <button onClick={() => setHistory(deleteAIConversation(item.id))}>
            Excluir conversa</button></article>)}</section>}
    </GlassCard>
    {reviewing && <div className="assistant-modal" role="dialog" aria-modal="true"
      aria-labelledby="assistant-review-title"><div>
        <h2 id="assistant-review-title">Revise o conteúdo exato</h2>
        <p><strong>Serviço:</strong> endpoint protegido do Assistente</p>
        <p><strong>Finalidade:</strong> responder ao pedido informado</p>
        <textarea value={contextPreview(context)} readOnly rows="12" aria-label="Conteúdo que será enviado" />
        <p>A ocultação automática pode não identificar todos os dados sensíveis.</p>
        <div><button onClick={() => setReviewing(false)}>Cancelar</button>
          <button disabled={busy} onClick={send}>{busy ? "Enviando…" : "Confirmar envio"}</button></div>
      </div></div>}
  </main></Container></>;
}
