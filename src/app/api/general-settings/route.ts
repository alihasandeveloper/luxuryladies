import { NextResponse } from "next/server";
import { getGeneralSettings } from "@/lib/woocommerce";

export async function GET() {
  const settings = await getGeneralSettings();
  if (!settings) {
    return NextResponse.json({ success: false, data: null }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: settings });
}
