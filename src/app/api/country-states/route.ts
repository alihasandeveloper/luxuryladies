import { NextResponse } from "next/server";
import { getCountryStates, getStoreDefaultCountry } from "@/lib/woocommerce";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || (await getStoreDefaultCountry());
    const states = await getCountryStates(country);
    return NextResponse.json({ success: true, country, states });
  } catch (error: any) {
    console.error("Failed to fetch states in API route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load states" },
      { status: 500 }
    );
  }
}
