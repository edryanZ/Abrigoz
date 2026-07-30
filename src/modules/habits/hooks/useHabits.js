import { useCallback, useMemo, useState } from "react";

import {
  deleteHabit,
  loadHabits,
  saveHabit,
  setHabitArchived,
  toggleHabitCompletion,
} from "../services/habitsService";

export default function useHabits() {
  const [items, setItems] = useState(() => loadHabits().items);
  const [filter, setFilter] = useState("active");
  const refresh = useCallback(() => setItems(loadHabits().items), []);
  const run = useCallback((operation) => {
    const result = operation();
    refresh();
    return result;
  }, [refresh]);

  return {
    allItems: items,
    items: useMemo(
      () => items.filter((habit) =>
        filter === "archived" ? habit.archived : !habit.archived),
      [filter, items]
    ),
    filter,
    setFilter,
    save: (habit) => run(() => saveHabit(habit)),
    remove: (id) => run(() => deleteHabit(id)),
    archive: (id, archived) =>
      run(() => setHabitArchived(id, archived)),
    toggle: (id, date) =>
      run(() => toggleHabitCompletion(id, date)),
  };
}
