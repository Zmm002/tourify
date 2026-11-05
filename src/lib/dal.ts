import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toTaskDTO } from "@/lib/task-dto";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getWorkspaceData() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    take: 100,
  });

  return {
    user: { id: session.user.id, name: session.user.name, email: session.user.email, image: session.user.image ?? null },
    tasks: tasks.map(toTaskDTO),
  };
}
