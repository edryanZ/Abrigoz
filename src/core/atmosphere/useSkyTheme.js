import { useEffect, useState } from "react";
import { nextSkyBoundary, resolveColorMode, resolveSkyPeriod } from "./SkyThemeService";
import { loadSkyPreferences } from "./SkyThemePreferencesService";

export function useSkyTheme() {
  const [preferences, setPreferences] = useState(loadSkyPreferences);
  const [period, setPeriod] = useState(() => resolveSkyPeriod());
  const [preview, setPreview] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof matchMedia === "function"
      ? matchMedia("(prefers-reduced-motion: reduce)").matches : false);

  useEffect(() => {
    let timeout;
    const update = () => {
      if (!preview) setPeriod(resolveSkyPeriod());
      const delay = Math.max(1000, nextSkyBoundary().getTime() - Date.now() + 100);
      timeout = window.setTimeout(update, delay);
    };
    const visibility = () => document.visibilityState === "visible" && update();
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
  return { period: activePeriod, realPeriod: period, preview, preferences, colorMode, motion };
}

export function previewSky(period) {
  window.dispatchEvent(new CustomEvent("abrigo:sky-preview", { detail: period }));
}

export function stopSkyPreview() {
  window.dispatchEvent(new CustomEvent("abrigo:sky-preview", { detail: null }));
}
