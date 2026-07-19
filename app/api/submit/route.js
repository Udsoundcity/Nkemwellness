import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { productId, formId, data } = body || {};

  if (!productId || typeof data !== "object" || data === null) {
    return NextResponse.json({ error: "Missing product or form data." }, { status: 400 });
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from("products")
    .select("id, name, active, form_type")
    .eq("id", productId)
    .maybeSingle();

  if (productError || !product || !product.active) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  if (product.form_type !== "embedded") {
    return NextResponse.json(
      { error: "This product does not accept embedded submissions." },
      { status: 400 }
    );
  }

  // Basic sanity limit so no one can post a giant payload.
  const serialized = JSON.stringify(data);
  if (serialized.length > 20_000) {
    return NextResponse.json({ error: "Submission too large." }, { status: 413 });
  }

  const { data: order, error: insertError } = await supabaseAdmin
    .from("orders")
    .insert({
      product_id: product.id,
      product_name: product.name,
      form_id: formId || null,
      data
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Order insert failed:", insertError.message);
    return NextResponse.json({ error: "Could not save your submission." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}