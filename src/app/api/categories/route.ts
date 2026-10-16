import { NextResponse } from "next/server";
import { getCategories } from "@/lib/woocommerce";

export const revalidate = 60;

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error in /api/categories:", error);
    return NextResponse.json({ success: false, data: [] }, { status: 500 });
  }
}
