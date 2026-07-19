import { NextResponse } from "next/server";
import { supabasePublic } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabasePublic.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}
