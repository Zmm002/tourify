import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/security";
import { toBookingDTO } from "@/lib/booking-types";
import { updateBookingSchema } from "@/lib/booking-validation";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ bookingId: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk memperbarui pemesanan." }, { status: 401 });

  const { bookingId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateBookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Data pemesanan tidak valid." }, { status: 400 });
  }

  const result = await prisma.booking.updateMany({
    where: { id: bookingId, ownerId: session.user.id },
    data: parsed.data,
  });
  if (result.count === 0) return Response.json({ error: "Pemesanan tidak ditemukan." }, { status: 404 });

  const booking = await prisma.booking.findFirst({ where: { id: bookingId, ownerId: session.user.id } });
  if (!booking) return Response.json({ error: "Pemesanan tidak ditemukan." }, { status: 404 });
  return Response.json({ booking: toBookingDTO(booking) }, { headers: { "Cache-Control": "private, no-store" } });
}
