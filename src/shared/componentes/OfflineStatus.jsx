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
    {!online && <div>Essa parte precisa de conexão quando usar recursos online. O restante do seu Abrigo continua aqui.</div>}
    {update && <div>Há uma pequena atualização pronta para o Abrigo. Seus dados locais serão preservados.
      <span><button onClick={() => setUpdate(false)}>Atualizar depois</button>
        <button disabled={updating} onClick={installUpdate}>
          {updating ? "Preparando…" : "Atualizar agora"}</button></span></div>}
    {updateError && <div role="alert">Não foi possível atualizar agora. Você pode continuar usando
      o Abrigo e tentar novamente mais tarde.</div>}
  </div>;
}
