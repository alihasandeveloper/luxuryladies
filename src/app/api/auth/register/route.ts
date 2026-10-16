import { NextRequest, NextResponse } from "next/server";
import { getWpBaseUrl, getWpAuthHeaders } from "@/lib/auth-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name, username } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    if (process.env.ENABLE_DEMO === "true" || process.env.NEXT_PUBLIC_ENABLE_DEMO === "true") {
      const newUser = {
        id: 1,
        email: email,
        username: username || email.split("@")[0],
        first_name: first_name || "Demo",
        last_name: last_name || "User",
        display_name: `${first_name || "Demo"} ${last_name || "User"}`.trim(),
      };
      const response = NextResponse.json({
        success: true,
        message: "Registration successful (Demo Mode)!",
        user: newUser,
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

    const res = await fetch(`${getWpBaseUrl()}/wp-json/nextjs-helper/v1/auth/register`, {
      method: "POST",
      headers: getWpAuthHeaders(),
      body: JSON.stringify({ email, password, first_name, last_name, username }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || "Registration failed." },
        { status: res.status || 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: data.message || "Registration successful!",
      user: data.user,
      token: data.token,
    });

    // Set secure HTTP-only cookies
    response.cookies.set("ll_auth_token", data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
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
    console.error("Register route error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}
