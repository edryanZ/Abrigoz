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

import { useEffect, useRef, useState } from "react";
import { useMusic } from "../contexts/MusicContext";

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

  const drawerRef = useRef(null);
  const botaoFecharRef = useRef(null);

  const [tempoAtual, setTempoAtual] = useState(0);
  const [duracao, setDuracao] = useState(0);
  const [mutado, setMutado] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) return;

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

  useEffect(() => {
    if (!aberto) return;

    document.body.style.overflow = "hidden";
    botaoFecharRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        fechar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [aberto, fechar]);

  function alterarTempo(e) {
    if (!audioRef.current) return;

    const valor = Number(e.target.value);

    audioRef.current.currentTime = valor;
    setTempoAtual(valor);
  }

  function alterarVolume(e) {
    const valor = Number(e.target.value);

    setVolume(valor);

    if (audioRef.current) {
      audioRef.current.volume = valor;
    }

    setMutado(valor === 0);
  }

  function mute() {
    if (!audioRef.current) return;

    if (mutado) {
      audioRef.current.volume = volume;
      setMutado(false);
    } else {
      audioRef.current.volume = 0;
      setMutado(true);
    }
  }

  function fecharAoClicarFora(e) {
    if (e.target === drawerRef.current) {
      fechar();
    }
  }

  return (
    <div
      ref={drawerRef}
      onMouseDown={fecharAoClicarFora}
      className={`music-overlay ${aberto ? "aberto" : ""}`}
    >
      <aside
        className={`music-drawer ${aberto ? "aberto" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-player"
      >
        <div className="music-header">
          <div>
            <h2 id="titulo-player">🎵 Agora tocando</h2>
          <p>Relaxe e aproveite este momento.</p>
          </div>

          <button
            ref={botaoFecharRef}
            className="fechar-player"
            onClick={fechar}
            aria-label="Fechar player"
          >
            <FaTimes />
          </button>
        </div>

        <div className="album">
          <div
            className={`album-art ${tocando ? "tocando" : ""}`}
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
              aria-label="Posição da música"
            />

            <div className="tempos">
              <span>{formatar(tempoAtual)}</span>

              <span>{formatar(duracao)}</span>
            </div>
          </div>
                    <div className="volume">
            <button
              onClick={mute}
              aria-label={mutado ? "Ativar som" : "Silenciar"}
            >
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
              aria-label="Volume"
            />
          </div>
        </div>

        <div className="controles">
          <button
            onClick={anterior}
            aria-label="Música anterior"
          >
            <FaBackward />
          </button>

          <button
            className="play"
            onClick={playPause}
            aria-label={tocando ? "Pausar" : "Reproduzir"}
          >
            {tocando ? (
              <FaPause />
            ) : (
              <FaPlay />
            )}
          </button>

          <button
            onClick={proxima}
            aria-label="Próxima música"
          >
            <FaForward />
          </button>
        </div>
      </aside>
    </div>
  );
}