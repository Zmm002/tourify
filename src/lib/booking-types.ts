// Status transaksi yang dipakai bersama oleh API dan tampilan admin.
export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

// Bentuk booking yang dikirim API ke antarmuka, dengan tanggal sebagai teks.
export type BookingDTO = {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  destinationSlug: string;
  destinationName: string;
  visitDate: string;
  ticketCount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

// Data yang dibutuhkan untuk membuat booking baru dari panel admin.
export type BookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  destinationSlug: string;
  visitDate: string;
  ticketCount: number;
  paymentStatus?: PaymentStatus;
};

// Data satu wahana yang tampil di katalog publik dan panel admin.
export type TourifyDestination = {
  slug: string;
  name: string;
  area: string;
  price: number;
  image: string;
  category: string;
  id?: string;
  description?: string;
  weekdayHours?: string;
  weekendHours?: string;
};

// Isian yang diterima saat admin menambahkan wahana.
export type DestinationInput = {
  name: string;
  area: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
};

// Katalog awal yang dipakai landing page sebelum ada wahana buatan admin.
export const tourifyDestinations: TourifyDestination[] = [
  {
    slug: "pantai-tourify",
    name: "Pantai Tourify",
    area: "Zona Pesisir",
    price: 35000,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=85",
    category: "Jelajah pantai",
    weekdayHours: "Setiap hari · 06.00–24.00",
    description: "Nikmati udara laut, jalan santai di tepi pantai, dan habiskan waktu bersama keluarga di Zona Pesisir Tourify.",
  },
  {
    slug: "wahana-fantasi",
    name: "Wahana Fantasi",
    area: "Zona Petualangan",
    price: 275000,
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1000&q=82",
    category: "Wahana keluarga",
    weekdayHours: "Senin–Jumat · 10.00–18.00",
    weekendHours: "Akhir pekan · 10.00–20.00",
    description: "Kumpulan permainan dan wahana untuk pengunjung yang ingin mencoba lebih banyak hal dalam satu hari.",
  },
  {
    slug: "taman-burung",
    name: "Taman Burung",
    area: "Zona Satwa",
    price: 60000,
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?auto=format&fit=crop&w=1200&q=85",
    category: "Jelajah satwa",
    weekdayHours: "Senin–Jumat · 09.00–17.00",
    weekendHours: "Akhir pekan · 09.00–18.00",
    description: "Kenali beragam burung dan habitatnya lewat pengalaman rekreasi yang menyenangkan untuk semua usia.",
  },
];

// Mengubah tanggal database menjadi format teks yang aman dikirim sebagai JSON.
export function toBookingDTO(booking: {
  id: string;
  code: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  destinationSlug: string;
  destinationName: string;
  visitDate: Date;
  ticketCount: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: Date;
}): BookingDTO {
  return {
    ...booking,
    visitDate: booking.visitDate.toISOString(),
    createdAt: booking.createdAt.toISOString(),
  };
}
