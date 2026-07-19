import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("forms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ forms: data });
}

export async function POST(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body?.name) {
    return NextResponse.json({ error: "Form name is required." }, { status: 400 });
  }

  const payload = {
    name: body.name,
    type: body.type || "embedded",
    fields: Array.isArray(body.fields) ? body.fields : [],
    iframe_url: body.iframe_url || null,
    external_url: body.external_url || null
  };

  const { data, error } = await supabaseAdmin.from("forms").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ form: data }, { status: 201 });
}
