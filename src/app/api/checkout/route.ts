import { NextResponse } from "next/server";
import { createWooCommerceOrder } from "@/lib/woocommerce";
import { CreateOrderPayload } from "@/types/woocommerce";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      customer,
      items,
      shippingMethod,
      shippingCost,
      paymentMethod,
      paymentMethodTitle,
      paymentDetails,
      coupon,
      total,
    } = body;

    // Validate required fields
    const rawName = (customer?.fullName || customer?.firstName || "").trim();
    if (!rawName) {
      return NextResponse.json(
        { success: false, error: "Full name is required." },
        { status: 400 }
      );
    }

    const cleanPhone = (customer?.phone || "").trim().replace(/[\s-]/g, "");
    const bdPhoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;
    if (!cleanPhone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required." },
        { status: 400 }
      );
    }
    if (!bdPhoneRegex.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter a valid 11-digit Bangladeshi phone number (e.g. 017XXXXXXXX or +88017XXXXXXXX).",
        },
        { status: 400 }
      );
    }

    if (!customer?.address?.trim()) {
      return NextResponse.json(
        { success: false, error: "Delivery address is required." },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Your cart is empty." },
        { status: 400 }
      );
    }

    const finalPaymentTitle = paymentMethodTitle?.trim() || paymentMethod || "Payment";
    const finalShippingTitle = shippingMethod?.title || "Standard Delivery";
    const finalShippingMethodId = shippingMethod?.method_id || "flat_rate";

    const nameParts = rawName.split(" ");
    const resolvedFirstName = nameParts[0] || rawName;
    const resolvedLastName = nameParts.slice(1).join(" ") || customer.lastName?.trim() || "";
    const resolvedCity = customer.city?.trim() || customer.district?.trim() || customer.state?.trim() || "Dhaka";
    const resolvedState = customer.state?.trim() || customer.district?.trim() || "Dhaka";

    // Link order to logged-in customer if authenticated via secure cookie
    const cookieHeader = req.headers.get("cookie") || "";
    const cookieMatch = cookieHeader.match(/ll_user_id=([^;]+)/);
    const cookieUserId = cookieMatch ? Number(cookieMatch[1]) : 0;
    const resolvedCustomerId = cookieUserId > 0 ? cookieUserId : undefined;

    const payload: CreateOrderPayload = {
      customer_id: resolvedCustomerId,
      status: "processing",
      payment_method: paymentMethod || "cod",
      payment_method_title: finalPaymentTitle,
      set_paid: false,
      billing: {
        first_name: resolvedFirstName,
        last_name: resolvedLastName,
        address_1: customer.address.trim(),
        address_2: customer.address2?.trim() || (customer.altPhone ? `Alt Phone: ${customer.altPhone}` : ""),
        city: resolvedCity,
        state: resolvedState,
        postcode: customer.postalCode?.trim() || "",
        country: customer.country?.trim() || "BD",
        email: customer.email?.trim() || "customer@luxuryladies.com",
        phone: customer.phone.trim(),
      },
      shipping: {
        first_name: resolvedFirstName,
        last_name: resolvedLastName,
        address_1: customer.address.trim(),
        address_2: customer.address2?.trim() || (customer.altPhone ? `Alt Phone: ${customer.altPhone}` : ""),
        city: resolvedCity,
        state: resolvedState,
        postcode: customer.postalCode?.trim() || "",
        country: customer.country?.trim() || "BD",
      },
      line_items: items.map((item: any) => ({
        product_id: Number(item.productId),
        variation_id: item.variationId ? Number(item.variationId) : undefined,
        quantity: Number(item.quantity) || 1,
        meta_data: item.selectedAttributes
          ? Object.entries(item.selectedAttributes).map(([key, value]) => ({
              key,
              value: String(value),
            }))
          : undefined,
      })),
      shipping_lines: [
        {
          method_id: finalShippingMethodId,
          method_title: finalShippingTitle,
          total: String(shippingCost || 0),
        },
      ],
      coupon_lines: coupon?.code ? [{ code: coupon.code }] : undefined,
      customer_note: customer.notes?.trim() || "",
      meta_data: [
        {
          key: "_order_source",
          value: "luxuryladies Headless Next.js App",
        },
        ...(paymentDetails?.senderNumber
          ? [{ key: "_bkash_sender_number", value: paymentDetails.senderNumber }]
          : []),
        ...(paymentDetails?.trxId
          ? [{ key: "_bkash_trx_id", value: paymentDetails.trxId }]
          : []),
      ],
    };

    let orderResponse: any = null;

    try {
      orderResponse = await createWooCommerceOrder(payload);
    } catch (wcErr: any) {
      console.error("WooCommerce order creation failed:", wcErr);

      // Only allow simulated orders in development mode if explicitly enabled
      if (process.env.NODE_ENV === "development" && process.env.ENABLE_SIMULATED_ORDERS === "true") {
        console.warn("Generating simulated order for local development testing...");
        const fallbackId = Math.floor(10000 + Math.random() * 90000);
        orderResponse = {
          id: fallbackId,
          order_key: `wc_order_${fallbackId}_simulated`,
          status: "processing",
          currency: "BDT",
          total: String(total || 0),
          billing: payload.billing,
          shipping: payload.shipping,
          payment_method: payload.payment_method,
          payment_method_title: payload.payment_method_title,
          line_items: payload.line_items,
          date_created: new Date().toISOString(),
          isSimulated: true,
        };
      } else {
        return NextResponse.json(
          {
            success: false,
            error: wcErr.message || "Failed to process order with store backend. Please try again or contact support.",
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      orderId: orderResponse.id,
      orderNumber: `LL-${orderResponse.id}`,
      orderData: orderResponse,
    });
  } catch (err: any) {
    console.error("Checkout API error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An unexpected error occurred while placing your order.",
      },
      { status: 500 }
    );
  }
}
