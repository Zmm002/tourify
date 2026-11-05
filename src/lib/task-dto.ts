import type { Task } from "@/generated/prisma/client";
import type { ChecklistItem, TaskDTO } from "@/lib/task-types";

function normalizeChecklist(value: Task["checklist"]): ChecklistItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const item = entry as Record<string, unknown>;
    if (typeof item.label !== "string" || typeof item.done !== "boolean") return [];
    return [{
      id: typeof item.id === "string" ? item.id : `item-${index}`,
      label: item.label,
      done: item.done,
    }];
  });
}

export function toTaskDTO(task: Task): TaskDTO {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    project: task.project,
    category: task.category,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate?.toISOString() ?? null,
    checklist: normalizeChecklist(task.checklist),
    accent: task.accent,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    completedAt: task.completedAt?.toISOString() ?? null,
  };
}
