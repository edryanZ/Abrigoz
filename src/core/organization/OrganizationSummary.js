import STORAGE_KEYS from "../constants/storageKeys";
import { storage } from "../storage/storage";

function dateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function addDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function listFromStorage(key) {
  const value = storage.get(key);
  if (Array.isArray(value)) return value;
  return Array.isArray(value?.items) ? value.items : [];
}

function eventOccursOn(event, candidate) {
  if (!event.date && event.dia && event.mes) {
    return candidate.getDate() === Number(event.dia)
      && candidate.getMonth() + 1 === Number(event.mes);
  }
  const start = new Date(`${event.date}T12:00:00`);
  if (Number.isNaN(start.getTime()) || dateKey(candidate) < event.date) {
    return false;
  }
  if (event.recurrenceEnd && dateKey(candidate) > event.recurrenceEnd) return false;
  const candidateKey = dateKey(candidate);
  if (event.excludedDates?.includes(candidateKey)) return false;
  const recurrence = event.recurrence ?? "none";
  const candidateDate = new Date(`${candidateKey}T12:00:00`);
  const days = Math.round((candidateDate - start) / 86400000);
  if (recurrence === "daily") return true;
  if (recurrence === "weekly") return days % 7 === 0;
  if (recurrence === "monthly") return candidate.getDate() === start.getDate();
  if (recurrence === "yearly") {
    return candidate.getDate() === start.getDate()
      && candidate.getMonth() === start.getMonth();
  }
  return candidateKey === event.date;
}

function calendarSummary(today) {
  const events = listFromStorage(STORAGE_KEYS.EVENTS);
  const todayEvents = events.filter((event) => eventOccursOn(event, today));
  let next = null;
  for (let offset = 0; offset <= 366 && !next; offset += 1) {
    const candidate = addDays(today, offset);
    const event = events
      .filter((item) => eventOccursOn(item, candidate))
      .sort((first, second) =>
        (first.time || "23:59").localeCompare(second.time || "23:59"))[0];
    if (event) {
      next = {
        title: event.title ?? event.titulo,
        date: dateKey(candidate),
        time: event.allDay ? "" : event.time,
      };
    }
  }
  return { todayCount: todayEvents.length, next };
}

function favoritesSummary() {
  const items = listFromStorage(STORAGE_KEYS.FAVORITE_ITEMS);
  return [...items].sort((first, second) => {
    if (first.pinned !== second.pinned) return first.pinned ? -1 : 1;
    return second.createdAt.localeCompare(first.createdAt);
  }).slice(0, 3).map((item) => ({
    id: item.id,
    title: item.title,
    pinned: item.pinned,
  }));
}

function goalsSummary(today) {
  const items = listFromStorage(STORAGE_KEYS.GOALS);
  const active = items.filter((goal) => goal.status === "in_progress");
  const soonLimit = dateKey(addDays(today, 7));
  const dueSoon = items.filter((goal) =>
    goal.status !== "completed"
    && goal.dueDate
    && goal.dueDate >= dateKey(today)
    && goal.dueDate <= soonLimit
  ).length;
  const progress = items.length
    ? Math.round(items.reduce((sum, goal) => sum + Number(goal.progress || 0), 0)
      / items.length)
    : 0;
  return { active: active.length, dueSoon, progress };
}

function habitScheduled(habit, today) {
  if (habit.archived || dateKey(today) < habit.startDate) return false;
  return habit.frequency !== "weekdays" || habit.weekdays.includes(today.getDay());
}

function currentHabitStreak(habit, today) {
  const completed = new Set(habit.completions);
  let streak = 0;
  let cursor = today;
  for (let index = 0; index < 3660; index += 1) {
    if (habitScheduled({ ...habit, archived: false }, cursor)) {
      if (!completed.has(dateKey(cursor))) break;
      streak += 1;
    }
    cursor = addDays(cursor, -1);
    if (dateKey(cursor) < habit.startDate) break;
  }
  return streak;
}

function habitsSummary(today) {
  const habits = listFromStorage(STORAGE_KEYS.HABITS);
  const scheduled = habits.filter((habit) => habitScheduled(habit, today));
  const todayKey = dateKey(today);
  return {
    total: scheduled.length,
    completed: scheduled.filter((habit) =>
      habit.completions.includes(todayKey)).length,
    highlightStreak: habits.reduce(
      (longest, habit) => Math.max(longest, currentHabitStreak(habit, today)),
      0
    ),
  };
}

export function getOrganizationSummary(today = new Date()) {
  return {
    calendar: calendarSummary(today),
    favorites: favoritesSummary(),
    goals: goalsSummary(today),
    habits: habitsSummary(today),
  };
}
