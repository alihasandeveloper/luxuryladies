import { NextRequest, NextResponse } from "next/server";
import { getWpAuthUrl, getWpAuthHeaders } from "@/lib/auth-server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get("orderId") || searchParams.get("id") || "";
    const cleanId = rawId.replace(/[^0-9]/g, "").trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid numeric Order ID." },
        { status: 400 }
      );
    }

    if (process.env.ENABLE_DEMO === "true" || process.env.NEXT_PUBLIC_ENABLE_DEMO === "true") {
      return NextResponse.json({
        success: true,
        order: {
          id: Number(cleanId),
          order_number: `LL-${cleanId}`,
          status: "processing",
          date_created: new Date().toISOString(),
          total: "3480",
          currency: "BDT",
          payment_method: "Cash on Delivery",
          shipping_city: "Dhaka",
          items: [
            {
              id: 1,
              name: "Satin 3 Pcs PJ Set with Robe - Wine",
              quantity: 1,
              total: "2600",
              image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80",
            },
          ],
        },
      });
    }

    const targetUrl = getWpAuthUrl(`/wp-json/wc/v3/orders/${cleanId}`);
    const headers = getWpAuthHeaders();

    const res = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          {
            success: false,
            message: `Order #${cleanId} was not found. Please double-check your Order ID.`,
          },
          { status: 404 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          message: "Unable to retrieve order details. Please try again.",
        },
        { status: res.status }
      );
    }

    const order = await res.json();

    const items = (order.line_items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      total: item.total,
      image: item.image?.src || null,
    }));

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.number || String(order.id),
        status: order.status,
        date_created: order.date_created,
        total: order.total,
        currency: order.currency || "BDT",
        payment_method: order.payment_method_title || "",
        shipping_city: order.shipping?.city || order.billing?.city || "",
        items,
      },
    });
  } catch (error: any) {
    console.error("Order tracking error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while tracking your order.",
      },
      { status: 500 }
    );
  }
}
