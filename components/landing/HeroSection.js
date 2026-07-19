import HeroSlider from "./HeroSlider";
import CountdownTimer from "./CountdownTimer";
import { formatPrice, discountPercent } from "@/lib/format";

export default function HeroSection({ product, hero }) {
  const price = formatPrice(hero.price, hero.currency);
  const oldPrice = formatPrice(hero.old_price, hero.currency);
  const discount = discountPercent(hero.price, hero.old_price);
  const showCountdown =
    hero.countdown_enabled && (hero.countdown_mode === "daily" || hero.countdown_end);

  return (
    <section className="pt-6 sm:pt-10">
      <div className="container-page">
        {hero.badge && (
          <span className="mb-3 inline-flex items-center rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            {hero.badge}
          </span>
        )}

        <HeroSlider media={hero.media} />

        <div className="mt-6">
          <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            {hero.headline || product.name}
          </h1>

          {(price || oldPrice) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {price && <span className="text-3xl font-extrabold text-ink">{price}</span>}
              {oldPrice && <span className="text-lg text-muted line-through">{oldPrice}</span>}
              {discount && (
                <span className="rounded-full bg-warn/10 px-2.5 py-1 text-xs font-bold text-warn">
                  Save {discount}%
                </span>
              )}
            </div>
          )}

          {showCountdown && (
            <div className="mt-5">
              <CountdownTimer
                mode={hero.countdown_mode}
                endISO={hero.countdown_end}
                dailyTime={hero.countdown_daily_time}
                label={hero.offer_text}
              />
            </div>
          )}

          <a href="#order-form" className="btn-primary mt-7 w-full sm:w-auto">
            {hero.cta_text || "Order Now"}
          </a>
        </div>
      </div>
    </section>
  );
}