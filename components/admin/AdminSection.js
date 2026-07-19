"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

/** Collapsible card used to organize the long product editor into sections.
 * If `enabled`/`onToggleEnabled` are provided, shows a publish switch for
 * optional landing-page sections (Problem, Solution, How it Works, etc). */
export default function AdminSection({ title, description, defaultOpen = false, enabled, onToggleEnabled, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
      >
        <div>
          <h2 className="font-display text-base font-bold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted">{description}</p>}
        </div>
        <div className="flex flex-none items-center gap-3">
          {onToggleEnabled && (
            <label
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 text-xs font-medium text-muted"
            >
              <input
                type="checkbox"
                checked={!!enabled}
                onChange={(e) => onToggleEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
              />
              Show on page
            </label>
          )}
          <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>
      {open && <div className="border-t border-line px-6 py-5">{children}</div>}
    </section>
  );
}
