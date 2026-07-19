import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";

export default function Benefits({ items = [] }) {
  const list = items.filter((b) => b?.title).slice(0, 4);
  if (list.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container-page">
        <h2 className="section-title">Why You&apos;ll Love It</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {list.map((b, i) => {
            const Icon = (b.icon && Icons[b.icon]) || Sparkles;
            return (
              <div key={i} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon size={18} />
                </span>
                <h3 className="mt-3 font-display text-base font-bold">{b.title}</h3>
                {b.body && <p className="mt-1.5 text-sm leading-relaxed text-muted">{b.body}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
