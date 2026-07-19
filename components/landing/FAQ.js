"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="border-b border-line py-4">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 text-left">
        <span className="font-semibold text-[15px]">{item.q}</span>
        <ChevronDown size={16} className={`flex-none text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-line">{item.a}</p>}
    </div>
  );
}

export default function FAQ({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  if (!Array.isArray(items) || items.length === 0) return null;
  const list = items.filter((i) => i?.q);
  if (list.length === 0) return null;

  return (
    <section id="faq" className="py-8">
      <div className="container-page">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="mt-6">
          {list.map((item, i) => (
            <FaqItem key={i} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}
