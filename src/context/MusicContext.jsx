import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";

import { musicas } from "../data/musicas";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [indice, setIndice] = useState(
    Number(localStorage.getItem("abrigo-musica")) || 0
  );

  const [tocando, setTocando] = useState(
    localStorage.getItem("abrigo-tocando") === "true"
  );

  const [volume, setVolume] = useState(
    Number(localStorage.getItem("abrigo-volume")) || 0.4
  );

  // Carrega a música quando ela muda
  useEffect(() => {
    const audio = audioRef.current;

    const estavaTocando = tocando;

    audio.pause();

    audio.src = musicas[indice].arquivo;
    audio.load();

    audio.volume = volume;

    const tempoSalvo = Number(localStorage.getItem("abrigo-tempo"));

    if (!isNaN(tempoSalvo)) {
      audio.currentTime = tempoSalvo;
    }

    if (estavaTocando) {
      audio.play().catch((erro) => {
        console.error("Erro ao reproduzir:", erro);
      });
    }
  }, [indice]);

  // Atualiza volume
  useEffect(() => {
    audioRef.current.volume = volume;
    localStorage.setItem("abrigo-volume", volume);
  }, [volume]);

  // Salva música atual
  useEffect(() => {
    localStorage.setItem("abrigo-musica", indice);
  }, [indice]);

  // Salva estado play/pause
  useEffect(() => {
    localStorage.setItem("abrigo-tocando", tocando);
  }, [tocando]);

  // Salva posição da música
  useEffect(() => {
    const audio = audioRef.current;

    const salvarTempo = () => {
      localStorage.setItem(
        "abrigo-tempo",
        audio.currentTime
      );
    };

    audio.addEventListener("timeupdate", salvarTempo);

    audio.onended = () => {
      proxima();
    };

    return () => {
      audio.removeEventListener(
        "timeupdate",
        salvarTempo
      );
    };
  }, [indice]);

  function playPause() {
    const audio = audioRef.current;

    if (tocando) {
      audio.pause();
      setTocando(false);
      return;
    }

    audio
      .play()
      .then(() => {
        setTocando(true);
      })
      .catch((erro) => {
        console.error("Erro Play:", erro);
      });
  }

  function proxima() {
    setIndice((i) => (i + 1) % musicas.length);
  }

  function anterior() {
    setIndice((i) =>
      i === 0 ? musicas.length - 1 : i - 1
    );
  }

  return (
    <MusicContext.Provider
      value={{
        musicas,
        musica: musicas[indice],
        indice,
        tocando,
        volume,
        setVolume,
        playPause,
        proxima,
        anterior,
        audioRef,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}