import { NextRequest, NextResponse } from "next/server";
import { getWpBaseUrl, getWpAuthHeaders } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "Username/Email and Password are required." },
        { status: 400 }
      );
    }

    if (process.env.ENABLE_DEMO === "true" || process.env.NEXT_PUBLIC_ENABLE_DEMO === "true") {
      const demoUser = {
        id: 1,
        email: username.includes("@") ? username : "demo@luxuryladies.com",
        username: username,
        first_name: "Demo",
        last_name: "User",
        display_name: "Demo User",
      };
      const response = NextResponse.json({
        success: true,
        message: "Login successful (Demo Mode)!",
        user: demoUser,
        token: "demo_jwt_token_123456",
      });
      response.cookies.set("ll_auth_token", "demo_jwt_token_123456", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      response.cookies.set("ll_user_id", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    }

    const res = await fetch(`${getWpBaseUrl()}/wp-json/nextjs-helper/v1/auth/login`, {
      method: "POST",
      headers: getWpAuthHeaders(),
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Invalid credentials." },
        { status: res.status || 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: data.message || "Login successful!",
      user: data.user,
      token: data.token,
    });

    // Set secure HTTP-only cookies
    response.cookies.set("ll_auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set("ll_user_id", String(data.user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
