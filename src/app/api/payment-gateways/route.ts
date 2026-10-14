import { NextResponse } from "next/server";
import { getPaymentGateways } from "@/lib/woocommerce";

export async function GET() {
  try {
    const gateways = await getPaymentGateways();
    return NextResponse.json({ success: true, gateways });
  } catch (error: any) {
    console.error("Failed to fetch payment gateways in API route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load Payment options" },
      { status: 500 }
    );
  }
}
