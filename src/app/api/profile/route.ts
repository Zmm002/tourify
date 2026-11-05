import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/security";
import { updateProfileSchema } from "@/lib/task-validation";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk mengubah profil." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Nama tidak valid." }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true, image: true },
  });

  return Response.json({ user }, { headers: { "Cache-Control": "private, no-store" } });
}
