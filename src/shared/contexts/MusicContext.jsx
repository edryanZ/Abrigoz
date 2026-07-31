import { createContext, useContext, useEffect, useRef, useState } from "react";
import { musicas } from "../../data/musicas";
import {
  loadMusicPreferences,
  saveMusicPreferences,
} from "../../core/music/MusicPreferencesService";

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const audioRef = useRef(typeof Audio === "undefined" ? null : new Audio());
  const [preferences, setPreferences] = useState(loadMusicPreferences);
  const [indice, setIndice] = useState(() => Math.max(0,
    musicas.findIndex((item) => item.id === loadMusicPreferences().trackId)));
  const [tocando, setTocando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const musica = musicas[indice] ?? musicas[0] ?? null;

  const updatePreferences = (changes) => {
    const next = saveMusicPreferences(changes);
    setPreferences(next);
    return next;
  };

  const loadCurrent = () => {
    const audio = audioRef.current;
    if (!audio || !musica || !preferences.enabled) return null;
    if (!audio.src.endsWith(musica.arquivo)) {
      audio.src = musica.arquivo;
      audio.load();
      if (preferences.rememberPosition && preferences.trackId === musica.id) {
        audio.currentTime = preferences.position;
      }
    }
    return audio;
  };

  const play = async () => {
    const audio = loadCurrent();
    if (!audio) return;
    setLoading(true);
    setError("");
    try {
      await audio.play();
      setTocando(true);
      updatePreferences({ trackId: musica.id });
    } catch {
      setError("Não foi possível reproduzir esta faixa agora.");
    } finally {
      setLoading(false);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setTocando(false);
  };

  const choose = (nextIndex, shouldPlay = tocando) => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.removeAttribute("src");
    setTocando(false);
    setIndice(nextIndex);
    const selected = musicas[nextIndex];
    updatePreferences({ trackId: selected?.id, position: 0 });
    if (shouldPlay) setTimeout(() => play(), 0);
  };

  const next = () => {
    if (!musicas.length) return;
    if (preferences.shuffle && musicas.length > 1) {
      let target = indice;
      while (target === indice) target = Math.floor(Math.random() * musicas.length);
      choose(target);
    } else choose((indice + 1) % musicas.length);
  };
  const previous = () => choose(indice ? indice - 1 : musicas.length - 1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.volume = preferences.volume;
    const onTime = () => {
      if (preferences.rememberPosition) {
        saveMusicPreferences({ trackId: musica?.id, position: audio.currentTime });
      }
    };
    const onEnded = () => {
      if (preferences.repeat === "track") {
        audio.currentTime = 0;
        audio.play().catch(() => setError("Não foi possível repetir esta faixa."));
      } else if (preferences.repeat === "list" || indice < musicas.length - 1) next();
      else setTocando(false);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  });

  useEffect(() => {
    if (!timerEndsAt) return undefined;
    const timer = setInterval(() => {
      if (Date.now() >= timerEndsAt) {
        pause();
        setTimerEndsAt(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timerEndsAt]);

  useEffect(() => {
    if (!preferences.mediaSession || !("mediaSession" in navigator) || !musica) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: musica.titulo, artist: musica.artista, album: "Abrigo",
    });
    navigator.mediaSession.setActionHandler("play", play);
    navigator.mediaSession.setActionHandler("pause", pause);
    navigator.mediaSession.setActionHandler("nexttrack", next);
    navigator.mediaSession.setActionHandler("previoustrack", previous);
  });

  const value = {
    audioRef, musicas, musica, indice, setIndice: choose, tocando, loading, error,
    play, pause, playPause: () => tocando ? pause() : play(),
    proxima: next, anterior: previous,
    volume: preferences.volume,
    setVolume: (volume) => {
      if (audioRef.current) audioRef.current.volume = volume;
      updatePreferences({ volume });
    },
    seek: (position) => {
      if (audioRef.current) audioRef.current.currentTime = position;
    },
    setMuted: (muted) => {
      if (audioRef.current) audioRef.current.volume = muted ? 0 : preferences.volume;
    },
    preferences, updatePreferences, timerEndsAt,
    setTimer: (minutes) => setTimerEndsAt(minutes ? Date.now() + minutes * 60000 : null),
  };

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic deve ser usado dentro de MusicProvider.");
  return context;
}
