export default function HowItWorks({ data }) {
  const steps = (data?.steps || []).filter((s) => s?.title);
  if (!data?.enabled || steps.length === 0) return null;

  return (
    <section id="how-it-works" className="py-8">
      <div className="container-page">
        <h2 className="section-title">{data.title || "How It Works"}</h2>
        <div className="mt-6 flex flex-col gap-4">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-none flex-col items-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-display text-sm font-bold text-white">
                  {i + 1}
                </span>
                {i < steps.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
              </div>
              <div className="pb-4">
                <h3 className="font-display text-base font-bold">{step.title}</h3>
                {step.body && <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>}
                {step.image && (
                  <div className="mt-3 aspect-video w-full max-w-sm overflow-hidden rounded-xl bg-line/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={step.image} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
