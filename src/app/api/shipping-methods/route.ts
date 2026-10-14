import { NextResponse } from "next/server";
import { getShippingMethods } from "@/lib/woocommerce";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district") || searchParams.get("state") || "";
    const country = searchParams.get("country") || "";
    const shippingMethods = await getShippingMethods(district, country);
    return NextResponse.json({ success: true, shippingMethods });
  } catch (error: any) {
    console.error("Failed to fetch Shipping options in API route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load Shipping options" },
      { status: 500 }
    );
  }
}
