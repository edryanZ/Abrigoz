import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { musicas } from "../../data/musicas";
import STORAGE_KEYS from "../../core/constants/storageKeys";
import { storage } from "../../core/storage/storage";

const MusicContext = createContext(null);

const STORAGE = {
  INDEX: STORAGE_KEYS.MUSIC,
  PLAYING: "abrigo:playing",
  VOLUME: "abrigo:volume",
  TIME: "abrigo:time",
};

export function MusicProvider({ children }) {
  const audioRef = useRef(new Audio());
  const isPlayingRef = useRef(false);

  const [indice, setIndice] = useState(() => {
    const value = Number(storage.get(STORAGE.INDEX));
    return Number.isFinite(value) ? value : 0;
  });

  const [tocando, setTocando] = useState(() => {
    return storage.get(STORAGE.PLAYING) === true;
  });

  const [volume, setVolume] = useState(() => {
    const value = Number(storage.get(STORAGE.VOLUME));
    return Number.isFinite(value) ? value : 0.4;
  });

  useEffect(() => {
    isPlayingRef.current = tocando;
  }, [tocando]);

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

    const tempo = Number(storage.get(STORAGE.TIME));

    if (Number.isFinite(tempo)) {
      audio.currentTime = tempo;
    }

    if (isPlayingRef.current) {
      audio.play().catch(() => {});
    }
  }, [musicaAtual]);

  useEffect(() => {
    audioRef.current.volume = volume;
    storage.set(STORAGE.VOLUME, volume);
  }, [volume]);

  useEffect(() => {
    storage.set(STORAGE.INDEX, indice);
  }, [indice]);

  useEffect(() => {
    storage.set(STORAGE.PLAYING, tocando);
  }, [tocando]);

  useEffect(() => {
    const audio = audioRef.current;

    function salvarTempo() {
      storage.set(STORAGE.TIME, audio.currentTime);
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
