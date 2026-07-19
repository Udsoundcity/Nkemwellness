import { Gift } from "lucide-react";

export default function FreeGift({ data }) {
  if (!data || !data.title) return null;

  return (
    <section className="py-8">
      <div className="container-page">
        <div className="rounded-2xl border-2 border-dashed border-accent/40 bg-accent-soft p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-white text-accent shadow-card">
              <Gift size={20} />
            </span>
            <div className="min-w-0">
              {data.badge && (
                <span className="mb-1 inline-block rounded-full bg-white px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent">
                  {data.badge}
                </span>
              )}
              <h2 className="font-display text-lg font-bold sm:text-xl">{data.title}</h2>
              {data.body && <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{data.body}</p>}
            </div>
          </div>
          {data.image && (
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-white/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={data.image} alt="" className="h-full w-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
