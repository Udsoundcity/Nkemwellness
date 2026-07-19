"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function StatCard({ label, value, href }) {
  return (
    <Link href={href} className="card flex flex-col gap-1 p-6 transition-colors hover:border-ink/20">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-display text-3xl font-extrabold">{value}</span>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: null, forms: null, orders: null });

  useEffect(() => {
    async function load() {
      const [productsRes, formsRes, ordersRes] = await Promise.all([
        fetch("/api/products").then((r) => r.json()),
        fetch("/api/forms").then((r) => r.json()),
        fetch("/api/orders").then((r) => r.json())
      ]);
      setStats({
        products: productsRes.products?.length ?? 0,
        forms: formsRes.forms?.length ?? 0,
        orders: ordersRes.orders?.length ?? 0
      });
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Products" value={stats.products ?? "…"} href="/admin/products" />
        <StatCard label="Forms" value={stats.forms ?? "…"} href="/admin/forms" />
        <StatCard label="Submissions" value={stats.orders ?? "…"} href="/admin/orders" />
      </div>

      <div className="mt-8 card p-6">
        <h2 className="font-display text-lg font-bold mb-3">Quick actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new" className="btn-primary">
            Add a product
          </Link>
          <Link href="/admin/forms/new" className="btn-secondary">
            Create a form
          </Link>
          <Link href="/admin/orders" className="btn-secondary">
            View submissions
          </Link>
        </div>
      </div>
    </div>
  );
}
