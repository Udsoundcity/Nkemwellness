import ProductForm from "@/components/ProductForm";

export default function EditProductPage({ params }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-6">Edit product</h1>
      <ProductForm productId={params.id} />
    </div>
  );
}
