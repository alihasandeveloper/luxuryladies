import { NextRequest, NextResponse } from "next/server";
import { getWpBaseUrl, getWpAuthHeaders } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const cookieUserId = request.cookies.get("ll_user_id")?.value;
    const authToken = request.cookies.get("ll_auth_token")?.value;

    if (process.env.ENABLE_DEMO === "true" || process.env.NEXT_PUBLIC_ENABLE_DEMO === "true") {
      return NextResponse.json({
        success: true,
        orders: [
          {
            id: 9901,
            order_number: "9901",
            status: "processing",
            date_created: "2026-10-15T14:30:00",
            total: "7400.00",
            formatted_total: "৳7,400",
            currency: "BDT",
            item_count: 2,
            payment_method: "Cash on Delivery",
            items: [
              {
                id: 1,
                name: "Silk Satin 3-Piece Pajama Set - Dusty Rose / M",
                product_id: 101,
                variation_id: 10101,
                quantity: 1,
                subtotal: "3200",
                total: "3200",
                image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=600&q=80",
              },
              {
                id: 2,
                name: "Italian Leather Quilted Shoulder Bag - Champagne Gold",
                product_id: 104,
                variation_id: 10401,
                quantity: 1,
                subtotal: "4200",
                total: "4200",
                image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80",
              },
            ],
            shipping: {
              first_name: "Demo",
              last_name: "User",
              address_1: "House 12, Road 4, Gulshan-2",
              city: "Dhaka",
              state: "BD-13",
              postcode: "1212",
              country: "BD",
            },
          },
          {
            id: 9845,
            order_number: "9845",
            status: "completed",
            date_created: "2026-10-02T10:15:00",
            total: "5800.00",
            formatted_total: "৳5,800",
            currency: "BDT",
            item_count: 1,
            payment_method: "bKash",
            items: [
              {
                id: 1,
                name: "Pearl Embellished Evening Clutch",
                product_id: 106,
                quantity: 1,
                subtotal: "5800",
                total: "5800",
                image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=600&q=80",
              },
            ],
            shipping: {
              first_name: "Demo",
              last_name: "User",
              address_1: "House 12, Road 4, Gulshan-2",
              city: "Dhaka",
              state: "BD-13",
              postcode: "1212",
              country: "BD",
            },
          },
        ],
      });
    }

    if (!cookieUserId || !authToken) {
      return NextResponse.json(
        { success: false, message: "User not authenticated." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paramUserId = searchParams.get("user_id");
    const limit = searchParams.get("limit") || "20";
    const page = searchParams.get("page") || "1";

    // Prevent IDOR: If paramUserId is specified, it MUST match the authenticated user
    if (paramUserId && paramUserId !== cookieUserId) {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const userId = cookieUserId;

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
