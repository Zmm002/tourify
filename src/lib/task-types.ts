// Nilai status dan prioritas yang digunakan di seluruh fitur tugas.
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

// Satu baris centang yang disimpan di dalam tugas.
export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
};

// Bentuk tugas yang dikirim dari server ke komponen antarmuka.
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

// Data yang bisa dikirim saat membuat atau memperbarui tugas.
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
