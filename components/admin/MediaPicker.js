"use client";

import { useRef, useState } from "react";
import { UploadCloud, Link as LinkIcon, X } from "lucide-react";

/** Single-value media picker: upload a file to Supabase Storage, or paste a
 * direct URL / YouTube link. Used for every image/video field in the admin. */
export default function MediaPicker({ label, value, onChange, accept = "image/*,video/*" }) {
  const [mode, setMode] = useState("url");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Upload failed.");
      onChange(body.url);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isVideo = value && /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(value);
  const isYouTube = value && /youtu/.test(value);

  return (
    <div>
      {label && <label className="field-label">{label}</label>}

      {value ? (
        <div className="flex items-center gap-3 rounded-xl border border-line p-2">
          <div className="h-14 w-14 flex-none overflow-hidden rounded-lg bg-line/40">
            {isVideo || isYouTube ? (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted">
                {isYouTube ? "YouTube" : "Video"}
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <p className="min-w-0 flex-1 truncate text-xs text-muted">{value}</p>
          <button
            type="button"
            onClick={() => onChange("")}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-muted hover:bg-black/5 hover:text-red-600"
            aria-label="Remove media"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex gap-1 rounded-lg bg-paper p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-medium ${
                mode === "url" ? "bg-white shadow-sm" : "text-muted"
              }`}
            >
              <LinkIcon size={13} /> URL / YouTube
            </button>
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 font-medium ${
                mode === "upload" ? "bg-white shadow-sm" : "text-muted"
              }`}
            >
              <UploadCloud size={13} /> Upload
            </button>
          </div>

          {mode === "url" ? (
            <input
              className="field-input"
              placeholder="https://... or a YouTube link"
              onBlur={(e) => e.target.value && onChange(e.target.value.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onChange(e.currentTarget.value.trim());
                }
              }}
            />
          ) : (
            <div>
              <input ref={inputRef} type="file" accept={accept} onChange={handleFile} className="text-sm" />
              {uploading && <p className="mt-1 text-xs text-muted">Uploading…</p>}
            </div>
          )}
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
