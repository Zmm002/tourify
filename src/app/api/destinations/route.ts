import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createDestinationSchema } from "@/lib/booking-validation";
import { tourifyDestinations } from "@/lib/booking-types";
import { isSameOriginMutation } from "@/lib/security";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk melihat katalog wahana." }, { status: 401 });

  const customDestinations = await prisma.destination.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return Response.json({ destinations: [...tourifyDestinations, ...customDestinations] }, {
    headers: { "Cache-Control": "private, no-store" },
  });
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk menambahkan wahana." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createDestinationSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Data wahana tidak valid." }, { status: 400 });
  }

  const baseSlug = parsed.data.name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 38) || "wahana";
  const slug = `${baseSlug}-${randomBytes(3).toString("hex")}`;
  const destination = await prisma.destination.create({
    data: {
      ownerId: session.user.id,
      slug,
      name: parsed.data.name,
      area: parsed.data.area,
      category: parsed.data.category,
      description: parsed.data.description,
      price: parsed.data.price,
      image: parsed.data.image || "/tourify-coast-hero.png",
    },
  });

  return Response.json({ destination }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
