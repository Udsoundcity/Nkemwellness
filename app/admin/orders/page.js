"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Download, RefreshCw, Trash2 } from "lucide-react";
import { NIGERIA_STATES } from "@/lib/nigeriaStates";
import { formatPrice } from "@/lib/format";
import { sumNairaAmounts } from "@/lib/currency";
import ConfirmButton from "@/components/ConfirmButton";

const STATUS_META = {
  new: { label: "Pending", badge: "bg-accent-soft text-accent" },
  contacted: { label: "Contacted", badge: "bg-amber-100 text-amber-700" },
  completed: { label: "Delivered", badge: "bg-success/10 text-success" },
  spam: { label: "Spam", badge: "bg-line text-muted" }
};
const STATUSES = Object.keys(STATUS_META);
const PAGE_SIZE = 50;

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function csvEscape(value) {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? '"' + str.replace(/"/g, '""') + '"' : str;
}

function downloadCsv(orders) {
  const labelSet = new Set();
  orders.forEach((o) => {
    const labels = o.field_labels || {};
    Object.keys(o.data || {}).forEach((k) => labelSet.add(labels[k] || k));
  });
  const extraColumns = Array.from(labelSet);
  const header = ["Reference ID", "Product", "Status", "Date", ...extraColumns];

  const rows = orders.map((o) => {
    const labels = o.field_labels || {};
    const valueByLabel = {};
    Object.entries(o.data || {}).forEach(([k, v]) => {
      valueByLabel[labels[k] || k] = Array.isArray(v) ? v.join("; ") : v;
    });
    return [
      o.id,
      o.product_name || "",
      STATUS_META[o.status]?.label || o.status,
      new Date(o.created_at).toISOString(),
      ...extraColumns.map((col) => valueByLabel[col] ?? "")
    ];
  });

  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);

  async function load() {
    const [ordersRes, productsRes] = await Promise.all([fetch("/api/orders"), fetch("/api/products")]);
    const ordersBody = await ordersRes.json();
    const productsBody = await productsRes.json();
    if (ordersRes.ok) setOrders(ordersBody.orders);
    if (productsRes.ok) {
      const map = {};
      for (const p of productsBody.products || []) {
        map[p.id] = { price: p.content?.hero?.price ?? null, currency: p.content?.hero?.currency || "USD" };
      }
      setProducts(map);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id, status) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    if (res.ok) {
      const body = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...body.order } : o)));
    }
  }

  async function handleDelete(id) {
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    await Promise.all([...selected].map((id) => fetch(`/api/orders/${id}`, { method: "DELETE" })));
    setOrders((prev) => prev.filter((o) => !selected.has(o.id)));
    setSelected(new Set());
    setBulkDeleting(false);
    setConfirmBulk(false);
  }

  const filtered = useMemo(() => {
    if (!orders) return null;
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (dateFilter && new Date(o.created_at).toISOString().slice(0, 10) !== dateFilter) return false;
      if (stateFilter !== "all") {
        const values = Object.values(o.data || {});
        if (!values.includes(stateFilter)) return false;
      }
      if (q) {
        const inProduct = (o.product_name || "").toLowerCase().includes(q);
        const inData = Object.values(o.data || {}).some((v) =>
          (Array.isArray(v) ? v.join(" ") : String(v)).toLowerCase().includes(q)
        );
        if (!inProduct && !inData) return false;
      }
      return true;
    });
  }, [orders, search, stateFilter, statusFilter, dateFilter]);

  // Jump back to page 1 whenever a filter changes, so you don't end up
  // stranded on a now-empty page.
  useEffect(() => {
    setPage(1);
  }, [search, stateFilter, statusFilter, dateFilter]);

  const totalPages = filtered ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1;

  // Also clamp after deletions shrink the list (e.g. deleting the only
  // item on the last page).
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    if (!filtered) return null;
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filtered, page]);

  const stats = useMemo(() => {
    if (!orders) return null;
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "new").length;
    const delivered = orders.filter((o) => o.status === "completed").length;

    // Prefer the actual amount the customer selected (any field marked with
    // Naira formatting, e.g. a "Select Quantity" field) — this is what was
    // really ordered, unlike the product's flat base price. Only fall back
    // to the product's price if an order has no priced field at all (e.g.
    // an external-link click, or a form with no currency field).
    const revenueByCurrency = {};
    for (const o of orders) {
      if (o.status === "spam") continue;

      const meta = o.field_meta || {};
      let orderTotal = 0;
      let foundPricedField = false;
      for (const [fieldId, value] of Object.entries(o.data || {})) {
        if (!meta[fieldId]?.currency) continue;
        foundPricedField = true;
        orderTotal += sumNairaAmounts(value);
      }

      if (foundPricedField) {
        revenueByCurrency.NGN = (revenueByCurrency.NGN || 0) + orderTotal;
        continue;
      }

      const product = products[o.product_id];
      if (!product || product.price === null || product.price === undefined) continue;
      const currency = product.currency || "USD";
      revenueByCurrency[currency] = (revenueByCurrency[currency] || 0) + Number(product.price);
    }
    const revenueLines = Object.entries(revenueByCurrency).map(([currency, amount]) => formatPrice(amount, currency));

    return { total, pending, delivered, revenueLines };
  }, [orders, products]);

  const allVisibleSelected = paginated && paginated.length > 0 && paginated.every((o) => selected.has(o.id));

  function toggleSelectAll() {
    if (!paginated) return;
    setSelected((prev) => {
      if (allVisibleSelected) {
        const next = new Set(prev);
        paginated.forEach((o) => next.delete(o.id));
        return next;
      }
      const next = new Set(prev);
      paginated.forEach((o) => next.add(o.id));
      return next;
    });
  }

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Orders</h1>
          <p className="text-sm text-muted mt-1">{orders ? `${orders.length} orders` : "Loading…"}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line hover:border-ink/30"
            aria-label="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => filtered && downloadCsv(filtered)}
            disabled={!filtered || filtered.length === 0}
            className="btn-secondary !px-4 !py-2 text-sm disabled:opacity-40"
          >
            <Download size={15} /> CSV
          </button>
        </div>
      </div>

      {/* STATS ------------------------------------------------------- */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Total Orders</p>
          <p className="mt-1 font-display text-2xl font-extrabold">{stats ? stats.total : "—"}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Pending</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-accent">{stats ? stats.pending : "—"}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Delivered</p>
          <p className="mt-1 font-display text-2xl font-extrabold text-success">{stats ? stats.delivered : "—"}</p>
        </div>
        <div className="card p-4 overflow-hidden">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Est. Revenue</p>
          <p className="mt-1 break-words font-display text-base font-extrabold text-warn sm:text-lg">
            {stats && stats.revenueLines.length > 0 ? stats.revenueLines.join(" + ") : "—"}
          </p>
        </div>
      </div>

      {/* FILTERS ------------------------------------------------------ */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or phone…"
            className="field-input !pl-9"
          />
        </div>
        <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="field-input">
          <option value="all">All States</option>
          {NIGERIA_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-6 grid grid-cols-2 gap-3">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="field-input">
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="field-input"
          />
          {dateFilter && (
            <button
              type="button"
              onClick={() => setDateFilter("")}
              className="mt-1 text-xs text-muted hover:text-ink"
            >
              Clear date
            </button>
          )}
        </div>
      </div>

      {/* BULK ACTIONS --------------------------------------------------- */}
      {paginated && paginated.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-xl border border-line bg-white px-4 py-2.5">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={toggleSelectAll}
              className="h-4 w-4 rounded border-line text-accent focus:ring-accent"
            />
            Select all on this page ({paginated.length})
          </label>
          {selected.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted">{selected.size} selected</span>
              {confirmBulk ? (
                <span className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="text-sm font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    {bulkDeleting ? "Deleting…" : "Confirm delete"}
                  </button>
                  <button onClick={() => setConfirmBulk(false)} className="text-sm text-muted hover:underline">
                    Cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => setConfirmBulk(true)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:underline"
                >
                  <Trash2 size={14} /> Delete selected
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* LIST ------------------------------------------------------------ */}
      {filtered === null ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-muted">No submissions match your filters.</div>
      ) : (
        <>
          <div className="card divide-y divide-line overflow-hidden">
            {paginated.map((order) => {
              const isOpen = expanded === order.id;
              const labels = order.field_labels || {};
              const dataEntries = Object.entries(order.data || {});
              return (
                <div key={order.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected.has(order.id)}
                        onChange={() => toggleOne(order.id)}
                        className="h-4 w-4 flex-none rounded border-line text-accent focus:ring-accent"
                      />
                      <button onClick={() => setExpanded(isOpen ? null : order.id)} className="min-w-0 flex-1 text-left">
                        <p className="font-semibold truncate">{order.product_name || "Deleted product"}</p>
                        <p className="text-sm text-muted">{formatDate(order.created_at)}</p>
                      </button>
                    </div>
                    <div className="flex flex-none items-center gap-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className={`rounded-full border-0 px-3 py-1 text-xs font-semibold focus:ring-2 focus:ring-accent-soft ${STATUS_META[order.status]?.badge}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                      <ConfirmButton onConfirm={() => handleDelete(order.id)} label="Delete" />
                    </div>
                  </div>

                  {isOpen && (
                    <dl className="mt-3 grid grid-cols-1 gap-2 rounded-xl bg-paper p-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted">Reference ID</dt>
                        <dd className="break-words font-mono text-xs">{order.id}</dd>
                      </div>
                      {dataEntries.length === 0 ? (
                        <p className="text-muted">No additional data.</p>
                      ) : (
                        dataEntries.map(([key, value]) => (
                          <div key={key}>
                            <dt className="text-xs uppercase tracking-wide text-muted">{labels[key] || key}</dt>
                            <dd className="break-words">{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
                          </div>
                        ))
                      )}
                    </dl>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary !px-4 !py-1.5 text-sm disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="text-sm text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary !px-4 !py-1.5 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}