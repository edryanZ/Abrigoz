import STORAGE_KEYS from "../../../core/constants/storageKeys";
import { storage } from "../../../core/storage/storage";
import { emitSync } from "../../../core/sync";

export const GOALS_VERSION = 1;
export const GOAL_STATUSES = {
  not_started: "Não iniciada",
  in_progress: "Em andamento",
  completed: "Concluída",
  paused: "Pausada",
};

export function clampProgress(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(100, Math.max(0, Math.round(numeric)));
}

function normalizeSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps.map((step) => ({
    id: String(step.id ?? crypto.randomUUID()),
    title: String(step.title ?? step.titulo ?? "").trim(),
    completed: Boolean(step.completed ?? step.concluida),
  })).filter((step) => step.title);
}

function normalizeGoal(goal) {
  const now = new Date().toISOString();
  const status = GOAL_STATUSES[goal.status] ? goal.status : "not_started";
  return {
    id: String(goal.id ?? crypto.randomUUID()),
    title: String(goal.title ?? goal.titulo ?? "Meta sem título").trim(),
    description: String(goal.description ?? goal.descricao ?? ""),
    category: String(goal.category ?? goal.categoria ?? "Pessoal").trim(),
    startDate: goal.startDate ?? goal.dataInicial ?? now.slice(0, 10),
    dueDate: goal.dueDate ?? goal.prazo ?? "",
    priority: ["low", "medium", "high"].includes(goal.priority)
      ? goal.priority
      : "medium",
    progress: status === "completed" ? 100 : clampProgress(goal.progress),
    status,
    steps: normalizeSteps(goal.steps ?? goal.etapas),
    notes: String(goal.notes ?? goal.observacoes ?? ""),
    completedAt: goal.completedAt ?? goal.dataConclusao ?? null,
    createdAt: goal.createdAt ?? now,
    updatedAt: goal.updatedAt ?? now,
  };
}

function migrate(raw) {
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.items) ? raw.items : [];
  return { version: GOALS_VERSION, items: items.map(normalizeGoal) };
}

function persist(data) {
  if (!storage.set(STORAGE_KEYS.GOALS, data)) {
    throw new Error("Não foi possível salvar suas metas.");
  }
}

export function loadGoals() {
  const raw = storage.get(STORAGE_KEYS.GOALS);
  const migrated = migrate(raw);
  if (raw?.version !== GOALS_VERSION) persist(migrated);
  return migrated;
}

export function saveGoal(input) {
  const data = loadGoals();
  const title = String(input.title ?? "").trim();
  if (!title) throw new Error("O título é obrigatório.");
  const existing = data.items.find((goal) => goal.id === input.id);
  const goal = normalizeGoal({
    ...existing,
    ...input,
    title,
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  data.items = existing
    ? data.items.map((item) => item.id === goal.id ? goal : item)
    : [goal, ...data.items];
  persist(data);
  emitSync({
    module: "goals",
    action: existing ? "update" : "create",
    recordId: goal.id,
  });
  return goal;
}

export function deleteGoal(id) {
  const data = loadGoals();
  if (!data.items.some((goal) => goal.id === id)) return false;
  data.items = data.items.filter((goal) => goal.id !== id);
  persist(data);
  emitSync({ module: "goals", action: "delete", recordId: id });
  return true;
}

export function setGoalCompleted(id, completed) {
  const goal = loadGoals().items.find((item) => item.id === id);
  if (!goal) return null;
  return saveGoal({
    ...goal,
    status: completed ? "completed" : "in_progress",
    progress: completed ? 100 : goal.progress,
    completedAt: completed
      ? (goal.completedAt ?? new Date().toISOString())
      : goal.completedAt,
  });
}

export function addGoalStep(id, title) {
  const goal = loadGoals().items.find((item) => item.id === id);
  if (!goal || !title.trim()) return null;
  return saveGoal({
    ...goal,
    steps: [...goal.steps, {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
    }],
  });
}

export function toggleGoalStep(goalId, stepId) {
  const goal = loadGoals().items.find((item) => item.id === goalId);
  if (!goal) return null;
  const steps = goal.steps.map((step) =>
    step.id === stepId ? { ...step, completed: !step.completed } : step
  );
  const completedSteps = steps.filter((step) => step.completed).length;
  const progress = steps.length
    ? Math.round((completedSteps / steps.length) * 100)
    : goal.progress;
  return saveGoal({ ...goal, steps, progress });
}

export function removeGoalStep(goalId, stepId) {
  const goal = loadGoals().items.find((item) => item.id === goalId);
  if (!goal) return null;
  return saveGoal({
    ...goal,
    steps: goal.steps.filter((step) => step.id !== stepId),
  });
}

export function isGoalOverdue(goal, today = new Date()) {
  if (!goal.dueDate || goal.status === "completed") return false;
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
  return goal.dueDate < todayKey;
}

export function filterGoals(items, filters = {}) {
  const query = (filters.query ?? "").trim().toLocaleLowerCase("pt-BR");
  return items
    .filter((goal) => {
      const searchable = `${goal.title} ${goal.description} ${goal.notes}`
        .toLocaleLowerCase("pt-BR");
      return (!query || searchable.includes(query))
        && (!filters.status || filters.status === "all"
          || goal.status === filters.status)
        && (!filters.category || filters.category === "all"
          || goal.category === filters.category)
        && (!filters.priority || filters.priority === "all"
          || goal.priority === filters.priority);
    })
    .sort((first, second) => {
      if (filters.order === "progress") return second.progress - first.progress;
      if (filters.order === "created") {
        return second.createdAt.localeCompare(first.createdAt);
      }
      return (first.dueDate || "9999-12-31")
        .localeCompare(second.dueDate || "9999-12-31");
    });
}
