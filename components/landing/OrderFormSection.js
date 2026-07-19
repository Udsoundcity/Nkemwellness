import DynamicForm from "@/components/DynamicForm";

export default function OrderFormSection({ product, form, ctaText }) {
  const { form_type: formType, iframe_url, external_url } = product;

  return (
    <section id="order-form" className="py-8">
      <div className="container-page">
        <div className="card p-6 sm:p-7">
          {formType === "embedded" && (
            <>
              <h2 className="font-display text-xl font-bold mb-1">Get Started</h2>
              <p className="text-sm text-muted mb-5">Fill this out and we&apos;ll be in touch shortly.</p>
              <DynamicForm productId={product.id} productSlug={product.slug} form={form} ctaText={ctaText} />
            </>
          )}

          {formType === "iframe" && (() => {
            const src = iframe_url || form?.iframe_url;
            if (!src) return <p className="text-sm text-muted">No form configured for this product yet.</p>;
            return (
              <div className="-m-6 overflow-hidden rounded-2xl sm:-m-7">
                <iframe
                  src={src}
                  title={`${product.name} form`}
                  className="w-full border-0"
                  style={{ height: "min(80vh, 720px)", minHeight: 480 }}
                  loading="lazy"
                />
              </div>
            );
          })()}

          {formType === "external" && (() => {
            const target = external_url || form?.external_url;
            if (!target) return <p className="text-sm text-muted">No link configured for this product yet.</p>;
            return (
              <div className="text-center">
                <h2 className="font-display text-xl font-bold mb-2">Ready?</h2>
                <p className="text-sm text-muted mb-5">You&apos;ll be taken to a secure page to finish up.</p>
                <a
                  href={`/api/go/${product.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full sm:w-auto"
                >
                  {ctaText}
                </a>
              </div>
            );
          })()}

          {formType === "none" && (
            <p className="text-center text-sm text-muted">This product doesn&apos;t have a form attached yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
