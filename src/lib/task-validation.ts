import { z } from "zod";

// Bentuk satu item checklist supaya isi tugas tetap teratur.
const checklistItem = z.object({
  id: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(180),
  done: z.boolean(),
});

// Aturan untuk tugas baru, termasuk nilai awal saat field opsional kosong.
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Judul tugas wajib diisi.").max(160),
  description: z.string().trim().max(4000).default(""),
  project: z.string().trim().min(1).max(80).default("My workspace"),
  category: z.string().trim().min(1).max(40).default("Personal"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  dueDate: z.string().datetime({ offset: true }).nullable().optional(),
  checklist: z.array(checklistItem).max(20).default([]),
  accent: z.enum(["coral", "blue", "yellow", "mint", "lilac"]).default("coral"),
});

// Saat mengedit, semua field boleh tidak dikirim kecuali yang berubah.
export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime({ offset: true }).nullable().optional(),
});

// Profil admin saat ini hanya mengizinkan perubahan nama.
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter.").max(80),
});
