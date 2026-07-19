import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default function ProductCard({ product }) {
  const hero = product.content?.hero || {};
  const price = formatPrice(hero.price, hero.currency);
  const image = hero.media?.[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-line/40">
        {image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted text-sm">No image</div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-5">
        <h3 className="font-display text-lg font-bold leading-snug">{product.name}</h3>
        {hero.badge && <p className="text-sm text-muted line-clamp-2">{hero.badge}</p>}
        <div className="mt-3 flex items-center justify-between">
          {price ? <span className="font-semibold text-ink">{price}</span> : <span />}
          <span className="text-sm font-semibold text-accent group-hover:underline">View &rarr;</span>
        </div>
      </div>
    </Link>
  );
}
