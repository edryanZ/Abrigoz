import "./OfflineStatus.css";
import { useEffect, useState } from "react";
import { applyPWAUpdate } from "../../core/offline/PWAUpdateService";

export default function OfflineStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [update, setUpdate] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  useEffect(() => {
    const connected = () => setOnline(true);
    const disconnected = () => setOnline(false);
    const available = () => setUpdate(true);
    window.addEventListener("online", connected);
    window.addEventListener("offline", disconnected);
    window.addEventListener("abrigo:pwa-update", available);
    return () => {
      window.removeEventListener("online", connected);
      window.removeEventListener("offline", disconnected);
      window.removeEventListener("abrigo:pwa-update", available);
    };
  }, []);
  const installUpdate = async () => {
    setUpdating(true);
    setUpdateError(false);
    const applied = await applyPWAUpdate();
    if (!applied) {
      setUpdating(false);
      setUpdateError(true);
    }
  };
  return <div className="offline-status" aria-live="polite">
    {!online && <div>Você está offline. Seus recursos e alterações locais continuam disponíveis.</div>}
    {update && <div>Uma nova versão do Abrigo está disponível. Seus dados locais serão preservados durante a atualização.
      <span><button onClick={() => setUpdate(false)}>Atualizar depois</button>
        <button disabled={updating} onClick={installUpdate}>
          {updating ? "Atualizando..." : "Atualizar agora"}</button></span></div>}
    {updateError && <div role="alert">Não foi possível atualizar agora. Você pode continuar usando
      o Abrigo e tentar novamente mais tarde.</div>}
  </div>;
}
