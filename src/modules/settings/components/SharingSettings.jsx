import { useMemo, useState } from "react";
import {
  createEncryptedLocalCapsule, prepareShareSelection, sharePreview, shareUsingDevice,
} from "../../../core/sharing/ShareService";
import {
  cleanupExpiredCapsules, listCapsules, revokeCapsule,
} from "../../../core/sharing/CapsuleRepository";
import {
  loadSharePreferences, saveSharePreferences,
} from "../../../core/sharing/SharePreferencesService";

export default function SharingSettings() {
  const [preferences, setPreferences] = useState(loadSharePreferences);
  const [text, setText] = useState("");
  const [review, setReview] = useState(false);
  const [message, setMessage] = useState("");
  const [capsules, setCapsules] = useState(listCapsules);
  const selection = useMemo(() => prepareShareSelection({
    title: "Conteúdo selecionado do Abrigo", text, date: new Date().toLocaleDateString("pt-BR"),
  }, { hideDate: preferences.removeMetadata }), [preferences.removeMetadata, text]);
  const update = (changes) => {
    const next = saveSharePreferences(changes); setPreferences(next);
  };

  return <div className="sharing-settings">
    <p>O compartilhamento remoto está desativado. Você pode compartilhar localmente ou baixar uma cápsula criptografada.</p>
    <label className="config-switch"><span>Remover metadados por padrão</span>
      <input type="checkbox" checked={preferences.removeMetadata}
        onChange={(event) => update({ removeMetadata: event.target.checked })} /></label>
    <label>Validade padrão<select value={preferences.defaultExpiry}
      onChange={(event) => update({ defaultExpiry: event.target.value })}>
      <option value="hour">Uma hora</option><option value="day">Um dia</option>
      <option value="week">Sete dias</option><option value="month">Trinta dias</option>
    </select></label>
    <label htmlFor="share-text">Texto escolhido</label>
    <textarea id="share-text" rows="5" value={text}
      onChange={(event) => setText(event.target.value)} />
    <button className="config-button" disabled={!text.trim()} onClick={() => setReview(true)}>
      Revisar compartilhamento</button>
    {review && <div className="share-review" role="dialog" aria-modal="true">
      <h3>Prévia exata</h3><pre>{sharePreview(selection)}</pre>
      <div className="config-actions"><button className="config-button" onClick={() => setReview(false)}>Cancelar</button>
        <button className="config-button" onClick={async () => {
          try { await shareUsingDevice(selection, true); setMessage("Conteúdo compartilhado ou copiado."); }
          catch { setMessage("Não foi possível compartilhar neste dispositivo."); }
        }}>Compartilhar</button>
        <button className="config-button" onClick={async () => {
          try {
            await createEncryptedLocalCapsule(selection, preferences.defaultExpiry, false);
            setCapsules(listCapsules()); setMessage("Cápsula local protegida baixada.");
          } catch (error) { setMessage(error.message); }
        }}>Baixar cápsula criptografada</button></div>
    </div>}
    {message && <p role="status">{message}</p>}
    {capsules.length > 0 && <div><h3>Cápsulas locais</h3>{capsules.map((capsule) =>
      <div key={capsule.id}><small>{capsule.expiresAt
        ? `Expira em ${new Date(capsule.expiresAt).toLocaleString("pt-BR")}` : "Sem prazo"}</small>
        <button className="config-button" disabled={Boolean(capsule.revokedAt)}
          onClick={() => { revokeCapsule(capsule.id); setCapsules(listCapsules()); }}>Revogar</button></div>)}
      <button className="config-button" onClick={() => {
        const count = cleanupExpiredCapsules(); setCapsules(listCapsules());
        setMessage(`${count} cápsula(s) expirada(s) removida(s).`);
      }}>Limpar expiradas</button></div>}
  </div>;
}
