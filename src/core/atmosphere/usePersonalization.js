import { useEffect, useState } from "react";
import { loadPersonalization, savePersonalization } from "./PersonalizationService";

export function usePersonalization() {
  const [preferences, setPreferences] = useState(loadPersonalization);
  useEffect(() => {
    const listener = (event) => setPreferences(event.detail);
    window.addEventListener("abrigo:personalization", listener);
    return () => window.removeEventListener("abrigo:personalization", listener);
  }, []);
  return { preferences, update: (changes) => setPreferences(savePersonalization(changes)) };
}
