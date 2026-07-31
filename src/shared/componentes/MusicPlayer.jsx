import "./MusicPlayer.css";
import {
  FaBackward, FaDownload, FaForward, FaPause, FaPlay, FaRandom,
  FaRedo, FaTimes, FaTrash, FaVolumeMute, FaVolumeUp,
} from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import {
  cacheTrack, clearAudioCache, isTrackCached,
} from "../../core/music/AudioCacheService";
import { useMusic } from "../contexts/MusicContext";

const format = (seconds) => {
  if (!Number.isFinite(seconds)) return "00:00";
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${
    String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

export default function MusicPlayer({ aberto, fechar }) {
  const music = useMusic();
  const closeRef = useRef(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [offlineIds, setOfflineIds] = useState([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const audio = music.audioRef.current;
    if (!audio) return undefined;
    const update = () => {
      setTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("loadedmetadata", update);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("loadedmetadata", update);
    };
  }, [music.audioRef, music.musica]);

  useEffect(() => {
    if (!aberto) return undefined;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const key = (event) => event.key === "Escape" && fechar();
    document.addEventListener("keydown", key);
    Promise.all(music.musicas.map(async (track) =>
      await isTrackCached(track.arquivo) ? track.id : null))
      .then((ids) => setOfflineIds(ids.filter(Boolean)));
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", key);
    };
  }, [aberto, fechar, music.musicas]);

  if (!music.preferences.enabled) return null;
  const repeatLabel = { none: "Sem repetição", track: "Repetir faixa", list: "Repetir lista" };
  const nextRepeat = { none: "track", track: "list", list: "none" };

  const download = async () => {
    setNotice("Preparando faixa...");
    try {
      await cacheTrack(music.musica.arquivo);
      setOfflineIds((ids) => [...new Set([...ids, music.musica.id])]);
      setNotice("Faixa disponível offline.");
    } catch (error) {
      setNotice(error.message);
    }
  };

  return <div className={`music-overlay ${aberto ? "aberto" : ""}`}
    onMouseDown={(event) => event.target === event.currentTarget && fechar()}>
    <aside className={`music-drawer ${aberto ? "aberto" : ""}`} role="dialog"
      aria-modal="true" aria-labelledby="titulo-player">
      <header className="music-header">
        <div><h2 id="titulo-player">Música</h2><p>Um som tranquilo para acompanhar seu momento.</p></div>
        <button ref={closeRef} className="fechar-player" onClick={fechar}
          aria-label="Fechar player"><FaTimes /></button>
      </header>

      <section className="music-now" aria-live="polite">
        <div className={`album-art ${music.tocando ? "tocando" : ""}`} aria-hidden="true">♫</div>
        <div><h3>{music.musica?.titulo}</h3><p>{music.musica?.artista}</p>
          <small>{music.musica?.licenca}</small></div>
      </section>
      <div className="barra-player">
        <input type="range" min="0" max={duration || 0} value={time}
          onChange={(event) => {
            const value = Number(event.target.value);
            music.seek(value);
            setTime(value);
          }} aria-label="Posição da música" />
        <div className="tempos"><span>{format(time)}</span><span>{format(duration)}</span></div>
      </div>
      <div className="controles">
        <button onClick={() => music.updatePreferences({ shuffle: !music.preferences.shuffle })}
          aria-pressed={music.preferences.shuffle} aria-label="Alternar ordem aleatória"><FaRandom /></button>
        <button onClick={music.anterior} aria-label="Música anterior"><FaBackward /></button>
        <button className="play" onClick={music.playPause} disabled={music.loading}
          aria-label={music.tocando ? "Pausar" : "Reproduzir"}>
          {music.tocando ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={music.proxima} aria-label="Próxima música"><FaForward /></button>
        <button onClick={() => music.updatePreferences({
          repeat: nextRepeat[music.preferences.repeat],
        })} aria-label={repeatLabel[music.preferences.repeat]}><FaRedo /></button>
      </div>
      <div className="volume">
        <button onClick={() => {
          music.setMuted(!muted);
          setMuted(!muted);
        }} aria-label={muted ? "Ativar som" : "Silenciar"}>
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input type="range" min="0" max="1" step="0.01" value={muted ? 0 : music.volume}
          onChange={(event) => {
            music.setVolume(Number(event.target.value));
            setMuted(false);
          }} aria-label="Volume" />
      </div>
      <div className="music-tools">
        <label>Temporizador
          <select value={music.timerEndsAt ? "active" : ""}
            onChange={(event) => music.setTimer(Number(event.target.value))}>
            <option value="">Desligado</option><option value="15">15 min</option>
            <option value="30">30 min</option><option value="60">60 min</option>
          </select>
        </label>
        <button onClick={download}><FaDownload /> Disponibilizar offline</button>
        <button onClick={async () => {
          await clearAudioCache();
          setOfflineIds([]);
          setNotice("Músicas offline removidas.");
        }}><FaTrash /> Limpar músicas offline</button>
      </div>
      {(notice || music.error) && <p className="music-notice">{music.error || notice}</p>}
      <section className="music-playlist">
        <h3>Playlist</h3>
        {music.musicas.map((track, index) => <button key={track.id}
          className={index === music.indice ? "is-current" : ""}
          onClick={() => music.setIndice(index)}>
          <span><strong>{track.titulo}</strong><small>{track.artista}</small></span>
          {offlineIds.includes(track.id) && <small>offline</small>}
        </button>)}
      </section>
    </aside>
  </div>;
}
