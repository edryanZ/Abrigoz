import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { useUser } from "./UserContext";

import {
  registerVisit,
  getStreakData,
} from "../services/streak";

import {
  getStatistics,
  incrementVisits,
  incrementLettersRead,
  incrementDailyLetters,
  incrementMoods,
} from "../services/statistics";

import {
  getMoodHistory,
  getMoodCount,
  saveMood as saveMoodService,
} from "../services/mood";

import {
  checkAchievements,
  getUnlockedAchievementObjects,
} from "../services/achievements";

const JourneyContext = createContext();

export function JourneyProvider({ children }) {
  const { user } = useUser();

  const [streak, setStreak] = useState(getStreakData());
  const [statistics, setStatistics] = useState(getStatistics());
  const [moods, setMoods] = useState(getMoodHistory());
  const [achievements, setAchievements] = useState(
    getUnlockedAchievementObjects()
  );

  function refresh() {
    const streakData = getStreakData();
    const stats = getStatistics();
    const moodHistory = getMoodHistory();

    checkAchievements({
      lettersRead: stats.lettersRead,
      currentStreak: streakData.currentStreak,
      moodsRegistered: getMoodCount(),
      profileCreated: !!user,
      firstVisit: streakData.totalVisits > 0,
    });

    setStreak(streakData);
    setStatistics(stats);
    setMoods(moodHistory);
    setAchievements(getUnlockedAchievementObjects());
  }

  useEffect(() => {
    registerVisit();
    incrementVisits();
  }, []);

  useEffect(() => {
    refresh();
  }, [user]);

  function saveMood(mood, note = "") {
    saveMoodService(mood, note);

    incrementMoods();

    refresh();
  }

  function incrementLetters(amount = 1) {
    incrementLettersRead(amount);
    incrementDailyLetters(amount);

    refresh();
  }

  function unlockAllAchievements() {
    incrementLettersRead(1000);

    checkAchievements({
      lettersRead: 1000,
      currentStreak: 1000,
      moodsRegistered: 1000,
      profileCreated: true,
      firstVisit: true,
    });

    refresh();
  }

  return (
    <JourneyContext.Provider
      value={{
        streak,
        statistics,
        moods,
        achievements,

        refresh,

        saveMood,

        incrementLetters,

        unlockAllAchievements,
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
}

export function useJourney() {
  return useContext(JourneyContext);
}