"use client";

import { Plus, Trash2 } from "lucide-react";

/** Generic "list of cards" editor for arrays of objects (benefits, features,
 * steps, reviews, FAQ, before/after pairs, ...). The caller supplies how to
 * render each item's fields via `renderItem`. */
export default function Repeater({ items = [], onChange, newItem, maxItems, addLabel = "Add item", renderItem }) {
  function updateItem(index, patch) {
    const next = items.map((it, i) => (i === index ? { ...it, ...patch } : it));
    onChange(next);
  }
  function removeItem(index) {
    onChange(items.filter((_, i) => i !== index));
  }
  function addItem() {
    onChange([...items, newItem()]);
  }

  const atLimit = maxItems && items.length >= maxItems;

  return (
    <div className="flex flex-col gap-4">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-line p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">{renderItem(item, i, (patch) => updateItem(i, patch))}</div>
            <button
              type="button"
              onClick={() => removeItem(i)}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-muted hover:bg-black/5 hover:text-red-600"
              aria-label="Remove"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}

      {!atLimit && (
        <button
          type="button"
          onClick={addItem}
          className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-line py-3 text-sm font-medium text-muted hover:border-accent hover:text-accent"
        >
          <Plus size={15} /> {addLabel}
          {maxItems ? ` (${items.length}/${maxItems})` : ""}
        </button>
      )}
    </div>
  );
}
