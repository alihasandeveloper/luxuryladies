import { NextRequest, NextResponse } from "next/server";
import { getWpBaseUrl, getWpAuthHeaders } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const cookieUserId = request.cookies.get("ll_user_id")?.value;
    const authToken = request.cookies.get("ll_auth_token")?.value;

    if (!cookieUserId || !authToken) {
      return NextResponse.json(
        { success: false, message: "User not authenticated." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paramUserId = searchParams.get("user_id");

    // Prevent IDOR: If paramUserId is specified, it MUST match the authenticated user
    if (paramUserId && paramUserId !== cookieUserId) {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const userId = cookieUserId;

    const res = await fetch(
      `${getWpBaseUrl()}/wp-json/nextjs-helper/v1/customer/profile?user_id=${encodeURIComponent(userId)}`,
      {
        headers: getWpAuthHeaders(),
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to retrieve profile." },
        { status: res.status || 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (err: any) {
    console.error("Get user error:", err);
    return NextResponse.json(
      { success: false, message: "Error fetching user data." },
      { status: 500 }
    );
  }
}
