import {
  enumerateDays,
  inPeriod,
  localDateKey,
  parseLocalDate,
  previousPeriod,
} from "./localDates.js";

const dateOf = (item) => String(
  item.date ?? item.createdAt ?? item.updatedAt ?? ""
).slice(0, 10);

function scheduled(habit, dateKey) {
  const date = parseLocalDate(dateKey);
  if (!date || habit.archived || dateKey < habit.startDate) return false;
  return habit.frequency !== "weekdays"
    || (habit.weekdays ?? []).includes(date.getDay());
}

function habitSummary(habits, period) {
  const days = enumerateDays(period, 3700);
  let planned = 0;
  let completed = 0;
  const byDay = Array(7).fill(0).map(() => ({ planned: 0, completed: 0 }));
  habits.forEach((habit) => days.forEach((day) => {
    if (!scheduled(habit, day)) return;
    planned += 1;
    byDay[parseLocalDate(day).getDay()].planned += 1;
    if ((habit.completions ?? []).includes(day)) {
      completed += 1;
      byDay[parseLocalDate(day).getDay()].completed += 1;
    }
  }));
  return {
    planned,
    completed,
    rate: planned ? Math.round((completed / planned) * 100) : 0,
    regularDays: byDay.map((item, index) => ({
      day: index,
      rate: item.planned ? Math.round((item.completed / item.planned) * 100) : 0,
    })),
  };
}

function goalSummary(goals, period, today) {
  const inRange = goals.filter((goal) => inPeriod(goal.createdAt, period)
    || inPeriod(goal.updatedAt, period)
    || inPeriod(goal.completedAt, period));
  const statuses = Object.fromEntries(
    ["not_started", "in_progress", "paused", "completed"]
      .map((status) => [status, goals.filter((goal) => goal.status === status).length])
  );
  return {
    total: goals.length,
    statuses,
    overdue: goals.filter((goal) =>
      goal.dueDate && goal.dueDate < today && goal.status !== "completed").length,
    averageProgress: goals.length
      ? Math.round(goals.reduce((sum, goal) => sum + Number(goal.progress || 0), 0)
        / goals.length)
      : 0,
    completedInPeriod: goals.filter((goal) => inPeriod(goal.completedAt, period)).length,
    stepsCompleted: inRange.reduce((sum, goal) =>
      sum + (goal.steps ?? []).filter((step) => step.completed).length, 0),
  };
}

function calendarSummary(events, period, today) {
  const filtered = events.filter((event) => inPeriod(event.date, period));
  const categories = {};
  const priorities = {};
  filtered.forEach((event) => {
    categories[event.category ?? "other"] = (categories[event.category ?? "other"] ?? 0) + 1;
    priorities[event.priority ?? "medium"] = (priorities[event.priority ?? "medium"] ?? 0) + 1;
  });
  return {
    total: filtered.length,
    passed: filtered.filter((event) => event.date < today).length,
    recurring: filtered.filter((event) => event.recurrence !== "none").length,
    categories,
    priorities,
    upcoming: events.filter((event) => event.date >= today)
      .sort((a, b) => `${a.date}${a.time ?? ""}`.localeCompare(`${b.date}${b.time ?? ""}`))
      .slice(0, 3),
  };
}

function diarySummary(entries, period) {
  const filtered = entries.filter((entry) => inPeriod(dateOf(entry), period));
  const days = new Set(filtered.map(dateOf));
  const hours = {};
  filtered.forEach((entry) => {
    const hour = String(entry.createdAt ?? "").slice(11, 13);
    if (/^\d{2}$/.test(hour)) hours[hour] = (hours[hour] ?? 0) + 1;
  });
  return {
    entries: filtered.length,
    days: days.size,
    favorites: filtered.filter((entry) => entry.favorite ?? entry.favorito).length,
    commonHours: Object.entries(hours).sort((a, b) => b[1] - a[1]).slice(0, 3),
  };
}

function favoritesSummary(favorites, period) {
  const filtered = favorites.filter((item) => inPeriod(item.createdAt, period));
  const types = {};
  const tags = {};
  favorites.forEach((item) => {
    types[item.type ?? "custom"] = (types[item.type ?? "custom"] ?? 0) + 1;
    (item.tags ?? []).forEach((tag) => { tags[tag] = (tags[tag] ?? 0) + 1; });
  });
  return {
    total: favorites.length,
    added: filtered.length,
    pinned: favorites.filter((item) => item.pinned).length,
    primary: favorites.filter((item) => item.primary).length,
    types,
    topTags: Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 5),
  };
}

export function buildMomentMap(data, year, module = "all") {
  const map = new Map();
  const add = (date, kind, id) => {
    const key = String(date ?? "").slice(0, 10);
    if (!key.startsWith(`${year}-`) || (module !== "all" && module !== kind)) return;
    const entry = map.get(key) ?? { date: key, items: [], modules: new Set() };
    const unique = `${kind}:${id ?? key}`;
    if (!entry.items.some((item) => item.unique === unique)) {
      entry.items.push({ unique, kind });
      entry.modules.add(kind);
    }
    map.set(key, entry);
  };
  data.diary.forEach((item) => add(dateOf(item), "diary", item.id));
  data.calendar.forEach((item) => add(item.date, "calendar", item.id));
  data.favorites.forEach((item) => add(item.createdAt, "favorites", item.id));
  data.goals.forEach((item) => {
    add(item.updatedAt, "goals", item.id);
    if (item.completedAt) add(item.completedAt, "goals", `${item.id}:done`);
  });
  data.habits.forEach((item) =>
    (item.completions ?? []).forEach((date) => add(date, "habits", item.id)));
  return [...map.values()].map((entry) => ({
    date: entry.date,
    intensity: Math.min(4, entry.items.length),
    count: entry.items.length,
    modules: [...entry.modules],
  })).sort((a, b) => a.date.localeCompare(b.date));
}

function activeDays(data, period) {
  const days = new Set();
  [data.diary, data.calendar, data.favorites, data.goals].flat()
    .forEach((item) => {
      const date = dateOf(item);
      if (inPeriod(date, period)) days.add(date);
    });
  data.habits.forEach((habit) => (habit.completions ?? [])
    .filter((date) => inPeriod(date, period)).forEach((date) => days.add(date)));
  return days.size;
}

export function calculateStatistics(data, period, reference = new Date()) {
  const today = localDateKey(reference);
  const previous = previousPeriod(period);
  const habits = habitSummary(data.habits, period);
  const previousHabits = habitSummary(data.habits, previous);
  const currentActive = activeDays(data, period);
  const previousActive = activeDays(data, previous);
  return {
    period,
    habits,
    habitComparison: habits.planned >= 3 && previousHabits.planned >= 3
      ? habits.rate - previousHabits.rate
      : null,
    goals: goalSummary(data.goals, period, today),
    calendar: calendarSummary(data.calendar, period, today),
    diary: diarySummary(data.diary, period),
    favorites: favoritesSummary(data.favorites, period),
    general: {
      activeDays: currentActive,
      modulesUsed: [
        data.diary.length && "diary",
        data.calendar.length && "calendar",
        data.favorites.length && "favorites",
        data.goals.length && "goals",
        data.habits.length && "habits",
      ].filter(Boolean).length,
      comparison: currentActive >= 3 && previousActive >= 3
        ? currentActive - previousActive
        : null,
      sampleSufficient: currentActive >= 3,
    },
  };
}
