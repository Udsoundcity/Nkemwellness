import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET = "media";
const MAX_BYTES = 25 * 1024 * 1024; // 25MB

export async function POST(request) {
  const session = await requireAdmin(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (25MB max)." }, { status: 413 });
  }

  const ext = (file.name?.split(".").pop() || "bin").toLowerCase();
  const path = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false
  });

  if (error) {
    console.error("Upload failed:", error.message);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl, path });
}
