const STORAGE_KEY = "abrigo_achievements";

export const ACHIEVEMENTS = [
  {
    id: "first_visit",
    title: "Primeira visita",
    description: "Entrou no Abrigo pela primeira vez.",
    icon: "🌱",
  },

  {
    id: "profile_created",
    title: "Bem-vindo",
    description: "Criou seu perfil no Abrigo.",
    icon: "👤",
  },

  {
    id: "first_letter",
    title: "Primeira carta",
    description: "Leu sua primeira carta.",
    icon: "💌",
  },

  {
    id: "letters_10",
    title: "Leitor iniciante",
    description: "Leu 10 cartas.",
    icon: "📖",
  },

  {
    id: "letters_50",
    title: "Leitor dedicado",
    description: "Leu 50 cartas.",
    icon: "📚",
  },

  {
    id: "letters_100",
    title: "Colecionador de cartas",
    description: "Leu 100 cartas.",
    icon: "📜",
  },

  {
    id: "streak_7",
    title: "Persistente",
    description: "Entrou durante 7 dias seguidos.",
    icon: "🔥",
  },

  {
    id: "streak_30",
    title: "Companheiro do Abrigo",
    description: "Entrou durante 30 dias seguidos.",
    icon: "🏆",
  },

  {
    id: "streak_100",
    title: "Lenda do Abrigo",
    description: "Entrou durante 100 dias seguidos.",
    icon: "⭐",
  },

  {
    id: "first_mood",
    title: "Como você está?",
    description: "Registrou seu primeiro humor.",
    icon: "😊",
  },
];

function getDefaultData() {
  return {
    unlocked: [],
  };
}

export function getAchievements() {
  const data = localStorage.getItem(STORAGE_KEY);

  if (!data) {
    const initial = getDefaultData();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));

    return initial;
  }

  return JSON.parse(data);
}

export function saveAchievements(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isUnlocked(id) {
  return getAchievements().unlocked.includes(id);
}

export function unlockAchievement(id) {
  const data = getAchievements();

  if (data.unlocked.includes(id)) {
    return false;
  }

  data.unlocked.push(id);

  saveAchievements(data);

  return true;
}

export function getUnlockedAchievements() {
  return getAchievements().unlocked;
}

export function getUnlockedCount() {
  return getAchievements().unlocked.length;
}

export function getAchievementById(id) {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id);
}

export function getLockedAchievements() {
  const unlocked = getUnlockedAchievements();

  return ACHIEVEMENTS.filter(
    (achievement) => !unlocked.includes(achievement.id)
  );
}

export function getUnlockedAchievementObjects() {
  const unlocked = getUnlockedAchievements();

  return ACHIEVEMENTS.filter((achievement) =>
    unlocked.includes(achievement.id)
  );
}

export function checkAchievements({
  lettersRead = 0,
  currentStreak = 0,
  moodsRegistered = 0,
  profileCreated = false,
  firstVisit = false,
}) {
  if (firstVisit) unlockAchievement("first_visit");

  if (profileCreated) unlockAchievement("profile_created");

  if (lettersRead >= 1) unlockAchievement("first_letter");

  if (lettersRead >= 10) unlockAchievement("letters_10");

  if (lettersRead >= 50) unlockAchievement("letters_50");

  if (lettersRead >= 100) unlockAchievement("letters_100");

  if (currentStreak >= 7) unlockAchievement("streak_7");

  if (currentStreak >= 30) unlockAchievement("streak_30");

  if (currentStreak >= 100) unlockAchievement("streak_100");

  if (moodsRegistered >= 1) unlockAchievement("first_mood");

  return getUnlockedAchievementObjects();
}

export function resetAchievements() {
  localStorage.removeItem(STORAGE_KEY);
}