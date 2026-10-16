import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully.",
  });

  response.cookies.delete("ll_auth_token");
  response.cookies.delete("ll_user_id");

  return response;
}
