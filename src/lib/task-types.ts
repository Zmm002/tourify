export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type TaskDTO = {
  id: string;
  title: string;
  description: string;
  project: string;
  category: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  checklist: ChecklistItem[];
  accent: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
};

export type TaskInput = {
  title: string;
  description?: string;
  project?: string;
  category?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
  checklist?: ChecklistItem[];
  accent?: string;
};
