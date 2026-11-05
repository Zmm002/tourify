import { TourifyHome } from "@/components/tourify-home";
import { tourifyDestinations } from "@/lib/booking-types";

export default function Home() {
  return <TourifyHome destinations={tourifyDestinations} />;
}
