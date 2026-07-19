import Link from "next/link";
import { supabasePublic } from "@/lib/supabaseClient";

export const revalidate = 0;

async function getProduct(slug) {
  if (!slug) return null;
  const { data } = await supabasePublic.from("products").select("name, slug").eq("slug", slug).maybeSingle();
  return data;
}

export default async function ThankYouPage({ searchParams }) {
  const product = await getProduct(searchParams?.product);
  const name = searchParams?.name?.trim();
  const orderId = searchParams?.order;
  const productName = product?.name || "your order";

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-5 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-3xl text-success">
        ✓
      </div>

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
        Thank You{name ? `, ${name}` : ""}
      </h1>

      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
        Your order for <span className="font-semibold text-ink">{productName}</span> has been received.
      </p>

      {orderId && (
        <div className="mt-6 rounded-xl border border-line bg-white px-5 py-3">
          <p className="text-xs uppercase tracking-wide text-muted">Reference ID</p>
          <p className="mt-0.5 font-mono text-sm">{orderId}</p>
        </div>
      )}

      <p className="mt-6 max-w-md text-sm leading-relaxed text-muted">
        A customer care representative will text, call, or chat you on WhatsApp shortly.
      </p>

      <Link href="/" className="btn-primary mt-8">
        Back to the shop
      </Link>
    </main>
  );
}