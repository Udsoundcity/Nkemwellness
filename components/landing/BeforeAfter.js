"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function BeforeAfter({ items }) {
  const [index, setIndex] = useState(0);
  if (!Array.isArray(items) || items.length === 0) return null;
  const list = items.filter((i) => i?.before_image && i?.after_image);
  if (list.length === 0) return null;

  const current = list[index];

  return (
    <section className="py-8">
      <div className="container-page">
        <h2 className="section-title">Before &amp; After</h2>
        <div className="mt-6">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-line/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.before_image} alt="Before" className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-semibold text-white">
                Before
              </span>
            </div>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-line/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.after_image} alt="After" className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white">
                After
              </span>
            </div>
          </div>
          {current.label && <p className="mt-3 text-center text-sm text-muted">{current.label}</p>}

          {list.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                aria-label="Previous"
                onClick={() => setIndex((i) => (i - 1 + list.length) % list.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-muted">
                {index + 1} / {list.length}
              </span>
              <button
                aria-label="Next"
                onClick={() => setIndex((i) => (i + 1) % list.length)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
