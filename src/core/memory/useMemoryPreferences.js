import { useEffect, useState } from "react";
import { loadMemoryPreferences, saveMemoryPreferences } from "./MemoryService";

export function useMemoryPreferences() {
  const [preferences, setPreferences] = useState(loadMemoryPreferences);
  useEffect(() => {
    const listener = (event) => setPreferences(event.detail);
    window.addEventListener("abrigo:memory-preferences", listener);
    return () => window.removeEventListener("abrigo:memory-preferences", listener);
  }, []);
  return {
    preferences,
    update: (changes) => setPreferences(saveMemoryPreferences(changes)),
  };
}
