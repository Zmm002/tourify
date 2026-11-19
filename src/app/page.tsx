import { TourifyHome } from "@/components/tourify-home";
import { tourifyDestinations } from "@/lib/booking-types";

// Halaman awal menampilkan landing page dengan katalog wahana bawaan.
export default function Home() {
  return <TourifyHome destinations={tourifyDestinations} />;
}
