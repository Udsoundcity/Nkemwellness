"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmButton from "@/components/ConfirmButton";

const MAX_PRODUCTS = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/api/products");
    const body = await res.json();
    if (res.ok) setProducts(body.products);
    else setError(body.error || "Could not load products.");
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleActive(product) {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !product.active })
    });
    if (res.ok) {
      const body = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === product.id ? body.product : p)));
    }
  }

  const count = products?.length ?? 0;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Products</h1>
          <p className="text-sm text-muted mt-1">
            {count}/{MAX_PRODUCTS} used
          </p>
        </div>
        {count < MAX_PRODUCTS && (
          <Link href="/admin/products/new" className="btn-primary">
            Add product
          </Link>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {products === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : products.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No products yet.{" "}
          <Link href="/admin/products/new" className="text-accent hover:underline">
            Add your first one
          </Link>
          .
        </div>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {products.map((product) => {
            const hero = product.content?.hero || {};
            const image = hero.media?.[0];
            return (
              <div key={product.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-14 w-14 flex-none overflow-hidden rounded-lg bg-line/40">
                    {image?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{product.name}</p>
                    <p className="text-sm text-muted truncate">/products/{product.slug}</p>
                  </div>
                  <span
                    className={`ml-2 flex-none rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      product.active ? "bg-success/10 text-success" : "bg-line text-muted"
                    }`}
                  >
                    {product.active ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex flex-none items-center gap-4">
                  <button
                    onClick={() => toggleActive(product)}
                    className="text-sm font-medium text-muted hover:text-ink"
                  >
                    {product.active ? "Unpublish" : "Publish"}
                  </button>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Edit
                  </Link>
                  <ConfirmButton onConfirm={() => handleDelete(product.id)} label="Delete" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
