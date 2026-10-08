import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const type = searchParams.get("type");

  if (type === "categories") {
    const categories = await getCategories();
    return NextResponse.json(categories);
  }

  const products = await getProducts({ search, category });
  return NextResponse.json(products);
}
