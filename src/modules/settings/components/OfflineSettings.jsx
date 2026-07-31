import { useEffect, useState } from "react";
import {
  clearPublicAssetCaches, clearRebuildableData, getStorageSummary,
} from "../../../core/offline/StorageManagerService";

const size = (bytes) => bytes == null ? "Não informado"
  : `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export default function OfflineSettings() {
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");
  const refresh = () => getStorageSummary().then(setSummary)
    .catch(() => setMessage("Não foi possível estimar o armazenamento."));
  useEffect(refresh, []);
  return <div className="offline-settings">
    <p>O Abrigo mantém os módulos pessoais no dispositivo. As limpezas abaixo não removem seus registros.</p>
    {summary && <dl><div><dt>Uso aproximado</dt><dd>{size(summary.usage)}</dd></div>
      <div><dt>Limite estimado</dt><dd>{size(summary.quota)}</dd></div>
      <div><dt>Dados locais</dt><dd>{size(summary.localData)}</dd></div>
      <div><dt>Músicas offline</dt><dd>{summary.offlineTracks}</dd></div>
      <div><dt>Caches públicos</dt><dd>{summary.publicCaches}</dd></div></dl>}
    <div className="config-actions"><button className="config-button" onClick={async () => {
      const count = await clearPublicAssetCaches(); setMessage(`${count} cache(s) público(s) removido(s).`);
      refresh();
    }}>Limpar assets públicos antigos</button>
      <button className="config-button" onClick={async () => {
        if (!confirm("Remover músicas offline e caches reconstruíveis? Seus dados pessoais serão mantidos.")) return;
        await clearRebuildableData(); setMessage("Dados reconstruíveis removidos."); refresh();
      }}>Limpar dados reconstruíveis</button></div>
    {message && <p role="status">{message}</p>}
  </div>;
}
