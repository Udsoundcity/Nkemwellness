# The Shop — mobile-first sales landing pages

A Next.js storefront where each of up to 10 products is a full conversion-
focused sales page (sticky header, hero slider with countdown, trust badges,
problem/solution, benefits, how-it-works, features, reviews, before/after,
free gift, FAQ, adaptive order form, sticky bottom bar) — all editable from
an admin panel with local auth. Content and media live in Supabase.

## Stack

- **Next.js 14** (App Router, JavaScript)
- **Tailwind CSS** for styling, with a small set of custom keyframes for
  smooth section/menu/bar transitions
- **lucide-react** for icons
- **Supabase**: Postgres for content, Storage for uploaded images/video
- **Local auth**: single admin account (env-configured), bcrypt password
  hash, signed JWT session cookie — no third-party auth provider

## 1. Install dependencies

```bash
npm install
```

## 2. Create the Supabase project, schema, and storage bucket

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → **New query**, paste the contents of
   `supabase/schema.sql`, and run it. This creates:
   - `products` — top-level fields (name, slug, active, sort order, form
     assignment) plus a `content` jsonb column holding every landing-page
     section (see `lib/defaultContent.js` for the exact shape).
   - `forms` — reusable embedded/iframe/external form definitions.
   - `orders` — customer submissions and external-link clicks.
   - `site_settings` — a single row driving the header, footer, and
     Facebook Pixel.
   - A public **`media` Storage bucket** for admin-uploaded images/video,
     with a public-read policy (uploads themselves go through a protected
     API route using the service role key, so no public write policy is
     needed).
3. Copy your **Project URL**, **anon public key**, and **service_role key**
   from Project Settings → API.

## 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` — from Supabase.
- `ADMIN_USERNAME` — your admin login username.
- `ADMIN_PASSWORD_HASH` — generate with `npm run hash-password -- "your-password"`.
- `ADMIN_SESSION_SECRET` — a long random string (`openssl rand -base64 48`).
- `NEXT_PUBLIC_SITE_URL` — your site's base URL.

**Never commit `.env.local`.** The service role key bypasses Row Level
Security and is only ever imported from `lib/supabaseAdmin.js`, which is
never used in a client component.

## 4. Run it

```bash
npm run dev
```

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

## Deploying to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket and import it in Vercel.
2. Add the same environment variables from `.env.local` in Vercel's
   Project Settings → Environment Variables.
3. Deploy — the app is a standard Next.js App Router project with no
   special build config required.

## How it's organized

```
app/
  layout.js                       root layout: fonts only
  (site)/                         route group for public pages (shares one
                                   layout with the sticky Header, Footer,
                                   and Facebook Pixel — doesn't affect URLs)
    layout.js                     fetches site_settings, renders Header/Footer/Pixel
    page.js                       storefront home (up to 10 products)
    products/[slug]/page.js       the sales landing page, assembles every section
    thank-you/page.js             post-submission confirmation
    privacy-policy/, terms-conditions/   rendered from Admin > Settings text
  admin/                          local-auth admin panel (own layout/nav, no
                                   public Header/Footer)
    login/, page.js (dashboard)
    products/                     add/edit/delete + the full section editor
    forms/                        embedded/iframe/external form builder
    orders/                       submissions inbox
    settings/                     header/footer/pixel/legal pages
  api/
    admin/login, logout           session cookie issuance/clearing
    admin/upload                  server-side upload to Supabase Storage
    admin/site-settings           admin read/write for site_settings
    site-settings                 public read for site_settings
    products, products/[id]       admin CRUD (protected)
    forms, forms/[id]             admin CRUD (protected)
    orders, orders/[id]           admin read/update/delete (protected)
    submit                        public: embedded-form submissions -> orders
    go/[slug]                     public: logs + redirects external-link products
components/
  site/            Header, Footer, FacebookPixel
  landing/         HeroSection, HeroSlider, CountdownTimer, StickyBottomBar,
                    TrustBadges, ProblemSolution, Benefits, HowItWorks,
                    Features, Reviews, BeforeAfter, FreeGift, FAQ,
                    OrderFormSection
  admin/           AdminSection (collapsible card), Repeater (array editor),
                    MediaPicker (upload or paste URL/YouTube)
  ProductForm.js, FormForm.js, ProductCard.js, DynamicForm.js, ConfirmButton.js
lib/
  supabaseClient.js    anon client (public reads, order inserts)
  supabaseAdmin.js     service-role client — SERVER ONLY
  auth.js              JWT session helpers, requireAdmin()
  defaultContent.js    the canonical product.content shape + merge helper
  media.js             YouTube URL parsing, thumbnails, embed URLs
  format.js            price/discount formatting
  icons.js             curated icon name lists for admin selects
middleware.js          protects /admin/* pages
supabase/schema.sql    tables, RLS policies, storage bucket
```

## Editing a product's landing page

Every section on a product page — hero, trust badges, problem, solution,
benefits, how-it-works, features, reviews, before/after, free gift, FAQ,
and the order form — is edited from one collapsible form at
`/admin/products/[id]/edit`. Optional sections (Problem, Solution,
How It Works, Features, Reviews) have a **Show on page** switch; Before &
After, Free Gift, and FAQ are simply omitted (`null`) from the page until
an admin turns them on, per the "return null if not configured" behavior.

## Media: upload or paste a link

Every image/video field in the admin (`MediaPicker`) offers two tabs:

- **URL / YouTube** — paste any direct image/video URL or a YouTube link;
  YouTube links are auto-detected and embedded appropriately.
- **Upload** — sends the file to `/api/admin/upload`, which (after
  verifying the admin session) uploads it to the Supabase `media` bucket
  using the service role key and returns a public URL.

## How product forms work

Each product has a `form_type`: `none`, `embedded`, `iframe`, or `external`.

- **Embedded**: a saved form's fields render directly in the Order Form
  section; submissions POST to `/api/submit`, are written to `orders`, and
  the visitor is redirected to `/thank-you`.
- **Iframe**: embeds any external form (Google Forms, Typeform, Jotform,
  etc.) responsively, without a single fixed pixel height across every
  screen size.
- **External**: a button that opens an external URL in a new tab, routed
  through `/api/go/[slug]` first so the click is still logged as a
  submission for visibility in the admin Orders view.

The sticky bottom bar (price + Order Now) and the hero's Order Now button
both scroll smoothly to `#order-form`; the bottom bar hides automatically
while the order form is on screen and reappears once it scrolls away
(`IntersectionObserver` in `StickyBottomBar.js`).

## Notes & limits

- The 10-product cap is enforced server-side in `POST /api/products`.
- Single admin account by design (local auth, no user management UI) —
  rotate `ADMIN_PASSWORD_HASH` any time via `npm run hash-password`.
- Uploaded files are capped at 25MB in `/api/admin/upload`.
