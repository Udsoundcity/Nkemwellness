export function Problem({ data }) {
  if (!data?.enabled || !data?.title) return null;
  return (
    <section className="py-8">
      <div className="container-page">
        <div className="rounded-2xl border border-line bg-white p-6">
          <p className="eyebrow mb-2">The Problem</p>
          <h2 className="font-display text-xl font-bold sm:text-2xl">{data.title}</h2>
          {data.body && <p className="mt-3 text-[15px] leading-relaxed text-muted whitespace-pre-line">{data.body}</p>}
        </div>
      </div>
    </section>
  );
}

export function Solution({ data }) {
  if (!data?.enabled || !data?.title) return null;
  return (
    <section className="py-8">
      <div className="container-page">
        {data.image && (
          <div className="mb-5 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-line/40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.image} alt="" className="h-full w-full object-cover" />
          </div>
        )}
        <p className="eyebrow mb-2">The Solution</p>
        <h2 className="font-display text-xl font-bold sm:text-2xl">{data.title}</h2>
        {data.body && <p className="mt-3 text-[15px] leading-relaxed text-muted whitespace-pre-line">{data.body}</p>}
      </div>
    </section>
  );
}
