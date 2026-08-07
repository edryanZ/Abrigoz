import { createContext, useCallback, useContext, useState } from "react";

import { getMoodHistory, saveMood as saveMoodService } from "../../core/services/mood";

const JourneyContext = createContext(null);

export function JourneyProvider({ children }) {
  const [moods, setMoods] = useState(getMoodHistory);

  const refresh = useCallback(() => setMoods(getMoodHistory()), []);
  const saveMood = useCallback((mood, note = "") => {
    const saved = saveMoodService(mood, note);
    refresh();
    return saved;
  }, [refresh]);

  return <JourneyContext.Provider value={{ moods, refresh, saveMood }}>
    {children}
  </JourneyContext.Provider>;
}

export function useJourney() {
  const value = useContext(JourneyContext);
  if (!value) throw new Error("useJourney precisa estar dentro de JourneyProvider.");
  return value;
}
