export function formatPrice(price, currency) {
  if (price === null || price === undefined || price === "") return null;

  // Force the ₦ symbol ourselves for Naira: Intl.NumberFormat's symbol
  // lookup for "en-NG" depends on ICU data that isn't always bundled with
  // Node/Vercel's runtime, and silently falls back to printing "NGN 42,000.00"
  // instead of "₦42,000" when it's missing.
  if ((currency || "").toUpperCase() === "NGN") {
    const numeric = Number(price);
    if (Number.isNaN(numeric)) return `${price}`;
    return "₦" + numeric.toLocaleString("en-NG");
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2
    }).format(price);
  } catch {
    return `${price}`;
  }
}

export function discountPercent(price, oldPrice) {
  if (!price || !oldPrice || oldPrice <= price) return null;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}