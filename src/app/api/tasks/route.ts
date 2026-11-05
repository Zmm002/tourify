import { headers } from "next/headers";
import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toTaskDTO } from "@/lib/task-dto";
import { isSameOriginMutation } from "@/lib/security";
import { createTaskSchema } from "@/lib/task-validation";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk melihat tugas." }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return Response.json({ tasks: tasks.map(toTaskDTO) }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk membuat tugas." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Data tugas tidak valid." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      checklist: parsed.data.checklist as Prisma.InputJsonValue,
      userId: session.user.id,
      completedAt: parsed.data.status === "DONE" ? new Date() : null,
    },
  });

  return Response.json({ task: toTaskDTO(task) }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
