import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  return handleRevalidate(request);
}

export async function POST(request: NextRequest) {
  return handleRevalidate(request);
}

async function handleRevalidate(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const tag = searchParams.get("tag");
    const path = searchParams.get("path");

    // Secure revalidation token
    const expectedSecret = process.env.REVALIDATION_SECRET || "luxuryladies_revalidation_secret_key";

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, message: "Invalid revalidation secret token." },
        { status: 401 }
      );
    }

    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        success: true,
        revalidated: true,
        tag,
        timestamp: Date.now(),
      });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        success: true,
        revalidated: true,
        path,
        timestamp: Date.now(),
      });
    }

    // Default: revalidate all primary cache tags and routes
    revalidateTag("products");
    revalidateTag("categories");
    revalidateTag("offers");
    revalidateTag("general-settings");
    revalidateTag("payment-gateways");
    revalidateTag("countries");
    revalidatePath("/");
    revalidatePath("/shop");

    return NextResponse.json({
      success: true,
      revalidated: true,
      message: "Successfully flushed and revalidated all core store cache tags.",
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to revalidate cache." },
      { status: 500 }
    );
  }
}
