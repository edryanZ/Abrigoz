import "./MeuAbrigo.css";

import { useState } from "react";
import { FaLeaf, FaMusic, FaMoon, FaPalette } from "react-icons/fa";
import { getAvailableAmbientSounds } from "../../core/atmosphere/AmbientSoundService";
import { useAtmospherePreferences } from "../../core/atmosphere/useAtmospherePreferences";
import { ATMOSPHERE_THEMES } from "../../core/atmosphere/PersonalizationService";
import { loadSkyPreferences, saveSkyPreferences } from "../../core/atmosphere/SkyThemePreferencesService";
import { usePersonalization } from "../../core/atmosphere/usePersonalization";
import { useMemoryPreferences } from "../../core/memory/useMemoryPreferences";
import Navbar from "../../shared/componentes/Navbar";
import PageHeader from "../../shared/componentes/PageHeader";
import { useMusic } from "../../shared/contexts/MusicContext";
import { useUser } from "../../shared/contexts/UserContext";
import Container from "../../shared/ui/Container";
import GlassCard from "../../shared/ui/GlassCard";

export default function MeuAbrigo() {
  const { name, updateUser } = useUser();
  const music = useMusic();
  const atmosphere = useAtmospherePreferences();
  const personalization = usePersonalization();
  const memories = useMemoryPreferences();
  const [skyPreferences, setSkyPreferences] = useState(loadSkyPreferences);
  const [draftName, setDraftName] = useState(name);
  const [phrase, setPhrase] = useState(personalization.preferences.personalPhrase);
  const [message, setMessage] = useState("");
  const ambientSounds = getAvailableAmbientSounds();

  const updatePersonalization = (changes) => {
    personalization.update(changes);
    setMessage("Seu Abrigo foi ajustado.");
  };

  return <><Navbar /><Container><div className="my-abrigo-page">
    <PageHeader greeting="🌿" title="Meu Abrigo"
      subtitle="Pequenos ajustes para deixar este espaço mais parecido com o que faz bem para você." />
    <div className="my-abrigo-grid">
      <GlassCard className="my-abrigo-card" hover={false}>
        <h2><FaLeaf aria-hidden="true" /> Como o Abrigo chama você</h2>
        <label htmlFor="my-abrigo-name">Nome</label>
        <input id="my-abrigo-name" maxLength="40" value={draftName}
          onChange={(event) => setDraftName(event.target.value)} />
        <button type="button" disabled={!draftName.trim() || draftName.trim() === name} onClick={() => {
          updateUser({ name: draftName.trim() }); setMessage("Seu nome foi atualizado.");
        }}>Guardar nome</button>
        <label htmlFor="my-abrigo-phrase">Uma frase sua, se quiser</label>
        <input id="my-abrigo-phrase" maxLength="120" value={phrase}
          onChange={(event) => setPhrase(event.target.value)} placeholder="Vai no seu tempo." />
        <button type="button" onClick={() => updatePersonalization({ personalPhrase: phrase })}>
          Guardar frase
        </button>
      </GlassCard>

      <GlassCard className="my-abrigo-card" hover={false}>
        <h2><FaPalette aria-hidden="true" /> Atmosfera</h2>
        <label>Jeito da atmosfera<select value={personalization.preferences.atmosphereTheme}
          onChange={(event) => updatePersonalization({ atmosphereTheme: event.target.value })}>
          {Object.entries(ATMOSPHERE_THEMES).map(([value, label]) =>
            <option value={value} key={value}>{label}</option>)}
        </select></label>
        <label>Intensidade visual<select value={personalization.preferences.visualEnergy}
          onChange={(event) => updatePersonalization({ visualEnergy: event.target.value })}>
          <option value="quiet">Tranquila</option><option value="vivid">Viva</option>
        </select></label>
        <label className="my-abrigo-switch"><span>Céu dinâmico</span><input type="checkbox"
          checked={skyPreferences.automatic && !skyPreferences.staticBackground}
          onChange={(event) => setSkyPreferences(saveSkyPreferences({
            automatic: event.target.checked, staticBackground: !event.target.checked,
          }))} /></label>
        <label className="my-abrigo-switch"><span>Interações do céu</span><input type="checkbox"
          checked={atmosphere.preferences.interactiveSky}
          onChange={(event) => atmosphere.update({ interactiveSky: event.target.checked })} /></label>
        <label className="my-abrigo-switch"><span>Eventos raros</span><input type="checkbox"
          checked={atmosphere.preferences.rareEvents}
          onChange={(event) => atmosphere.update({ rareEvents: event.target.checked })} /></label>
      </GlassCard>

      <GlassCard className="my-abrigo-card" hover={false}>
        <h2><FaMoon aria-hidden="true" /> Conteúdo e memórias</h2>
        <label className="my-abrigo-switch"><span>Reflexões na Lar</span><input type="checkbox"
          checked={personalization.preferences.showReflectionsOnHome}
          onChange={(event) => updatePersonalization({ showReflectionsOnHome: event.target.checked })} /></label>
        <label className="my-abrigo-switch"><span>Conteúdo mais introspectivo</span><input type="checkbox"
          checked={personalization.preferences.introspectiveContent}
          onChange={(event) => updatePersonalization({ introspectiveContent: event.target.checked })} /></label>
        <label className="my-abrigo-switch"><span>Memórias antigas podem reaparecer</span><input type="checkbox"
          checked={memories.preferences.enabled}
          onChange={(event) => memories.update({ enabled: event.target.checked })} /></label>
        <label className="my-abrigo-switch"><span>Incluir reflexões antigas nas memórias</span><input type="checkbox"
          checked={memories.preferences.reflectionsEnabled} disabled={!memories.preferences.enabled}
          onChange={(event) => memories.update({ reflectionsEnabled: event.target.checked })} /></label>
      </GlassCard>

      <GlassCard className="my-abrigo-card" hover={false}>
        <h2><FaMusic aria-hidden="true" /> Música e ambiente</h2>
        <label className="my-abrigo-switch"><span>Player de música</span><input type="checkbox"
          checked={music.preferences.enabled}
          onChange={(event) => music.updatePreferences({ enabled: event.target.checked })} /></label>
        <p>{ambientSounds.length
          ? `${ambientSounds.length} ambiente(s) sonoro(s) local(is) disponível(is).`
          : "Os espaços para sons ambientes estão preparados, mas nenhum áudio ambiente apropriado foi incluído nesta versão."}</p>
      </GlassCard>
    </div>
    {message && <p className="my-abrigo-message" role="status">{message}</p>}
  </div></Container></>;
}
