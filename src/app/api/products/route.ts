import { NextRequest, NextResponse } from "next/server";
import { getProducts, getCategories, getGeneralSettings } from "@/lib/woocommerce";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
  const per_page = searchParams.get("per_page") ? parseInt(searchParams.get("per_page")!, 10) : 12;
  const type = searchParams.get("type");

  if (type === "categories") {
    const settings = await getGeneralSettings();
    if (settings?.header_categories && settings.header_categories.length > 0) {
      return NextResponse.json(settings.header_categories);
    }
    const categories = await getCategories();
    return NextResponse.json(categories);
  }

  const products = await getProducts({ search, category, page, per_page });
  return NextResponse.json(products);
}

