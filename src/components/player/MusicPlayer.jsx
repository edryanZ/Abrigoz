import "./MusicPlayer.css";

import {
  FaTimes,
  FaPlay,
  FaPause,
  FaForward,
  FaBackward,
  FaMusic,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { useMusic } from "../context/MusicContext";

function formatar(segundos) {
  if (isNaN(segundos)) return "00:00";

  const m = Math.floor(segundos / 60);
  const s = Math.floor(segundos % 60);

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer({ aberto, fechar }) {
  const {
    musica,
    tocando,
    playPause,
    proxima,
    anterior,
    volume,
    setVolume,
    audioRef,
  } = useMusic();

  const [tempoAtual, setTempoAtual] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [mutado, setMutado] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    const atualizar = () => {
      setTempoAtual(audio.currentTime);
      setDuracao(audio.duration || 0);
    };

    audio.addEventListener("timeupdate", atualizar);
    audio.addEventListener("loadedmetadata", atualizar);

    return () => {
      audio.removeEventListener("timeupdate", atualizar);
      audio.removeEventListener("loadedmetadata", atualizar);
    };
  }, [audioRef, musica]);

  function alterarTempo(e) {
    const valor = Number(e.target.value);
    audioRef.current.currentTime = valor;
    setTempoAtual(valor);
  }

  function alterarVolume(e) {
    const valor = Number(e.target.value);
    setVolume(valor);
    audioRef.current.volume = valor;
    setMutado(valor === 0);
  }

  function mute() {
    if (mutado) {
      audioRef.current.volume = volume;
      setMutado(false);
    } else {
      audioRef.current.volume = 0;
      setMutado(true);
    }
  }

  return (
    <aside className={`music-drawer ${aberto ? "aberto" : ""}`}>
      <div className="music-header">
        <div>
          <h2>Player</h2>
          <p>Sua trilha sonora.</p>
        </div>

        <button
          className="fechar-player"
          onClick={fechar}
        >
          <FaTimes />
        </button>
      </div>

      <div className="album">
        <div
          className={`album-art ${
            tocando ? "tocando" : ""
          }`}
        >
          {musica?.capa ? (
            <img
              src={musica.capa}
              alt={musica.titulo}
            />
          ) : (
            <FaMusic />
          )}
        </div>

        <h3>{musica?.titulo}</h3>

        <span>{musica?.artista}</span>

        <div className="barra-player">
          <input
            type="range"
            min="0"
            max={duracao || 0}
            value={tempoAtual}
            onChange={alterarTempo}
          />

          <div className="tempos">
            <span>{formatar(tempoAtual)}</span>

            <span>{formatar(duracao)}</span>
          </div>
        </div>

        <div className="volume">
          <button onClick={mute}>
            {mutado ? (
              <FaVolumeMute />
            ) : (
              <FaVolumeUp />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={mutado ? 0 : volume}
            onChange={alterarVolume}
          />
        </div>
      </div>

      <div className="controles">
        <button onClick={anterior}>
          <FaBackward />
        </button>

        <button
          className="play"
          onClick={playPause}
        >
          {tocando ? (
            <FaPause />
          ) : (
            <FaPlay />
          )}
        </button>

        <button onClick={proxima}>
          <FaForward />
        </button>
      </div>
    </aside>
  );
}