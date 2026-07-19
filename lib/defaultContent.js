// Canonical shape for a product's landing-page content (products.content jsonb).
// deepMergeContent() fills in any missing keys with these defaults so every
// component can assume the full shape is present, whether the product was
// created before a section existed or an admin left something blank.

export const DEFAULT_CONTENT = {
  top_story: "", // bold announcement banner shown above everything else; "" -> hidden
  hero: {
    badge: "",
    headline: "",
    price: null,
    old_price: null,
    currency: "USD",
    cta_text: "Order Now",
    countdown_enabled: false,
    countdown_mode: "once", // "once" | "daily"
    countdown_end: "", // used when countdown_mode = "once"
    countdown_daily_time: "23:59", // "HH:MM" local time, used when countdown_mode = "daily"
    offer_text: "Limited-time offer ends in:",
    media: [] // [{ type: 'image' | 'video', url, youtube_id }]
  },
  trust_badges: [
    { icon: "truck", text: "Fast Delivery to All States" },
    { icon: "shield", text: "Payment on Delivery" },
    { icon: "badge-check", text: "Quality Guaranteed" }
  ],
  product_video: null, // { title, video_url, youtube_id, poster } | null
  problem: { enabled: false, title: "", body: "" },
  solution: { enabled: false, title: "", body: "", image: "" },
  benefits: [], // up to 4: [{ icon, title, body }]
  how_it_works: { enabled: false, title: "How It Works", steps: [] }, // steps: [{title, body, image}]
  features: { enabled: false, title: "Features", items: [] }, // items: [{title, body, icon}]
  reviews: { enabled: false, mode: "text", items: [] }, // items: [{name, rating, text, image, video_url, youtube_id}]
  before_after: null, // [{ before_image, after_image, label }] | null
  free_gift: null, // { title, body, image, badge } | null
  faq: null // [{ q, a }] | null
};

function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

/** Recursively fills missing keys of `content` with DEFAULT_CONTENT. Arrays and
 * explicit nulls from the stored content are preserved as-is (not merged). */
export function withContentDefaults(content) {
  const source = isObject(content) ? content : {};
  function merge(defaults, value) {
    if (Array.isArray(defaults)) return Array.isArray(value) ? value : defaults;
    if (isObject(defaults)) {
      if (value === null) return null; // explicit null (e.g. optional sections) is meaningful
      const out = {};
      const valueObj = isObject(value) ? value : {};
      for (const key of Object.keys(defaults)) {
        out[key] = merge(defaults[key], valueObj[key]);
      }
      return out;
    }
    return value === undefined ? defaults : value;
  }
  return merge(DEFAULT_CONTENT, source);
}