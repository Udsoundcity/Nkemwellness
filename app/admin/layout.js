"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/forms", label: "Forms" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" }
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  if (pathname === "/admin/login") {
    return <div className="min-h-screen bg-paper">{children}</div>;
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-30 border-b border-line/70 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-display text-lg font-bold tracking-tight">
              Admin
            </Link>
            <nav className="hidden gap-5 sm:flex">
              {NAV.map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      active ? "text-accent" : "text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted hover:text-ink transition-colors" target="_blank">
              View store &rarr;
            </Link>
            <button onClick={handleLogout} disabled={loggingOut} className="btn-ghost !px-4 !py-2 text-sm">
              {loggingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-line/70 px-5 py-2 sm:hidden">
          {NAV.map((item) => {
            const active =
              item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-accent-soft text-accent" : "text-muted"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
    </div>
  );
}
