"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSection from "@/components/admin/AdminSection";
import Repeater from "@/components/admin/Repeater";
import MediaPicker from "@/components/admin/MediaPicker";
import { DEFAULT_CONTENT, withContentDefaults } from "@/lib/defaultContent";
import { extractYouTubeId, guessMediaType } from "@/lib/media";
import { ICON_OPTIONS, TRUST_ICON_OPTIONS } from "@/lib/icons";

const EMPTY_PRODUCT = {
  name: "",
  slug: "",
  active: true,
  sort_order: 0,
  form_type: "none",
  form_id: "",
  iframe_url: "",
  external_url: ""
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export default function ProductForm({ productId }) {
  const router = useRouter();
  const isEdit = !!productId;

  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const [content, setContent] = useState(clone(DEFAULT_CONTENT));
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((body) => setForms(body.forms || []));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((body) => {
        const p = body.product;
        if (!p) return;
        setProduct({
          name: p.name || "",
          slug: p.slug || "",
          active: p.active ?? true,
          sort_order: p.sort_order ?? 0,
          form_type: p.form_type || "none",
          form_id: p.form_id || "",
          iframe_url: p.iframe_url || "",
          external_url: p.external_url || ""
        });
        setContent(withContentDefaults(p.content));
      })
      .finally(() => setLoading(false));
  }, [isEdit, productId]);

  function updateProduct(patch) {
    setProduct((prev) => ({ ...prev, ...patch }));
  }
  function updateSection(section, patch) {
    setContent((prev) => ({ ...prev, [section]: { ...prev[section], ...patch } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...product,
      sort_order: Number(product.sort_order) || 0,
      form_id: product.form_id || null,
      content
    };

    try {
      const res = await fetch(isEdit ? `/api/products/${productId}` : "/api/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save product.");
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  const hero = content.hero;
  const availableForms = forms.filter((f) => f.type === product.form_type);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* BASICS -------------------------------------------------------- */}
      <AdminSection title="Basics" description="Name, URL, and visibility" defaultOpen>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label">Product name</label>
            <input
              className="field-input"
              value={product.name}
              onChange={(e) => updateProduct({ name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="field-label">Slug (URL)</label>
            <input
              className="field-input"
              value={product.slug}
              onChange={(e) => updateProduct({ slug: e.target.value })}
              placeholder="auto-generated from name if left blank"
            />
          </div>
          <div>
            <label className="field-label">Sort order</label>
            <input
              type="number"
              className="field-input"
              value={product.sort_order}
              onChange={(e) => updateProduct({ sort_order: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 self-end pb-3 text-[15px]">
            <input
              type="checkbox"
              checked={product.active}
              onChange={(e) => updateProduct({ active: e.target.checked })}
              className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
            />
            Published (visible on the storefront)
          </label>
        </div>
      </AdminSection>

         {/* TOP STORY --------------------------------------------------- */}
      <AdminSection
        title="Top Story"
        description="A bold announcement banner shown above everything else. Leave blank to hide it."
        defaultOpen
      >
        <textarea
          className="field-input"
          rows={2}
          placeholder="Say Goodbye To Bone, Joint, Muscle & Back Pain! Enjoy Comfort + Free Gift"
          value={content.top_story}
          onChange={(e) => setContent((prev) => ({ ...prev, top_story: e.target.value }))}
        />
      </AdminSection>

      {/* HERO ------------------------------------------------------------ */}
      <AdminSection title="Hero" description="Badge, headline, price, media slider, countdown" defaultOpen>
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label">Top story / badge</label>
            <input
              className="field-input"
              value={hero.badge}
              onChange={(e) => updateSection("hero", { badge: e.target.value })}
              placeholder="Best Seller"
            />
          </div>
          <div>
            <label className="field-label">Headline</label>
            <textarea
              className="field-input"
              rows={2}
              value={hero.headline}
              onChange={(e) => updateSection("hero", { headline: e.target.value })}
              placeholder="Get rid of back pain in 7 days"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <label className="field-label">Price</label>
              <input
                type="number"
                step="0.01"
                className="field-input"
                value={hero.price ?? ""}
                onChange={(e) => updateSection("hero", { price: e.target.value === "" ? null : Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="field-label">Old price</label>
              <input
                type="number"
                step="0.01"
                className="field-input"
                value={hero.old_price ?? ""}
                onChange={(e) =>
                  updateSection("hero", { old_price: e.target.value === "" ? null : Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="field-label">Currency</label>
              <input
                className="field-input"
                value={hero.currency}
                onChange={(e) => updateSection("hero", { currency: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">CTA text</label>
              <input
                className="field-input"
                value={hero.cta_text}
                onChange={(e) => updateSection("hero", { cta_text: e.target.value })}
              />
            </div>
          </div>

          ----------------------------------------------------------
          <div className="rounded-xl border border-line p-4">
            <label className="flex items-center gap-2 text-[15px] font-medium">
              <input
                type="checkbox"
                checked={hero.countdown_enabled}
                onChange={(e) => updateSection("hero", { countdown_enabled: e.target.checked })}
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
              />
              Show countdown timer
            </label>
            {hero.countdown_enabled && (
              <div className="mt-3 flex flex-col gap-3">
                <div>
                  <label className="field-label">Repeats</label>
                  <select
                    className="field-input"
                    value={hero.countdown_mode || "once"}
                    onChange={(e) => updateSection("hero", { countdown_mode: e.target.value })}
                  >
                    <option value="once">Runs once, until a set date</option>
                    <option value="daily">Repeats every day</option>
                  </select>
                </div>
 
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {hero.countdown_mode === "daily" ? (
                    <div>
                      <label className="field-label">Resets daily at</label>
                      <input
                        type="time"
                        className="field-input"
                        value={hero.countdown_daily_time || "00:00"}
                        onChange={(e) => updateSection("hero", { countdown_daily_time: e.target.value })}
                      />
                      <p className="mt-1 text-xs text-muted">
                        Counts down to this time every day, then restarts automatically.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="field-label">Ends at</label>
                      <input
                        type="datetime-local"
                        className="field-input"
                        value={hero.countdown_end ? hero.countdown_end.slice(0, 16) : ""}
                        onChange={(e) =>
                          updateSection("hero", {
                            countdown_end: e.target.value ? new Date(e.target.value).toISOString() : ""
                          })
                        }
                      />
                    </div>
                  )}
                  <div>
                    <label className="field-label">Offer label</label>
                    <input
                      className="field-input"
                      value={hero.offer_text}
                      onChange={(e) => updateSection("hero", { offer_text: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="field-label">Slider media (up to 5 images/videos)</label>
            <Repeater
              items={hero.media}
              onChange={(items) => updateSection("hero", { media: items })}
              maxItems={5}
              addLabel="Add slide"
              newItem={() => ({ type: "image", url: "", youtube_id: null })}
              renderItem={(item, i, update) => (
                <div className="flex flex-col gap-3">
                  <select
                    className="field-input"
                    value={item.type}
                    onChange={(e) => update({ type: e.target.value })}
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                  <MediaPicker
                    value={item.url}
                    onChange={(url) =>
                      update({
                        url,
                        type: guessMediaType(url),
                        youtube_id: extractYouTubeId(url)
                      })
                    }
                  />
                </div>
              )}
            />
          </div>
        </div>
      </AdminSection>

      {/* TRUST BADGES ------------------------------------------------- */}
      <AdminSection title="Trust badges" description="Three short reassurances shown under the hero">
        <div className="flex flex-col gap-3">
          {content.trust_badges.map((badge, i) => (
            <div key={i} className="flex gap-3">
              <select
                className="field-input !w-32 flex-none"
                value={badge.icon}
                onChange={(e) => {
                  const next = content.trust_badges.map((b, idx) => (idx === i ? { ...b, icon: e.target.value } : b));
                  setContent((prev) => ({ ...prev, trust_badges: next }));
                }}
              >
                {TRUST_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <input
                className="field-input"
                value={badge.text}
                onChange={(e) => {
                  const next = content.trust_badges.map((b, idx) => (idx === i ? { ...b, text: e.target.value } : b));
                  setContent((prev) => ({ ...prev, trust_badges: next }));
                }}
              />
            </div>
          ))}
        </div>
      </AdminSection>

      {/* PRODUCT VIDEO --------------------------------------------------- */}
      <AdminSection
        title="Product Video"
        description="An illustration/demo video card. Leave off if this product doesn't need it"
        enabled={!!content.product_video}
        onToggleEnabled={(v) =>
          setContent((prev) => ({
            ...prev,
            product_video: v ? { title: "", video_url: "", youtube_id: null, poster: "" } : null
          }))
        }
      >
        {content.product_video && (
          <div className="flex flex-col gap-3">
            <input
              className="field-input"
              placeholder="Title (optional)"
              value={content.product_video.title}
              onChange={(e) =>
                setContent((prev) => ({ ...prev, product_video: { ...prev.product_video, title: e.target.value } }))
              }
            />
            <MediaPicker
              label="Video (upload, direct URL, or YouTube link)"
              value={content.product_video.video_url}
              onChange={(url) =>
                setContent((prev) => ({
                  ...prev,
                  product_video: { ...prev.product_video, video_url: url, youtube_id: extractYouTubeId(url) }
                }))
              }
            />
            <MediaPicker
              label="Poster image (optional — shown before play, for direct video files)"
              value={content.product_video.poster}
              onChange={(url) =>
                setContent((prev) => ({ ...prev, product_video: { ...prev.product_video, poster: url } }))
              }
              accept="image/*"
            />
          </div>
        )}
      </AdminSection>

      {/* PROBLEM / SOLUTION --------------------------------------------- */}
      <AdminSection
        title="Problem"
        description="What pain point does this product solve?"
        enabled={content.problem.enabled}
        onToggleEnabled={(v) => updateSection("problem", { enabled: v })}
      >
        <div className="flex flex-col gap-3">
          <input
            className="field-input"
            placeholder="Title"
            value={content.problem.title}
            onChange={(e) => updateSection("problem", { title: e.target.value })}
          />
          <textarea
            className="field-input"
            rows={3}
            placeholder="Describe the problem"
            value={content.problem.body}
            onChange={(e) => updateSection("problem", { body: e.target.value })}
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Solution"
        description="How this product solves it"
        enabled={content.solution.enabled}
        onToggleEnabled={(v) => updateSection("solution", { enabled: v })}
      >
        <div className="flex flex-col gap-3">
          <input
            className="field-input"
            placeholder="Title"
            value={content.solution.title}
            onChange={(e) => updateSection("solution", { title: e.target.value })}
          />
          <textarea
            className="field-input"
            rows={3}
            placeholder="Describe the solution"
            value={content.solution.body}
            onChange={(e) => updateSection("solution", { body: e.target.value })}
          />
          <MediaPicker
            label="Image (optional)"
            value={content.solution.image}
            onChange={(url) => updateSection("solution", { image: url })}
            accept="image/*"
          />
        </div>
      </AdminSection>

      {/* BENEFITS --------------------------------------------------------- */}
      <AdminSection title="Benefits" description="Up to 4 short benefit cards">
        <Repeater
          items={content.benefits}
          onChange={(items) => setContent((prev) => ({ ...prev, benefits: items }))}
          maxItems={4}
          addLabel="Add benefit"
          newItem={() => ({ icon: "Sparkles", title: "", body: "" })}
          renderItem={(item, i, update) => (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
                <select className="field-input" value={item.icon} onChange={(e) => update({ icon: e.target.value })}>
                  {ICON_OPTIONS.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                <input
                  className="field-input"
                  placeholder="Title"
                  value={item.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
              </div>
              <textarea
                className="field-input"
                rows={2}
                placeholder="Short description"
                value={item.body}
                onChange={(e) => update({ body: e.target.value })}
              />
            </div>
          )}
        />
      </AdminSection>

      {/* HOW IT WORKS ------------------------------------------------- */}
      <AdminSection
        title="How It Works"
        description="Numbered steps"
        enabled={content.how_it_works.enabled}
        onToggleEnabled={(v) => updateSection("how_it_works", { enabled: v })}
      >
        <div className="flex flex-col gap-4">
          <input
            className="field-input"
            placeholder="Section title"
            value={content.how_it_works.title}
            onChange={(e) => updateSection("how_it_works", { title: e.target.value })}
          />
          <Repeater
            items={content.how_it_works.steps}
            onChange={(items) => updateSection("how_it_works", { steps: items })}
            addLabel="Add step"
            newItem={() => ({ title: "", body: "", image: "" })}
            renderItem={(item, i, update) => (
              <div className="flex flex-col gap-3">
                <input
                  className="field-input"
                  placeholder="Step title"
                  value={item.title}
                  onChange={(e) => update({ title: e.target.value })}
                />
                <textarea
                  className="field-input"
                  rows={2}
                  placeholder="Step details"
                  value={item.body}
                  onChange={(e) => update({ body: e.target.value })}
                />
                <MediaPicker value={item.image} onChange={(url) => update({ image: url })} accept="image/*" />
              </div>
            )}
          />
        </div>
      </AdminSection>

      {/* FEATURES ------------------------------------------------------- */}
      <AdminSection
        title="Product Features"
        description="Feature list with icons"
        enabled={content.features.enabled}
        onToggleEnabled={(v) => updateSection("features", { enabled: v })}
      >
        <div className="flex flex-col gap-4">
          <input
            className="field-input"
            placeholder="Section title"
            value={content.features.title}
            onChange={(e) => updateSection("features", { title: e.target.value })}
          />
          <Repeater
            items={content.features.items}
            onChange={(items) => updateSection("features", { items })}
            addLabel="Add feature"
            newItem={() => ({ icon: "CircleCheck", title: "", body: "" })}
            renderItem={(item, i, update) => (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[140px_1fr]">
                  <select className="field-input" value={item.icon} onChange={(e) => update({ icon: e.target.value })}>
                    {ICON_OPTIONS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="field-input"
                    placeholder="Title"
                    value={item.title}
                    onChange={(e) => update({ title: e.target.value })}
                  />
                </div>
                <textarea
                  className="field-input"
                  rows={2}
                  placeholder="Details"
                  value={item.body}
                  onChange={(e) => update({ body: e.target.value })}
                />
              </div>
            )}
          />
        </div>
      </AdminSection>

      {/* REVIEWS ---------------------------------------------------------- */}
      <AdminSection
        title="Customer Reviews"
        description="Text, photo, or video testimonials"
        enabled={content.reviews.enabled}
        onToggleEnabled={(v) => updateSection("reviews", { enabled: v })}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label">Review style</label>
            <select
              className="field-input"
              value={content.reviews.mode}
              onChange={(e) => updateSection("reviews", { mode: e.target.value })}
            >
              <option value="text">Text reviews</option>
              <option value="photo">Photo reviews</option>
              <option value="video">Video reviews</option>
            </select>
          </div>
          <Repeater
            items={content.reviews.items}
            onChange={(items) => updateSection("reviews", { items })}
            addLabel="Add review"
            newItem={() => ({ name: "", rating: 5, text: "", image: "", video_url: "", youtube_id: null })}
            renderItem={(item, i, update) => (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px]">
                  <input
                    className="field-input"
                    placeholder="Customer name"
                    value={item.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                  <select
                    className="field-input"
                    value={item.rating}
                    onChange={(e) => update({ rating: Number(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} star{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
                {content.reviews.mode === "text" && (
                  <textarea
                    className="field-input"
                    rows={2}
                    placeholder="Review text"
                    value={item.text}
                    onChange={(e) => update({ text: e.target.value })}
                  />
                )}
                {content.reviews.mode === "photo" && (
                  <>
                    <textarea
                      className="field-input"
                      rows={2}
                      placeholder="Review text (optional)"
                      value={item.text}
                      onChange={(e) => update({ text: e.target.value })}
                    />
                    <MediaPicker value={item.image} onChange={(url) => update({ image: url })} accept="image/*" />
                  </>
                )}
                {content.reviews.mode === "video" && (
                  <MediaPicker
                    value={item.video_url}
                    onChange={(url) => update({ video_url: url, youtube_id: extractYouTubeId(url) })}
                  />
                )}
              </div>
            )}
          />
        </div>
      </AdminSection>

      {/* BEFORE & AFTER --------------------------------------------------- */}
      <AdminSection
        title="Before & After"
        description="Leave off if this product doesn't need it"
        enabled={!!content.before_after}
        onToggleEnabled={(v) => setContent((prev) => ({ ...prev, before_after: v ? [] : null }))}
      >
        {content.before_after && (
          <Repeater
            items={content.before_after}
            onChange={(items) => setContent((prev) => ({ ...prev, before_after: items }))}
            addLabel="Add pair"
            newItem={() => ({ before_image: "", after_image: "", label: "" })}
            renderItem={(item, i, update) => (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <MediaPicker
                    label="Before"
                    value={item.before_image}
                    onChange={(url) => update({ before_image: url })}
                    accept="image/*"
                  />
                  <MediaPicker
                    label="After"
                    value={item.after_image}
                    onChange={(url) => update({ after_image: url })}
                    accept="image/*"
                  />
                </div>
                <input
                  className="field-input"
                  placeholder="Caption (optional)"
                  value={item.label}
                  onChange={(e) => update({ label: e.target.value })}
                />
              </div>
            )}
          />
        )}
      </AdminSection>

      {/* FREE GIFT ---------------------------------------------------------- */}
      <AdminSection
        title="Free Gift / Special Offer"
        description="Leave off if this product doesn't need it"
        enabled={!!content.free_gift}
        onToggleEnabled={(v) =>
          setContent((prev) => ({
            ...prev,
            free_gift: v ? { title: "", body: "", image: "", badge: "" } : null
          }))
        }
      >
        {content.free_gift && (
          <div className="flex flex-col gap-3">
            <input
              className="field-input"
              placeholder="Badge (e.g. Free Gift)"
              value={content.free_gift.badge}
              onChange={(e) => setContent((prev) => ({ ...prev, free_gift: { ...prev.free_gift, badge: e.target.value } }))}
            />
            <input
              className="field-input"
              placeholder="Title"
              value={content.free_gift.title}
              onChange={(e) => setContent((prev) => ({ ...prev, free_gift: { ...prev.free_gift, title: e.target.value } }))}
            />
            <textarea
              className="field-input"
              rows={2}
              placeholder="Details"
              value={content.free_gift.body}
              onChange={(e) => setContent((prev) => ({ ...prev, free_gift: { ...prev.free_gift, body: e.target.value } }))}
            />
            <MediaPicker
              value={content.free_gift.image}
              onChange={(url) => setContent((prev) => ({ ...prev, free_gift: { ...prev.free_gift, image: url } }))}
              accept="image/*"
            />
          </div>
        )}
      </AdminSection>

      {/* FAQ ------------------------------------------------------------- */}
      <AdminSection
        title="FAQ"
        description="Leave off if this product doesn't need it"
        enabled={!!content.faq}
        onToggleEnabled={(v) => setContent((prev) => ({ ...prev, faq: v ? [] : null }))}
      >
        {content.faq && (
          <Repeater
            items={content.faq}
            onChange={(items) => setContent((prev) => ({ ...prev, faq: items }))}
            addLabel="Add question"
            newItem={() => ({ q: "", a: "" })}
            renderItem={(item, i, update) => (
              <div className="flex flex-col gap-3">
                <input
                  className="field-input"
                  placeholder="Question"
                  value={item.q}
                  onChange={(e) => update({ q: e.target.value })}
                />
                <textarea
                  className="field-input"
                  rows={2}
                  placeholder="Answer"
                  value={item.a}
                  onChange={(e) => update({ a: e.target.value })}
                />
              </div>
            )}
          />
        )}
      </AdminSection>

      {/* ORDER FORM --------------------------------------------------- */}
      <AdminSection title="Order Form" description="Embedded, iframe, or an external link" defaultOpen>
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label">Form type</label>
            <select
              className="field-input"
              value={product.form_type}
              onChange={(e) => updateProduct({ form_type: e.target.value })}
            >
              <option value="none">None</option>
              <option value="embedded">Embedded (saved form)</option>
              <option value="iframe">Iframe embed</option>
              <option value="external">External link</option>
            </select>
          </div>

          {(product.form_type === "embedded" || product.form_type === "iframe") && (
            <div>
              <label className="field-label">Saved form</label>
              <select
                className="field-input"
                value={product.form_id}
                onChange={(e) => updateProduct({ form_id: e.target.value })}
              >
                <option value="">— Select a form —</option>
                {availableForms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted">
                Manage saved forms on the{" "}
                <a href="/admin/forms" className="text-accent hover:underline">
                  Forms
                </a>{" "}
                page.
              </p>
            </div>
          )}

          {product.form_type === "iframe" && (
            <div>
              <label className="field-label">Or a one-off iframe URL (overrides saved form)</label>
              <input
                className="field-input"
                value={product.iframe_url}
                onChange={(e) => updateProduct({ iframe_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          )}

          {product.form_type === "external" && (
            <div>
              <label className="field-label">External link</label>
              <input
                className="field-input"
                value={product.external_url}
                onChange={(e) => updateProduct({ external_url: e.target.value })}
                placeholder="https://…"
              />
            </div>
          )}
        </div>
      </AdminSection>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
