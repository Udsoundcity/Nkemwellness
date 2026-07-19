import Link from "next/link";

export default function Footer({ settings }) {
  const email = settings?.footer_contact_email;
  const phone = settings?.footer_contact_phone;
  const address = settings?.footer_contact_address;
  const copyright = settings?.copyright_text || `© ${new Date().getFullYear()} The Shop. All rights reserved.`;
  const hasPrivacy = !!settings?.privacy_policy;
  const hasTerms = !!settings?.terms_conditions;

  return (
    <footer id="contact" className="border-t border-line/70 bg-white">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <div>
            <p className="font-display text-base font-bold">{settings?.logo_text || "The Shop"}</p>
            <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted">
              {phone && (
                <a href={`tel:${phone}`} className="hover:text-ink transition-colors">
                  {phone}
                </a>
              )}
              {email && (
                <a href={`mailto:${email}`} className="hover:text-ink transition-colors">
                  {email}
                </a>
              )}
              {address && <span>{address}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5 text-sm sm:items-end">
            {hasPrivacy && (
              <Link href="/privacy-policy" className="text-muted hover:text-ink transition-colors">
                Privacy Policy
              </Link>
            )}
            {hasTerms && (
              <Link href="/terms-conditions" className="text-muted hover:text-ink transition-colors">
                Terms &amp; Conditions
              </Link>
            )}
          </div>
        </div>
        <p className="mt-8 text-xs text-muted">{copyright}</p>
      </div>
    </footer>
  );
}
