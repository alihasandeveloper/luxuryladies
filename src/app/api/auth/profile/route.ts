import { NextRequest, NextResponse } from "next/server";
import { getWpBaseUrl, getWpAuthHeaders } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieUserId = request.cookies.get("ll_user_id")?.value;

    const payload = {
      ...body,
      user_id: body.user_id || cookieUserId,
    };

    if (!payload.user_id) {
      return NextResponse.json(
        { success: false, message: "User not authenticated." },
        { status: 401 }
      );
    }

    const res = await fetch(`${getWpBaseUrl()}/wp-json/nextjs-helper/v1/customer/profile`, {
      method: "POST",
      headers: getWpAuthHeaders(),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Failed to update profile." },
        { status: res.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Profile updated successfully.",
      user: data.user,
    });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { success: false, message: "Error updating profile." },
      { status: 500 }
    );
  }
}
