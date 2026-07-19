import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const fields = [
    "logo_url",
    "logo_text",
    "phone",
    "phone_display",
    "facebook_pixel_id",
    "footer_contact_email",
    "footer_contact_phone",
    "footer_contact_address",
    "privacy_policy",
    "terms_conditions",
    "copyright_text"
  ];
  const update = { id: 1, updated_at: new Date().toISOString() };
  for (const key of fields) {
    if (key in body) update[key] = body[key];
  }

  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .upsert(update)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ settings: data });
}
