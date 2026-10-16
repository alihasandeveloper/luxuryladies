import { Metadata } from "next";
import TrackOrderView from "@/components/TrackOrderView";

export const metadata: Metadata = {
  title: "Track Your Order | Luxury Ladies",
  description: "Check the real-time shipping and delivery status of your order.",
};

export default function TrackOrderPage() {
  return <TrackOrderView />;
}
