import "./PauseMode.css";

import { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaMusic, FaVolumeMute } from "react-icons/fa";
import ROUTES from "../../core/constants/routes";
import { getDailyMoment } from "../../core/emotional/DailyEmotionalService";
import { savePauseMoment } from "../../core/memory/MemoryService";
import { getAvailableAmbientSounds } from "../../core/atmosphere/AmbientSoundService";
import { useAtmospherePreferences } from "../../core/atmosphere/useAtmospherePreferences";
import { useMusic } from "../../shared/contexts/MusicContext";
import { useSkyTheme } from "../../core/atmosphere/useSkyTheme";
import { usePersonalization } from "../../core/atmosphere/usePersonalization";

export default function PauseMode() {
  const atmosphere = useAtmospherePreferences();
  const music = useMusic();
  const moment = getDailyMoment();
  const ambientSounds = getAvailableAmbientSounds();
  const sky = useSkyTheme();
  const personalization = usePersonalization();
  const [savingMoment, setSavingMoment] = useState(false);
  const [phrase, setPhrase] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  return <main className="pause-mode">
    <Link className="pause-mode__exit" to={ROUTES.HOME} aria-label="Voltar ao Lar">
      <FaHome aria-hidden="true" /> <span>Voltar</span>
    </Link>
    <section className="pause-mode__center" aria-labelledby="pause-title">
      <span className="pause-mode__eyebrow">Janela do Abrigo</span>
      <h1 id="pause-title">Só ficar</h1>
      <p>{moment.invitation}</p>
      {personalization.preferences.personalPhrase && <p className="pause-mode__personal">
        “{personalization.preferences.personalPhrase}”
      </p>}
      <div className="pause-mode__controls" aria-label="Controles desta pausa">
        {music.preferences.enabled && <button type="button" onClick={music.playPause}
          disabled={music.loading} aria-label={music.tocando ? "Pausar música" : "Tocar música"}>
          <FaMusic aria-hidden="true" /> {music.tocando ? "Pausar música" : "Tocar música"}
        </button>}
        <button type="button" aria-pressed={atmosphere.preferences.silenceMode}
          onClick={() => atmosphere.update({ silenceMode: !atmosphere.preferences.silenceMode })}>
          <FaVolumeMute aria-hidden="true" />
          {atmosphere.preferences.silenceMode ? "Sair do silêncio" : "Modo Silêncio"}
        </button>
      </div>
      {!savingMoment ? <button className="pause-mode__save" type="button" onClick={() => setSavingMoment(true)}>
        Guardar este momento
      </button> : <div className="pause-mode__memory">
        <label htmlFor="pause-phrase">Uma frase, se quiser</label>
        <input id="pause-phrase" maxLength="500" value={phrase} onChange={(event) => setPhrase(event.target.value)}
          placeholder="Pode ficar em branco." />
        <div><button type="button" onClick={() => { setSavingMoment(false); setPhrase(""); }}>Cancelar</button>
          <button type="button" onClick={() => {
            savePauseMoment({ phrase, period: sky.realPeriod }); setPhrase(""); setSavingMoment(false);
            setSavedMessage("Este momento ficou guardado com delicadeza.");
          }}>Guardar</button></div>
      </div>}
      {savedMessage && <p className="pause-mode__saved" role="status">{savedMessage}</p>}
      {ambientSounds.length > 0 && <p className="pause-mode__ambient">
        Sons ambientes disponíveis: {ambientSounds.map((sound) => sound.label).join(", ")}.
      </p>}
    </section>
  </main>;
}
