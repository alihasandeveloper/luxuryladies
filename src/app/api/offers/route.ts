import { NextResponse } from "next/server";
import { getOffers } from "@/lib/woocommerce";

export const revalidate = 60;

export async function GET() {
  try {
    const offers = await getOffers();
    return NextResponse.json({ success: true, data: offers });
  } catch (error) {
    console.error("Error in /api/offers:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
