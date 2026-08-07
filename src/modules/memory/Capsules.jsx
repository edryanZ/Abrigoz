import "./Capsules.css";

import { useState } from "react";
import { FaLock, FaLockOpen, FaTrashAlt } from "react-icons/fa";
import {
  createFutureCapsule, deleteFutureCapsule, listFutureCapsules, resolveCapsuleDate,
} from "../../core/memory/FutureCapsuleService";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import PrivacyNotice from "../../shared/componentes/PrivacyNotice";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

export default function Capsules() {
  const [items, setItems] = useState(listFutureCapsules);
  const [message, setMessage] = useState("");
  const [preset, setPreset] = useState("1m");
  const [customDate, setCustomDate] = useState("");
  const [feedback, setFeedback] = useState("");

  function seal() {
    try {
      const openOn = preset === "custom" ? customDate : resolveCapsuleDate(preset);
      createFutureCapsule({ message, openOn });
      setMessage(""); setCustomDate(""); setItems(listFutureCapsules());
      setFeedback("Sua mensagem ficou selada até a data escolhida.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível selar a cápsula.");
    }
  }

  function remove(item) {
    const label = item.sealed ? "Cancelar esta cápsula antes da abertura?" : "Excluir esta cápsula?";
    if (!window.confirm(label)) return;
    deleteFutureCapsule(item.id); setItems(listFutureCapsules());
  }

  return <><Navbar /><Container><div className="capsules-page">
    <PageHeader title="Cápsulas para o futuro" subtitle="Uma mensagem para você reencontrar mais adiante, sem contagem ou cobrança." />
    <PrivacyNotice compact />
    <GlassCard className="capsule-compose" hover={false}>
      <h2>Escrever para depois</h2>
      <label htmlFor="capsule-message">Sua mensagem</label>
      <textarea id="capsule-message" rows="5" maxLength="2400" value={message}
        onChange={(event) => { setMessage(event.target.value); setFeedback(""); }}
        placeholder="Algo que você gostaria de encontrar no futuro." />
      <label htmlFor="capsule-date-choice">Quando abrir</label>
      <select id="capsule-date-choice" value={preset} onChange={(event) => setPreset(event.target.value)}>
        <option value="1m">Daqui a 1 mês</option><option value="3m">Daqui a 3 meses</option>
        <option value="1y">Daqui a 1 ano</option><option value="custom">Escolher uma data</option>
      </select>
      {preset === "custom" && <label>Data de abertura<input type="date" value={customDate}
        onChange={(event) => setCustomDate(event.target.value)} /></label>}
      <button type="button" onClick={seal} disabled={!message.trim()}>Selar cápsula</button>
      {feedback && <p className="capsule-feedback" role="status">{feedback}</p>}
    </GlassCard>
    <section className="capsule-list" aria-label="Suas cápsulas">
      {items.map((item) => <GlassCard className={`capsule-card ${item.sealed ? "is-sealed" : "is-open"}`}
        key={item.id} hover={false}>
        <span>{item.sealed ? <FaLock aria-hidden="true" /> : <FaLockOpen aria-hidden="true" />}
          {item.sealed ? "Cápsula selada" : "Chegou a hora"}</span>
        <h2>{item.sealed ? `Guardada até ${item.openOn}` : "Uma mensagem chegou até você"}</h2>
        {!item.sealed && <p className="capsule-message">{item.message}</p>}
        <button type="button" className="capsule-remove" onClick={() => remove(item)}>
          <FaTrashAlt aria-hidden="true" /> {item.sealed ? "Cancelar cápsula" : "Excluir"}
        </button>
      </GlassCard>)}
      {!items.length && <p className="capsule-empty">Nenhuma cápsula por aqui. Não precisa ter.</p>}
    </section>
  </div></Container></>;
}
