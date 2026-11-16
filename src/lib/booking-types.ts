export type BookingStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

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

export type BookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  destinationSlug: string;
  visitDate: string;
  ticketCount: number;
  paymentStatus?: PaymentStatus;
};

export type TourifyDestination = {
  slug: string;
  name: string;
  area: string;
  price: number;
  image: string;
  category: string;
  id?: string;
  description?: string;
};

export type DestinationInput = {
  name: string;
  area: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
};

export const tourifyDestinations: TourifyDestination[] = [
  {
    slug: "kolam-ombak",
    name: "Kolam Ombak",
    area: "Zona Air",
    price: 100000,
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=1000&q=82",
    category: "Wahana air",
    description: "Rasakan suasana pantai tropis dan ombak yang datang bergantian. Kolam Ombak cocok buat seru-seruan bareng keluarga atau teman tanpa harus jauh dari area taman.",
  },
  {
    slug: "komidi-putar",
    name: "Komidi Putar",
    area: "Zona Keluarga",
    price: 150000,
    image: "https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?auto=format&fit=crop&w=1000&q=82",
    category: "Wahana keluarga",
    description: "Naik komidi putar dengan lampu dan musik yang meriah. Wahana santai ini pas untuk pengunjung kecil maupun keluarga yang ingin menikmati suasana taman bersama.",
  },
  {
    slug: "seluncur-air",
    name: "Seluncur Air",
    area: "Zona Air",
    price: 125000,
    image: "https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1000&q=82",
    category: "Wahana air",
    description: "Meluncur melewati lintasan air dan mendarat dengan cipratan yang menyegarkan. Seluncur Air jadi pilihan buat kamu yang ingin aktivitas lebih menantang di Zona Air.",
  },
  {
    slug: "taman-rekreasi",
    name: "Taman Rekreasi",
    area: "Area Outdoor",
    price: 180000,
    image: "/tourify-coast-hero.png",
    category: "Area santai",
    description: "Beristirahat sejenak sambil menikmati pemandangan dan suasana terbuka. Taman Rekreasi memberi ruang untuk berjalan santai, berkumpul, atau sekadar menikmati waktu bersama.",
  },
];

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
