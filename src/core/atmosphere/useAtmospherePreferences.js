import { useEffect, useState } from "react";
import {
  loadAtmospherePreferences,
  saveAtmospherePreferences,
} from "./AtmospherePreferencesService";

export function useAtmospherePreferences() {
  const [preferences, setPreferences] = useState(loadAtmospherePreferences);

  useEffect(() => {
    const update = (event) => setPreferences(event.detail);
    window.addEventListener("abrigo:atmosphere-preferences", update);
    return () => window.removeEventListener("abrigo:atmosphere-preferences", update);
  }, []);

  const update = (changes) => setPreferences(saveAtmospherePreferences(changes));
  return { preferences, update };
}
