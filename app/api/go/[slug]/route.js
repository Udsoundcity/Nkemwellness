import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request, { params }) {
  const { slug } = params;

  const { data: product } = await supabaseAdmin
    .from("products")
    .select("id, name, active, form_type, external_url, form_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!product || !product.active || product.form_type !== "external") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  let target = product.external_url;
  if (!target && product.form_id) {
    const { data: form } = await supabaseAdmin
      .from("forms")
      .select("external_url")
      .eq("id", product.form_id)
      .maybeSingle();
    target = form?.external_url;
  }

  if (!target) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Log the click so it shows up alongside embedded-form orders in admin.
  await supabaseAdmin.from("orders").insert({
    product_id: product.id,
    product_name: product.name,
    form_id: product.form_id || null,
    data: { type: "external_click", url: target }
  });

  return NextResponse.redirect(target);
}
