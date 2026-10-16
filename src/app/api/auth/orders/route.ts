import { NextRequest, NextResponse } from "next/server";
import { getWpBaseUrl, getWpAuthHeaders } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paramUserId = searchParams.get("user_id");
    const cookieUserId = request.cookies.get("ll_user_id")?.value;
    const limit = searchParams.get("limit") || "20";
    const page = searchParams.get("page") || "1";

    const userId = paramUserId || cookieUserId;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not authenticated." },
        { status: 401 }
      );
    }

    const res = await fetch(
      `${getWpBaseUrl()}/wp-json/nextjs-helper/v1/customer/orders?user_id=${encodeURIComponent(
        userId
      )}&limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`,
      {
        headers: getWpAuthHeaders(),
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to retrieve orders." },
        { status: res.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data.orders || [],
    });
  } catch (err: any) {
    console.error("Get orders error:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching orders." },
      { status: 500 }
    );
  }
}
