import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";
import { musicas } from "../../data/musicas";
import {
  loadMusicPreferences,
  saveMusicPreferences,
} from "../../core/music/MusicPreferencesService";

const MusicContext = createContext(null);
const POSITION_WRITE_INTERVAL_MS = 5_000;

export function MusicProvider({ children }) {
  const [initial] = useState(() => {
    const loaded = loadMusicPreferences();
    return {
      preferences: loaded,
      index: Math.max(0, musicas.findIndex((item) => item.id === loaded.trackId)),
    };
  });

  const audioRef = useRef(null);
  const mountedRef = useRef(true);
  const preferencesRef = useRef(initial.preferences);
  const trackRef = useRef(null);
  const playingRef = useRef(false);
  const lastPositionWriteRef = useRef(0);
  const [audioReady, setAudioReady] = useState(false);
  const [preferences, setPreferences] = useState(initial.preferences);
  const [indice, setIndice] = useState(initial.index);
  const [tocando, setTocando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timerEndsAt, setTimerEndsAt] = useState(null);
  const musica = musicas[indice] ?? musicas[0] ?? null;

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);
  useEffect(() => {
    trackRef.current = musica;
  }, [musica]);
  useEffect(() => {
    playingRef.current = tocando;
  }, [tocando]);

  const updatePreferences = useCallback((changes) => {
    const next = saveMusicPreferences(changes);
    preferencesRef.current = next;
    if (mountedRef.current) setPreferences(next);
    return next;
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current) return audioRef.current;
    if (typeof Audio === "undefined") {
      setError("A reprodução de áudio não está disponível neste navegador.");
      return null;
    }
    try {
      const audio = new Audio();
      audio.volume = preferencesRef.current.volume;
      audioRef.current = audio;
      setAudioReady(true);
      return audio;
    } catch {
      setError("Não foi possível preparar o reprodutor de música.");
      return null;
    }
  }, []);

  const persistPosition = useCallback((force = false) => {
    const audio = audioRef.current;
    const currentPreferences = preferencesRef.current;
    const track = trackRef.current;
    if (!audio || !track || !currentPreferences.rememberPosition) return false;
    const now = Date.now();
    if (!force && now - lastPositionWriteRef.current < POSITION_WRITE_INTERVAL_MS) {
      return false;
    }
    lastPositionWriteRef.current = now;
    updatePreferences({ trackId: track.id, position: audio.currentTime });
    return true;
  }, [updatePreferences]);

  const loadCurrent = useCallback(() => {
    const audio = ensureAudio();
    const track = trackRef.current;
    const currentPreferences = preferencesRef.current;
    if (!audio || !track || !currentPreferences.enabled) return null;
    if (!audio.src.endsWith(track.arquivo)) {
      audio.src = track.arquivo;
      audio.load();
      if (currentPreferences.rememberPosition && currentPreferences.trackId === track.id) {
        audio.currentTime = currentPreferences.position;
      }
    }
    return audio;
  }, [ensureAudio]);

  const play = useCallback(async () => {
    const audio = loadCurrent();
    const track = trackRef.current;
    if (!audio || !track) return false;
    setLoading(true);
    setError("");
    try {
      await audio.play();
      if (!mountedRef.current) return false;
      setTocando(true);
      updatePreferences({ trackId: track.id });
      return true;
    } catch {
      if (mountedRef.current) {
        setError("Não foi possível reproduzir esta faixa agora.");
        setTocando(false);
      }
      return false;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [loadCurrent, updatePreferences]);

  const pause = useCallback(() => {
    persistPosition(true);
    audioRef.current?.pause();
    playingRef.current = false;
    if (mountedRef.current) setTocando(false);
  }, [persistPosition]);

  const choose = useCallback((nextIndex, shouldPlay = playingRef.current) => {
    const selected = musicas[nextIndex];
    if (!selected) return;
    persistPosition(true);
    const audio = audioRef.current;
    audio?.pause();
    audio?.removeAttribute("src");
    trackRef.current = selected;
    playingRef.current = false;
    setTocando(false);
    setIndice(nextIndex);
    updatePreferences({ trackId: selected.id, position: 0 });
    if (shouldPlay) {
      queueMicrotask(() => {
        if (mountedRef.current) void play();
      });
    }
  }, [persistPosition, play, updatePreferences]);

  const next = useCallback(() => {
    if (!musicas.length) return;
    const currentIndex = musicas.findIndex((item) => item.id === trackRef.current?.id);
    if (preferencesRef.current.shuffle && musicas.length > 1) {
      let target = currentIndex;
      while (target === currentIndex) target = Math.floor(Math.random() * musicas.length);
      choose(target);
    } else {
      choose((currentIndex + 1) % musicas.length);
    }
  }, [choose]);

  const previous = useCallback(() => {
    const currentIndex = musicas.findIndex((item) => item.id === trackRef.current?.id);
    choose(currentIndex > 0 ? currentIndex - 1 : musicas.length - 1);
  }, [choose]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audioReady || !audio) return undefined;
    const onTime = () => persistPosition(false);
    const onEnded = () => {
      if (preferencesRef.current.repeat === "track") {
        audio.currentTime = 0;
        audio.play().catch(() => setError("Não foi possível repetir esta faixa."));
      } else if (preferencesRef.current.repeat === "list"
          || trackRef.current?.id !== musicas.at(-1)?.id) {
        next();
      } else {
        setTocando(false);
      }
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioReady, next, persistPosition]);

  useEffect(() => {
    if (!timerEndsAt) return undefined;
    const timer = window.setTimeout(() => {
      pause();
      setTimerEndsAt(null);
    }, Math.max(0, timerEndsAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [pause, timerEndsAt]);

  useEffect(() => {
    if (!audioReady || !preferences.mediaSession
        || !("mediaSession" in navigator) || !musica) return undefined;
    try {
      if (typeof MediaMetadata !== "undefined") {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: musica.titulo, artist: musica.artista, album: "Abrigo",
        });
      }
      navigator.mediaSession.setActionHandler("play", play);
      navigator.mediaSession.setActionHandler("pause", pause);
      navigator.mediaSession.setActionHandler("nexttrack", next);
      navigator.mediaSession.setActionHandler("previoustrack", previous);
    } catch {
      return undefined;
    }
    return () => {
      for (const action of ["play", "pause", "nexttrack", "previoustrack"]) {
        try { navigator.mediaSession.setActionHandler(action, null); } catch { /* sem suporte */ }
      }
    };
  }, [audioReady, musica, next, pause, play, preferences.mediaSession, previous]);

  useEffect(() => {
    const saveWhenHidden = () => {
      if (document.visibilityState === "hidden") persistPosition(true);
    };
    window.addEventListener("pagehide", saveWhenHidden);
    document.addEventListener("visibilitychange", saveWhenHidden);
    return () => {
      window.removeEventListener("pagehide", saveWhenHidden);
      document.removeEventListener("visibilitychange", saveWhenHidden);
    };
  }, [persistPosition]);

  useEffect(() => () => {
    mountedRef.current = false;
    persistPosition(true);
    audioRef.current?.pause();
    audioRef.current?.removeAttribute("src");
  }, [persistPosition]);

  const setVolume = useCallback((volume) => {
    if (audioRef.current) audioRef.current.volume = volume;
    updatePreferences({ volume });
  }, [updatePreferences]);
  const seek = useCallback((position) => {
    const audio = ensureAudio();
    if (audio) audio.currentTime = position;
  }, [ensureAudio]);
  const setMuted = useCallback((muted) => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : preferencesRef.current.volume;
    }
  }, []);
  const playPause = useCallback(() => {
    if (playingRef.current) pause();
    else void play();
  }, [pause, play]);
  const setTimer = useCallback((minutes) => {
    setTimerEndsAt(minutes ? Date.now() + minutes * 60_000 : null);
  }, []);

  const value = useMemo(() => ({
    audioRef, audioReady, ensureAudio, musicas, musica, indice, setIndice: choose,
    tocando, loading, error, play, pause, playPause, proxima: next, anterior: previous,
    volume: preferences.volume, setVolume, seek, setMuted, preferences,
    updatePreferences, timerEndsAt, setTimer,
  }), [
    audioReady, choose, ensureAudio, error, indice, loading, musica, next, pause,
    play, playPause, preferences, previous, seek, setMuted, setTimer, setVolume,
    timerEndsAt, tocando, updatePreferences,
  ]);

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>;
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error("useMusic deve ser usado dentro de MusicProvider.");
  return context;
}
