import FormForm from "@/components/FormForm";

export default function EditFormPage({ params }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-6">Edit form</h1>
      <FormForm formId={params.id} />
    </div>
  );
}
