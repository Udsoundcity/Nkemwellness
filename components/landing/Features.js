import * as Icons from "lucide-react";
import { CircleCheck } from "lucide-react";

export default function Features({ data }) {
  const items = (data?.items || []).filter((f) => f?.title);
  if (!data?.enabled || items.length === 0) return null;

  return (
    <section className="py-8">
      <div className="container-page">
        <h2 className="section-title">{data.title || "Features"}</h2>
        <div className="mt-6 flex flex-col gap-3">
          {items.map((f, i) => {
            const Icon = (f.icon && Icons[f.icon]) || CircleCheck;
            return (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-line bg-white p-4">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon size={16} />
                </span>
                <div>
                  <h3 className="font-semibold text-[15px]">{f.title}</h3>
                  {f.body && <p className="mt-0.5 text-sm text-muted leading-relaxed">{f.body}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
