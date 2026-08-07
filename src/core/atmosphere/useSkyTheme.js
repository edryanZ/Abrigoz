import { useEffect, useMemo, useState } from "react";
import {
  buildDailySkyScene,
  nextSkyBoundary,
  resolveColorMode,
  resolveLunarPhase,
  resolveSkyPalette,
  resolveSkyPeriod,
  SKY_TOKENS,
} from "./SkyThemeService";
import { loadSkyPreferences } from "./SkyThemePreferencesService";

export function useSkyTheme() {
  const [preferences, setPreferences] = useState(loadSkyPreferences);
  const [period, setPeriod] = useState(() => resolveSkyPeriod());
  const [now, setNow] = useState(() => new Date());
  const [preview, setPreview] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof matchMedia === "function"
      ? matchMedia("(prefers-reduced-motion: reduce)").matches : false);

  useEffect(() => {
    let timeout;
    const update = () => {
      window.clearTimeout(timeout);
      if (document.visibilityState === "hidden") return;
      const current = new Date();
      setNow(current);
      if (!preview) setPeriod(resolveSkyPeriod(current));
      const untilMinute = 60_000 - (current.getSeconds() * 1000 + current.getMilliseconds());
      const untilBoundary = nextSkyBoundary(current).getTime() - current.getTime() + 100;
      const delay = Math.max(1000, Math.min(untilMinute + 40, untilBoundary));
      timeout = window.setTimeout(update, delay);
    };
    const visibility = () => update();
    update();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.clearTimeout(timeout);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [preview]);

  useEffect(() => {
    const preferenceEvent = (event) => setPreferences(event.detail);
    const previewEvent = (event) => setPreview(event.detail || null);
    const media = typeof matchMedia === "function"
      ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    const motion = (event) => setReducedMotion(event.matches);
    window.addEventListener("abrigo:sky-preferences", preferenceEvent);
    window.addEventListener("abrigo:sky-preview", previewEvent);
    media?.addEventListener?.("change", motion);
    return () => {
      window.removeEventListener("abrigo:sky-preferences", preferenceEvent);
      window.removeEventListener("abrigo:sky-preview", previewEvent);
      media?.removeEventListener?.("change", motion);
    };
  }, []);

  const systemDark = typeof matchMedia === "function"
    ? matchMedia("(prefers-color-scheme: dark)").matches : false;
  const colorMode = resolveColorMode(preferences.colorMode, systemDark);
  const activePeriod = preview || (
    !preferences.automatic || preferences.staticBackground ? "noite" : period
  );
  const motion = preferences.allowAnimations && !preferences.reduceEffects && !reducedMotion;
  const palette = useMemo(() => {
    if (preview || !preferences.automatic || preferences.staticBackground) {
      return { period: activePeriod, nextPeriod: activePeriod, progress: 0,
        colors: SKY_TOKENS[activePeriod] };
    }
    return resolveSkyPalette(now);
  }, [activePeriod, now, preferences.automatic, preferences.staticBackground, preview]);
  const scene = buildDailySkyScene(now);
  const lunar = resolveLunarPhase(now);
  return {
    period: activePeriod, realPeriod: period, preview, preferences, colorMode, motion,
    palette, scene, lunar, now,
  };
}

export function previewSky(period) {
  window.dispatchEvent(new CustomEvent("abrigo:sky-preview", { detail: period }));
}

export function stopSkyPreview() {
  window.dispatchEvent(new CustomEvent("abrigo:sky-preview", { detail: null }));
}
