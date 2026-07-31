import { useState } from "react";
import {
  loadExportPreferences, saveExportPreferences,
} from "../../../core/export/ExportPreferencesService";

export default function ExportSettings() {
  const [preferences, setPreferences] = useState(loadExportPreferences);
  const update = (changes) => setPreferences(saveExportPreferences(changes));
  return <div className="export-settings">
    <label>Formato preferido<select value={preferences.format}
      onChange={(event) => update({ format: event.target.value })}>
      <option value="json">JSON</option><option value="csv">CSV</option>
      <option value="markdown">Markdown</option><option value="html">HTML</option>
      <option value="print">Impressão</option><option value="zip">ZIP</option></select></label>
    <label>Período padrão<select value={preferences.period}
      onChange={(event) => update({ period: event.target.value })}>
      <option value="all">Todo o período</option><option value="week">7 dias</option>
      <option value="month">30 dias</option><option value="year">Um ano</option></select></label>
    <label className="config-switch"><span>Proteção por padrão</span><input type="checkbox"
      checked={preferences.protectByDefault}
      onChange={(event) => update({ protectByDefault: event.target.checked })} /></label>
    <p>A Central de Exportação sempre mostra uma prévia antes de criar o arquivo.</p>
  </div>;
}
