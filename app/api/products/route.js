import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { withContentDefaults } from "@/lib/defaultContent";

const MAX_PRODUCTS = 10;

function slugify(input) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data });
}

export async function POST(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "Product name is required." }, { status: 400 });
  }

  const { count, error: countError } = await supabaseAdmin
    .from("products")
    .select("id", { count: "exact", head: true });

  if (countError) return NextResponse.json({ error: countError.message }, { status: 500 });
  if ((count ?? 0) >= MAX_PRODUCTS) {
    return NextResponse.json(
      { error: `You can only have up to ${MAX_PRODUCTS} products. Delete one first.` },
      { status: 400 }
    );
  }

  const slug = body.slug ? slugify(body.slug) : slugify(body.name);
  if (!slug) {
    return NextResponse.json({ error: "Could not derive a slug from the name." }, { status: 400 });
  }

  const payload = {
    name: body.name,
    slug,
    active: body.active ?? true,
    sort_order: body.sort_order ?? 0,
    form_type: body.form_type || "none",
    form_id: body.form_id || null,
    iframe_url: body.iframe_url || null,
    external_url: body.external_url || null,
    content: withContentDefaults(body.content || {})
  };

  const { data, error } = await supabaseAdmin.from("products").insert(payload).select().single();

  if (error) {
    const message = error.code === "23505" ? "A product with that slug already exists." : error.message;
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}
