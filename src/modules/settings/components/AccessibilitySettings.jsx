import { useState } from "react";
import {
  loadAccessibilityPreferences,
  saveAccessibilityPreferences,
} from "../../../core/accessibility/AccessibilityPreferencesService.js";

export default function AccessibilitySettings() {
  const [preferences, setPreferences] = useState(loadAccessibilityPreferences);
  const update = (changes) => setPreferences(saveAccessibilityPreferences(changes));
  return <div className="accessibility-settings">
    <label>Tamanho do texto<select value={preferences.textSize}
      onChange={(event) => update({ textSize: event.target.value })}>
      <option value="small">Pequeno</option><option value="standard">Padrão</option><option value="large">Grande</option>
    </select></label>
    <label className="config-switch"><span>Alto contraste</span><input type="checkbox"
      checked={preferences.highContrast} onChange={(event) => update({ highContrast: event.target.checked })} /></label>
    <label>Fonte para leitura longa<select value={preferences.readingFont}
      onChange={(event) => update({ readingFont: event.target.value })}>
      <option value="standard">Padrão do Abrigo</option><option value="comfortable">Confortável para leitura</option>
    </select></label>
    <p>Esses ajustes são locais. O zoom do navegador continua funcionando normalmente.</p>
  </div>;
}
