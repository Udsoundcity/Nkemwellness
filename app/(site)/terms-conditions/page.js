import { notFound } from "next/navigation";
import { supabasePublic } from "@/lib/supabaseClient";

export const revalidate = 0;

export default async function TermsConditionsPage() {
  const { data } = await supabasePublic.from("site_settings").select("terms_conditions").eq("id", 1).maybeSingle();
  if (!data?.terms_conditions) notFound();

  return (
    <main className="container-page py-14">
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-6">Terms &amp; Conditions</h1>
      <div className="whitespace-pre-line text-[15px] leading-relaxed text-muted">{data.terms_conditions}</div>
    </main>
  );
}
