import { useState } from "react";
import {
  NAV_DESTINATIONS, loadNavigationPreferences, saveNavigationPreferences, setNavigationFavorite,
} from "../../../core/personalization/NavigationPreferencesService.js";

export default function NavigationSettings() {
  const [preferences, setPreferences] = useState(loadNavigationPreferences); const [message, setMessage] = useState("");
  const update = (changes) => setPreferences(saveNavigationPreferences(changes));
  return <div className="navigation-settings">
    <label className="config-switch"><span>Quero menos coisas</span><input type="checkbox" checked={preferences.simplified}
      onChange={(event) => update({ simplified: event.target.checked })} /></label>
    <p>Quando ativo, o menu deixa alguns módulos secundários quietos. Nada é apagado.</p>
    <details><summary>Escolher módulos visíveis</summary>{NAV_DESTINATIONS.map(([id, label]) => <label className="config-switch" key={id}>
      <span>{label}</span><input type="checkbox" checked={!preferences.hiddenModules.includes(id)} onChange={(event) => update({
        hiddenModules: event.target.checked ? preferences.hiddenModules.filter((item) => item !== id) : [...preferences.hiddenModules, id],
      })} /></label>)}</details>
    <details><summary>Até 3 atalhos favoritos</summary>{NAV_DESTINATIONS.map(([id, label]) => <label className="config-switch" key={id}>
      <span>{label}</span><input type="checkbox" checked={preferences.favorites.includes(id)} onChange={(event) => {
        try { setMessage(""); setPreferences(setNavigationFavorite(id, event.target.checked)); }
        catch (error) { setMessage(error.message); }
      }} /></label>)}</details>
    {message && <p role="status">{message}</p>}
  </div>;
}
