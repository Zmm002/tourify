import { z } from "zod";

const visitDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal kunjungan tidak valid.").refine((value) => {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Tanggal kunjungan tidak valid.");

export const createBookingSchema = z.object({
  customerName: z.string().trim().min(2, "Nama pelanggan minimal 2 karakter.").max(100),
  customerEmail: z.email("Alamat email tidak valid.").max(254),
  customerPhone: z.string().trim().max(30).optional().default(""),
  destinationSlug: z.string().trim().min(2).max(48).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  visitDate,
  ticketCount: z.number().int().min(1).max(20),
  paymentStatus: z.enum(["UNPAID", "PAID"]).default("UNPAID"),
});

export const createDestinationSchema = z.object({
  name: z.string().trim().min(2, "Nama wahana minimal 2 karakter.").max(100),
  area: z.string().trim().min(2, "Lokasi minimal 2 karakter.").max(100),
  category: z.string().trim().min(2, "Pilih atau isi kategori wahana.").max(60),
  description: z.string().trim().max(500).optional().default(""),
  price: z.number().int().min(1000, "Harga minimal Rp1.000.").max(50000000, "Harga maksimal Rp50.000.000."),
  image: z.string().trim().max(500).optional().default("").refine((value) => !value || (value.startsWith("https://") && z.url().safeParse(value).success), "Foto harus menggunakan tautan HTTPS."),
});

export const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["UNPAID", "PAID", "REFUNDED"]).optional(),
}).refine((value) => Object.keys(value).length > 0, "Pilih perubahan yang ingin disimpan.");
