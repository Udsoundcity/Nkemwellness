"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "number",
  "textarea",
  "select",
  "radio",
  "checkbox_group",
  "state",
  "checkbox"
];

const OPTION_TYPES = new Set(["select", "radio", "checkbox_group"]);

const FIELD_TYPE_LABELS = {
  text: "text",
  email: "email",
  tel: "tel",
  number: "number",
  textarea: "textarea",
  select: "select (dropdown)",
  radio: "radio (bullet choice)",
  checkbox_group: "checkbox group (multi-select)",
  state: "state (Nigeria, 36 states)",
  checkbox: "checkbox (single yes/no)"
};

function newField() {
  return {
    id: `f_${Math.random().toString(36).slice(2, 9)}`,
    label: "",
    type: "text",
    required: false,
    placeholder: "",
    options: "",
    currency: false,
    role: ""
  };
}

function fieldsFromServer(fields) {
  return (fields || []).map((f) => ({
    ...f,
    options: Array.isArray(f.options) ? f.options.join(", ") : f.options || "",
    currency: !!f.currency,
    role: f.role || ""
  }));
}

export default function FormForm({ formId }) {
  const router = useRouter();
  const isEdit = !!formId;
  const [name, setName] = useState("");
  const [type, setType] = useState("embedded");
  const [fields, setFields] = useState([newField()]);
  const [iframeUrl, setIframeUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    fetch(`/api/forms/${formId}`)
      .then((r) => r.json())
      .then((body) => {
        const form = body.form;
        if (!form) return;
        setName(form.name);
        setType(form.type);
        setFields(form.fields?.length ? fieldsFromServer(form.fields) : [newField()]);
        setIframeUrl(form.iframe_url || "");
        setExternalUrl(form.external_url || "");
      })
      .finally(() => setLoading(false));
  }, [isEdit, formId]);

  function updateField(index, key, value) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, [key]: value } : f)));
  }

  function removeField(index) {
    setFields((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      name,
      type,
      fields:
        type === "embedded"
          ? fields
              .filter((f) => f.label.trim())
              .map((f) => ({
                ...f,
                currency: OPTION_TYPES.has(f.type) ? !!f.currency : false,
                options: OPTION_TYPES.has(f.type)
                  ? f.options
                      .split(",")
                      .map((o) => o.trim())
                      .filter(Boolean)
                  : undefined
              }))
          : [],
      iframe_url: type === "iframe" ? iframeUrl : null,
      external_url: type === "external" ? externalUrl : null
    };

    try {
      const res = await fetch(isEdit ? `/api/forms/${formId}` : "/api/forms", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save form.");
      router.push("/admin/forms");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <section className="card p-6 flex flex-col gap-4">
        <div>
          <label className="field-label">Form name</label>
          <input className="field-input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="field-label">Type</label>
          <select className="field-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="embedded">Embedded (fields rendered on the page)</option>
            <option value="iframe">Iframe embed (e.g. Google Form, Typeform)</option>
            <option value="external">External link</option>
          </select>
        </div>

        {type === "iframe" && (
          <div>
            <label className="field-label">Iframe URL</label>
            <input
              className="field-input"
              value={iframeUrl}
              onChange={(e) => setIframeUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
        )}

        {type === "external" && (
          <div>
            <label className="field-label">External URL</label>
            <input
              className="field-input"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
        )}
      </section>

      {type === "embedded" && (
        <section className="card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Fields</h2>
            <button type="button" className="btn-secondary !px-4 !py-2 text-sm" onClick={() => setFields((p) => [...p, newField()])}>
              Add field
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {fields.map((field, i) => (
              <div key={field.id} className="rounded-xl border border-line p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="field-label">Label</label>
                    <input
                      className="field-input"
                      value={field.label}
                      onChange={(e) => updateField(i, "label", e.target.value)}
                      placeholder="Email address"
                    />
                  </div>
                  <div>
                    <label className="field-label">Type</label>
                    <select
                      className="field-input"
                      value={field.type}
                      onChange={(e) => updateField(i, "type", e.target.value)}
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {FIELD_TYPE_LABELS[t] || t}
                        </option>
                      ))}
                    </select>
                  </div>
                  {field.type !== "state" && (
                    <div>
                      <label className="field-label">Placeholder</label>
                      <input
                        className="field-input"
                        value={field.placeholder}
                        onChange={(e) => updateField(i, "placeholder", e.target.value)}
                      />
                    </div>
                  )}
                  {OPTION_TYPES.has(field.type) && (
                    <div>
                      <label className="field-label">Options (comma separated)</label>
                      <input
                        className="field-input"
                        value={field.options}
                        onChange={(e) => updateField(i, "options", e.target.value)}
                        placeholder="e.g. Small, Medium, Large — or 1 Pack of Tea|25000, 2 Packs of Tea|33000"
                      />
                    </div>
                  )}
                </div>

                {OPTION_TYPES.has(field.type) && (
                  <div className="mt-3 rounded-lg bg-paper p-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={!!field.currency}
                        onChange={(e) => updateField(i, "currency", e.target.checked)}
                        className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
                      />
                      Format options as Naira (₦)
                    </label>
                    {field.currency && (
                      <p className="mt-1.5 text-xs text-muted">
                        Plain numbers format on their own: <code>25000</code> → ₦25,000. If an
                        option has a label too, separate it from the amount with a{" "}
                        <code>|</code>: <code>1 Pack of Tea|25000</code> → &ldquo;1 Pack of Tea
                        ₦25,000&rdquo;. Without the <code>|</code>, digits inside the label (like
                        the &ldquo;1&rdquo;) would get merged into the price.
                      </p>
                    )}
                  </div>
                )}

                {field.type === "text" && (
                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.role === "name"}
                      onChange={(e) =>
                        setFields((prev) =>
                          prev.map((f, idx) => ({
                            ...f,
                            role: idx === i ? (e.target.checked ? "name" : "") : f.role === "name" ? "" : f.role
                          }))
                        )
                      }
                      className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
                    />
                    Use as the customer's name (shown on the Thank You page)
                  </label>
                )}

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(i, "required", e.target.checked)}
                      className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    className="text-sm font-medium text-muted hover:text-red-600"
                  >
                    Remove field
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : isEdit ? "Save changes" : "Create form"}
        </button>
        <button type="button" onClick={() => router.push("/admin/forms")} className="btn-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}