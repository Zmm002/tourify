import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/security";
import { createBookingSchema } from "@/lib/booking-validation";
import { toBookingDTO, tourifyDestinations } from "@/lib/booking-types";

export const runtime = "nodejs";

// Mengambil daftar booking yang hanya dimiliki akun admin yang sedang masuk.
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk melihat pemesanan." }, { status: 401 });

  const bookings = await prisma.booking.findMany({
    where: { ownerId: session.user.id },
    orderBy: [{ createdAt: "desc" }],
    take: 500,
  });

  return Response.json({ bookings: bookings.map(toBookingDTO) }, { headers: { "Cache-Control": "private, no-store" } });
}

// Membuat booking: memeriksa input, mencocokkan wahana, lalu menyimpan total tiket.
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return Response.json({ error: "Permintaan ditolak." }, { status: 403 });
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "Silakan masuk untuk membuat pemesanan." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Data pemesanan tidak valid." }, { status: 400 });
  }

  const catalogDestination = tourifyDestinations.find((item) => item.slug === parsed.data.destinationSlug);
  const customDestination = catalogDestination ? null : await prisma.destination.findFirst({
    where: { ownerId: session.user.id, slug: parsed.data.destinationSlug },
  });
  const destination = catalogDestination ?? (customDestination ? {
    slug: customDestination.slug,
    name: customDestination.name,
    price: customDestination.price,
  } : null);
  if (!destination) return Response.json({ error: "Wahana tidak ditemukan." }, { status: 400 });

  const code = `TF-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString("hex").toUpperCase()}`;
  const booking = await prisma.booking.create({
    data: {
      code,
      ownerId: session.user.id,
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone || null,
      destinationSlug: destination.slug,
      destinationName: destination.name,
      visitDate: new Date(`${parsed.data.visitDate}T12:00:00+07:00`),
      ticketCount: parsed.data.ticketCount,
      totalAmount: destination.price * parsed.data.ticketCount,
      paymentStatus: parsed.data.paymentStatus,
    },
  });

  return Response.json({ booking: toBookingDTO(booking) }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
