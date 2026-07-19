"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";

export default function StickyBottomBar({ price, currency, ctaText }) {
  const [hidden, setHidden] = useState(false);
  const formattedPrice = formatPrice(price, currency);

  useEffect(() => {
    const target = document.getElementById("order-form");
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur transition-transform duration-300"
      style={{ transform: hidden ? "translateY(100%)" : "translateY(0)" }}
    >
      <div
        className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted">Price</p>
          <p className="truncate text-lg font-extrabold">{formattedPrice || "—"}</p>
        </div>
        <a href="#order-form" className="btn-primary flex-none !px-6 !py-3">
          {ctaText || "Order Now"}
        </a>
      </div>
    </div>
  );
}
