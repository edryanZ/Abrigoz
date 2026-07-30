import { useCallback, useMemo, useState } from "react";

import {
  addGoalStep,
  deleteGoal,
  filterGoals,
  loadGoals,
  removeGoalStep,
  saveGoal,
  setGoalCompleted,
  toggleGoalStep,
} from "../services/goalsService";

export default function useGoals() {
  const [items, setItems] = useState(() => loadGoals().items);
  const [filters, setFilters] = useState({
    query: "",
    status: "all",
    category: "all",
    priority: "all",
    order: "due",
  });
  const refresh = useCallback(() => setItems(loadGoals().items), []);
  const run = useCallback((operation) => {
    const result = operation();
    refresh();
    return result;
  }, [refresh]);

  return {
    allItems: items,
    items: useMemo(() => filterGoals(items, filters), [filters, items]),
    filters,
    categories: useMemo(
      () => [...new Set(items.map((goal) => goal.category))].sort(),
      [items]
    ),
    setFilter: (key, value) =>
      setFilters((current) => ({ ...current, [key]: value })),
    save: (goal) => run(() => saveGoal(goal)),
    remove: (id) => run(() => deleteGoal(id)),
    complete: (id, completed) =>
      run(() => setGoalCompleted(id, completed)),
    addStep: (id, title) => run(() => addGoalStep(id, title)),
    toggleStep: (goalId, stepId) =>
      run(() => toggleGoalStep(goalId, stepId)),
    removeStep: (goalId, stepId) =>
      run(() => removeGoalStep(goalId, stepId)),
  };
}
