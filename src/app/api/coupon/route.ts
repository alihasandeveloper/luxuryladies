import { NextResponse } from "next/server";
import { verifyWooCommerceCoupon } from "@/lib/woocommerce";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, subtotal } = body || {};

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid coupon code." },
        { status: 400 }
      );
    }

    const result = await verifyWooCommerceCoupon(
      code.trim(),
      typeof subtotal === "number" ? subtotal : 0
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Coupon verification API error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to verify coupon code.",
      },
      { status: 500 }
    );
  }
}
