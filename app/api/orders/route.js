import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: orders, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Look up each order's originating form so raw field ids (e.g. "f_5tj8wyi")
  // can be shown as their human-readable labels, and so fields marked with
  // Naira formatting can be identified for revenue calculations.
  const formIds = [...new Set((orders || []).map((o) => o.form_id).filter(Boolean))];
  let metaByForm = {};
  if (formIds.length > 0) {
    const { data: forms } = await supabaseAdmin.from("forms").select("id, fields").in("id", formIds);
    for (const form of forms || []) {
      const map = {};
      for (const field of form.fields || []) {
        if (field?.id) map[field.id] = { label: field.label || field.id, currency: !!field.currency };
      }
      metaByForm[form.id] = map;
    }
  }

  const enriched = (orders || []).map((order) => {
    const meta = order.form_id ? metaByForm[order.form_id] || {} : {};
    const field_labels = {};
    for (const [id, m] of Object.entries(meta)) field_labels[id] = m.label;
    return { ...order, field_labels, field_meta: meta };
  });

  return NextResponse.json({ orders: enriched });
}