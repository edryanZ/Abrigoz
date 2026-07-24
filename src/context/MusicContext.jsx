import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { musicas } from "../data/musicas";
import STORAGE_KEYS from "../constants/storageKeys";

const MusicContext = createContext(null);

const STORAGE = {
  INDEX: STORAGE_KEYS.MUSIC,
  PLAYING: "abrigo:playing",
  VOLUME: "abrigo:volume",
  TIME: "abrigo:time",
};

export function MusicProvider({ children }) {
  const audioRef = useRef(new Audio());

  const [indice, setIndice] = useState(() => {
    const value = Number(localStorage.getItem(STORAGE.INDEX));
    return Number.isFinite(value) ? value : 0;
  });

  const [tocando, setTocando] = useState(() => {
    return localStorage.getItem(STORAGE.PLAYING) === "true";
  });

  const [volume, setVolume] = useState(() => {
    const value = Number(localStorage.getItem(STORAGE.VOLUME));
    return Number.isFinite(value) ? value : 0.4;
  });

  const musicaAtual = useMemo(() => {
    if (!musicas.length) return null;

    return musicas[indice] ?? musicas[0];
  }, [indice]);

  useEffect(() => {
    if (!musicaAtual) return;

    const audio = audioRef.current;

    audio.pause();

    audio.src = musicaAtual.arquivo;
    audio.load();

    audio.volume = volume;

    const tempo = Number(localStorage.getItem(STORAGE.TIME));

    if (Number.isFinite(tempo)) {
      audio.currentTime = tempo;
    }

    if (tocando) {
      audio.play().catch(() => {});
    }
  }, [musicaAtual]);

  useEffect(() => {
    audioRef.current.volume = volume;
    localStorage.setItem(STORAGE.VOLUME, volume.toString());
  }, [volume]);

  useEffect(() => {
    localStorage.setItem(STORAGE.INDEX, indice.toString());
  }, [indice]);

  useEffect(() => {
    localStorage.setItem(STORAGE.PLAYING, tocando.toString());
  }, [tocando]);

  useEffect(() => {
    const audio = audioRef.current;

    function salvarTempo() {
      localStorage.setItem(
        STORAGE.TIME,
        audio.currentTime.toString()
      );
    }

    function terminou() {
      proxima();
    }

    audio.addEventListener("timeupdate", salvarTempo);
    audio.addEventListener("ended", terminou);

    return () => {
      audio.removeEventListener(
        "timeupdate",
        salvarTempo
      );

      audio.removeEventListener(
        "ended",
        terminou
      );
    };
  }, [indice]);

  function play() {
    audioRef.current
      .play()
      .then(() => setTocando(true))
      .catch(() => {});
  }

  function pause() {
    audioRef.current.pause();
    setTocando(false);
  }

  function playPause() {
    if (tocando) {
      pause();
    } else {
      play();
    }
  }

  function proxima() {
    if (!musicas.length) return;

    setIndice((atual) => (atual + 1) % musicas.length);
  }

  function anterior() {
    if (!musicas.length) return;

    setIndice((atual) =>
      atual === 0 ? musicas.length - 1 : atual - 1
    );
  }

  return (
    <MusicContext.Provider
      value={{
        audioRef,

        musicas,
        musica: musicaAtual,

        indice,
        setIndice,

        tocando,
        play,
        pause,
        playPause,

        volume,
        setVolume,

        proxima,
        anterior,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);

  if (!context) {
    throw new Error(
      "useMusic deve ser usado dentro de MusicProvider."
    );
  }

  return context;
}