"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ConfirmButton from "@/components/ConfirmButton";

export default function AdminFormsPage() {
  const [forms, setForms] = useState(null);

  async function load() {
    const res = await fetch("/api/forms");
    const body = await res.json();
    if (res.ok) setForms(body.forms);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id) {
    const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
    if (res.ok) setForms((prev) => prev.filter((f) => f.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Forms</h1>
        <Link href="/admin/forms/new" className="btn-primary">
          Create form
        </Link>
      </div>

      {forms === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : forms.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No forms yet.{" "}
          <Link href="/admin/forms/new" className="text-accent hover:underline">
            Create one
          </Link>{" "}
          to attach to a product.
        </div>
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {forms.map((form) => (
            <div key={form.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="font-semibold truncate">{form.name}</p>
                <p className="text-sm text-muted capitalize">
                  {form.type}
                  {form.type === "embedded" && ` · ${form.fields?.length ?? 0} fields`}
                </p>
              </div>
              <div className="flex flex-none items-center gap-4">
                <Link
                  href={`/admin/forms/${form.id}/edit`}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Edit
                </Link>
                <ConfirmButton onConfirm={() => handleDelete(form.id)} label="Delete" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
