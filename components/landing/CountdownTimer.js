"use client";

import { useEffect, useState } from "react";

function computeTarget(mode, endISO, dailyTime) {
  if (mode === "daily") {
    const [h, m] = (dailyTime || "00:00").split(":").map((n) => parseInt(n, 10) || 0);
    const now = new Date();
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
    return target;
  }
  return endISO ? new Date(endISO) : null;
}

function diffToUnits(target) {
  if (!target) return null;
  const diff = target.getTime() - Date.now();
  if (isNaN(diff) || diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60)
  };
}

function Unit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ink font-display text-lg font-bold text-white sm:h-14 sm:w-14 sm:text-xl">
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted">{label}</span>
    </div>
  );
}

/**
 * mode "once": counts down to a fixed `endISO` timestamp, then disappears
 *   for good once it passes (original behavior).
 * mode "daily": counts down to `dailyTime` ("HH:MM", local time) every day.
 *   Once it hits zero it automatically rolls forward to the same time the
 *   next day and keeps counting — no manual reset needed.
 *
 * Renders nothing until after the component has mounted in the browser.
 * A live "seconds remaining" value depends on the exact instant it's
 * computed, so computing it during server rendering would almost always
 * disagree with the value computed a moment later during client hydration
 * — that mismatch is what throws React's hydration error. Waiting for
 * `mounted` keeps the very first client render identical to the server
 * render (both show nothing), then the real countdown appears immediately
 * after via a normal (non-hydration) state update.
 */
export default function CountdownTimer({ mode = "once", endISO, dailyTime, label }) {
  const [mounted, setMounted] = useState(false);
  const [left, setLeft] = useState(null);

  useEffect(() => {
    setMounted(true);
    const tick = () => setLeft(diffToUnits(computeTarget(mode, endISO, dailyTime)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [mode, endISO, dailyTime]);

  if (!mounted || !left) return null;

  return (
    <div className="flex flex-col items-center gap-2 sm:items-start">
      {label && <p className="text-sm font-semibold text-warn">{label}</p>}
      <div className="flex items-center gap-2 sm:gap-3">
        <Unit value={left.days} label="Days" />
        <span className="pb-4 font-display text-lg font-bold text-line">:</span>
        <Unit value={left.hours} label="Hrs" />
        <span className="pb-4 font-display text-lg font-bold text-line">:</span>
        <Unit value={left.minutes} label="Min" />
        <span className="pb-4 font-display text-lg font-bold text-line">:</span>
        <Unit value={left.seconds} label="Sec" />
      </div>
    </div>
  );
}