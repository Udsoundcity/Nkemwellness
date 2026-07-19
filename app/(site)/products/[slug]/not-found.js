import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="container-page flex flex-col items-center py-24 text-center">
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        We couldn&apos;t find that product.
      </h1>
      <p className="mt-2 text-muted">It may have been unpublished or removed.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to the shop
      </Link>
    </main>
  );
}
