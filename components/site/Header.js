"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#products", label: "Products" },
  { href: "/#contact", label: "Contact" }
];

export default function Header({ settings }) {
  const [open, setOpen] = useState(false);
  const logoText = settings?.logo_text || "The Shop";
  const phone = settings?.phone || "";
  const phoneDisplay = settings?.phone_display || phone;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3.5">
        <Link href="/" className="flex items-center gap-2 min-w-0" onClick={() => setOpen(false)}>
          {settings?.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={logoText} className="h-8 w-auto flex-none" />
          ) : (
            <span className="font-display text-lg font-bold tracking-tight truncate">{logoText}</span>
          )}
        </Link>

        <div className="flex items-center gap-2">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/85"
            >
              <Phone size={14} /> {phoneDisplay}
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              aria-label="Call us"
              className="inline-flex sm:hidden h-9 w-9 flex-none items-center justify-center rounded-full bg-ink text-white"
            >
              <Phone size={15} />
            </a>
          )}
          <nav className="hidden sm:flex items-center gap-5 ml-2">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted hover:text-ink transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="inline-flex sm:hidden h-9 w-9 flex-none items-center justify-center rounded-full border border-line"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="sm:hidden border-t border-line/70 bg-paper px-5 py-3 animate-fadeIn">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-black/5"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
