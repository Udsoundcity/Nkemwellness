import ProductCard from "@/components/ProductCard";
import { supabasePublic } from "@/lib/supabaseClient";

export const revalidate = 0;

async function getProducts() {
  const { data, error } = await supabasePublic
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }
  return data ?? [];
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <main id="products" className="container-page py-12">
      <div className="mb-10 max-w-xl">
        <p className="eyebrow mb-3">NkemWellness</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          A few things, made carefully For You.
        </h1>
        <p className="mt-3 text-muted text-[15px] leading-relaxed">
          Every product below has its own page with everything you need to decide, and nothing you
          don&apos;t.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No products yet. Add your first one from the{" "}
          <a href="/admin" className="text-accent font-medium hover:underline">
            admin panel
          </a>
          .
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
