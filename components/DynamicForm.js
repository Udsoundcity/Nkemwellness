"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NIGERIA_STATES } from "@/lib/nigeriaStates";
import { formatOptionLabel } from "@/lib/currency";

function FieldInput({ field, value, onChange }) {
  if (field.type === "state") {
    return (
      <select
        id={field.id}
        name={field.id}
        required={!!field.required}
        value={value ?? ""}
        onChange={(e) => onChange(field.id, e.target.value)}
        className="field-input"
      >
        <option value="" disabled>
          {field.placeholder || "Select your state"}
        </option>
        {NIGERIA_STATES.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    const options = (field.options || []).map((opt) => formatOptionLabel(opt, field.currency));
    return (
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-[15px]">
            <input
              type="radio"
              name={field.id}
              value={opt}
              checked={value === opt}
              required={!!field.required}
              onChange={() => onChange(field.id, opt)}
              className="h-4 w-4 border-line text-accent focus:ring-accent"
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox_group") {
    const options = (field.options || []).map((opt) => formatOptionLabel(opt, field.currency));
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const checked = selected.includes(opt);
          return (
            <label key={opt} className="flex items-center gap-2 text-[15px]">
              <input
                type="checkbox"
                value={opt}
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked ? [...selected, opt] : selected.filter((v) => v !== opt);
                  onChange(field.id, next);
                }}
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
              />
              {opt}
            </label>
          );
        })}
      </div>
    );
  }

  const common = {
    id: field.id,
    name: field.id,
    required: !!field.required,
    placeholder: field.placeholder || "",
    value: value ?? "",
    onChange: (e) =>
      onChange(field.id, field.type === "checkbox" ? e.target.checked : e.target.value),
    className: "field-input"
  };

  if (field.type === "textarea") {
    return <textarea {...common} rows={4} />;
  }

  if (field.type === "select") {
    return (
      <select {...common} value={value ?? ""}>
        <option value="" disabled>
          {field.placeholder || "Select an option"}
        </option>
        {(field.options || []).map((opt) => {
          const label = formatOptionLabel(opt, field.currency);
          return (
            <option key={opt} value={label}>
              {label}
            </option>
          );
        })}
      </select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-[15px]">
        <input
          type="checkbox"
          id={field.id}
          name={field.id}
          checked={!!value}
          required={!!field.required}
          onChange={(e) => onChange(field.id, e.target.checked)}
          className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
        />
        {field.placeholder || field.label}
      </label>
    );
  }

  return <input type={field.type || "text"} {...common} />;
}

const NO_OUTER_LABEL = new Set(["checkbox"]);

export default function DynamicForm({ productId, productSlug, form, ctaText = "Submit" }) {
  const router = useRouter();
  const fields = Array.isArray(form?.fields) ? form.fields : [];
  const [values, setValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function setField(id, value) {
    setValues((prev) => ({ ...prev, [id]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          formId: form?.id ?? null,
          data: values
        })
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Something went wrong. Please try again.");
      }

      const nameField = fields.find((f) => f.role === "name");
      const customerName = nameField ? values[nameField.id] : "";

      const params = new URLSearchParams({ product: productSlug });
      if (body.orderId) params.set("order", body.orderId);
      if (customerName) params.set("name", customerName);

      router.push(`/thank-you?${params.toString()}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted">
        This form has no fields configured yet. Add fields to it from the admin panel.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {fields.map((field) =>
        NO_OUTER_LABEL.has(field.type) ? (
          <div key={field.id}>
            <FieldInput field={field} value={values[field.id]} onChange={setField} />
          </div>
        ) : (
          <div key={field.id}>
            <label className="field-label">
              {field.label}
              {field.required && <span className="text-accent"> *</span>}
            </label>
            <FieldInput field={field} value={values[field.id]} onChange={setField} />
          </div>
        )
      )}

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
        {submitting ? "Submitting…" : ctaText}
      </button>
    </form>
  );
}