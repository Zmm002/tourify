import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toTaskDTO } from "@/lib/task-dto";
import { isSameOriginMutation } from "@/lib/security";
import { updateTaskSchema } from "@/lib/task-validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ taskId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk mengubah tugas." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateTaskSchema.safeParse(body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    return Response.json({ error: parsed.success ? "Tidak ada perubahan." : parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const { taskId } = await params;
  const data = { ...parsed.data };
  const task = await prisma.task.updateMany({
    where: { id: taskId, userId: session.user.id },
    data: {
      ...data,
      dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null,
      checklist: data.checklist === undefined ? undefined : data.checklist as Prisma.InputJsonValue,
      completedAt: data.completedAt === undefined
        ? data.status === "DONE" ? new Date() : data.status ? null : undefined
        : data.completedAt ? new Date(data.completedAt) : null,
    },
  });

  if (task.count === 0) return Response.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  const updated = await prisma.task.findFirst({ where: { id: taskId, userId: session.user.id } });
  if (!updated) return Response.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  return Response.json({ task: toTaskDTO(updated) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk menghapus tugas." }, { status: 401 });

  const { taskId } = await params;
  const deleted = await prisma.task.deleteMany({ where: { id: taskId, userId: session.user.id } });
  if (deleted.count === 0) return Response.json({ error: "Tugas tidak ditemukan." }, { status: 404 });
  return new Response(null, { status: 204, headers: { "Cache-Control": "private, no-store" } });
}
