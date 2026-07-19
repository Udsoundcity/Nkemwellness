"use client";

import { useEffect, useState } from "react";
import AdminSection from "@/components/admin/AdminSection";
import MediaPicker from "@/components/admin/MediaPicker";

const EMPTY = {
  logo_url: "",
  logo_text: "The Shop",
  phone: "",
  phone_display: "",
  facebook_pixel_id: "",
  footer_contact_email: "",
  footer_contact_phone: "",
  footer_contact_address: "",
  privacy_policy: "",
  terms_conditions: "",
  copyright_text: ""
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-settings")
      .then((r) => r.json())
      .then((body) => {
        if (body.settings) setSettings({ ...EMPTY, ...body.settings });
      })
      .finally(() => setLoading(false));
  }, []);

  function update(patch) {
    setSettings((prev) => ({ ...prev, ...patch }));
    setSaved(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Could not save settings.");
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight mb-6">Site Settings</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <AdminSection title="Header" description="Logo and call button" defaultOpen>
          <div className="flex flex-col gap-4">
            <MediaPicker
              label="Logo (optional — falls back to text)"
              value={settings.logo_url}
              onChange={(url) => update({ logo_url: url })}
              accept="image/*"
            />
            <div>
              <label className="field-label">Logo text</label>
              <input className="field-input" value={settings.logo_text} onChange={(e) => update({ logo_text: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Phone number (for tel: links)</label>
                <input className="field-input" value={settings.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+15551234567" />
              </div>
              <div>
                <label className="field-label">Phone display text</label>
                <input
                  className="field-input"
                  value={settings.phone_display}
                  onChange={(e) => update({ phone_display: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>
        </AdminSection>

        <AdminSection title="Facebook Pixel" description="Loaded site-wide when set">
          <input
            className="field-input"
            value={settings.facebook_pixel_id}
            onChange={(e) => update({ facebook_pixel_id: e.target.value })}
            placeholder="123456789012345"
          />
        </AdminSection>

        <AdminSection title="Footer" description="Contact details and legal pages" defaultOpen>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label">Contact email</label>
                <input
                  className="field-input"
                  value={settings.footer_contact_email}
                  onChange={(e) => update({ footer_contact_email: e.target.value })}
                />
              </div>
              <div>
                <label className="field-label">Contact phone</label>
                <input
                  className="field-input"
                  value={settings.footer_contact_phone}
                  onChange={(e) => update({ footer_contact_phone: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="field-label">Address</label>
              <input
                className="field-input"
                value={settings.footer_contact_address}
                onChange={(e) => update({ footer_contact_address: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Privacy Policy (leave blank to hide the page)</label>
              <textarea
                className="field-input"
                rows={5}
                value={settings.privacy_policy}
                onChange={(e) => update({ privacy_policy: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Terms &amp; Conditions (leave blank to hide the page)</label>
              <textarea
                className="field-input"
                rows={5}
                value={settings.terms_conditions}
                onChange={(e) => update({ terms_conditions: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Copyright line</label>
              <input
                className="field-input"
                value={settings.copyright_text}
                onChange={(e) => update({ copyright_text: e.target.value })}
                placeholder="© 2026 The Shop. All rights reserved."
              />
            </div>
          </div>
        </AdminSection>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving…" : "Save settings"}
          </button>
          {saved && <span className="text-sm text-success font-medium">Saved.</span>}
        </div>
      </form>
    </div>
  );
}
