"use client";

import { useState } from "react";

export default function ConfirmButton({ onConfirm, label = "Delete", confirmLabel = "Sure?", className = "" }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
            setBusy(false);
            setConfirming(false);
          }}
          className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
        >
          {busy ? "Deleting…" : confirmLabel}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-sm text-muted hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={className || "text-sm font-medium text-muted hover:text-red-600"}
    >
      {label}
    </button>
  );
}
