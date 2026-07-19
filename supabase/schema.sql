-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- Safe to re-run.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- forms: reusable form definitions that can be attached to products
-- ---------------------------------------------------------------------------
create table if not exists forms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'embedded' check (type in ('embedded', 'iframe', 'external')),
  fields jsonb not null default '[]',
  iframe_url text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products: up to 10 conversion-focused landing pages.
-- Everything below the fold (hero copy, trust badges, problem/solution,
-- benefits, how-it-works, features, reviews, before/after, free gift, FAQ)
-- lives in the `content` jsonb column so the whole page can be edited from
-- one admin form without a schema migration every time a section changes.
-- See lib/defaultContent.js for the exact shape + defaults.
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  active boolean not null default true,
  sort_order integer not null default 0,

  form_type text not null default 'none' check (form_type in ('embedded', 'iframe', 'external', 'none')),
  form_id uuid references forms(id) on delete set null,
  iframe_url text,
  external_url text,

  content jsonb not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_settings: a single row (id = 1) that drives the sticky header,
-- footer, and Facebook Pixel across the whole site.
-- ---------------------------------------------------------------------------
create table if not exists site_settings (
  id integer primary key default 1,
  logo_url text,
  logo_text text not null default 'The Shop',
  phone text,
  phone_display text,
  facebook_pixel_id text,
  footer_contact_email text,
  footer_contact_phone text,
  footer_contact_address text,
  privacy_policy text,
  terms_conditions text,
  copyright_text text not null default '© The Shop. All rights reserved.',
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

insert into site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- orders: customer submissions / external-form clicks
-- ---------------------------------------------------------------------------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete set null,
  product_name text,
  form_id uuid references forms(id) on delete set null,
  data jsonb not null default '{}',
  status text not null default 'new' check (status in ('new', 'contacted', 'completed', 'spam')),
  created_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at desc);
create index if not exists products_sort_order_idx on products (sort_order);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Admin CRUD happens server-side with the service role key (bypasses RLS).
-- These policies cover what the public anon key may do directly.
-- ---------------------------------------------------------------------------
alter table products enable row level security;
alter table forms enable row level security;
alter table orders enable row level security;
alter table site_settings enable row level security;

drop policy if exists "public can read active products" on products;
create policy "public can read active products"
  on products for select
  using (active = true);

drop policy if exists "public can read forms" on forms;
create policy "public can read forms"
  on forms for select
  using (true);

drop policy if exists "public can submit orders" on orders;
create policy "public can submit orders"
  on orders for insert
  with check (true);

drop policy if exists "public can read site settings" on site_settings;
create policy "public can read site settings"
  on site_settings for select
  using (true);

-- No public select/update/delete policies on orders -> only the service
-- role (used by the admin API routes) can read or manage submissions.

-- ---------------------------------------------------------------------------
-- Storage: a public bucket for admin-uploaded images/videos (hero slides,
-- benefit icons, review photos, before/after shots, etc). Uploads happen
-- server-side via the service role key (see app/api/admin/upload), so no
-- public write policy is needed — only public read.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "public can read media" on storage.objects;
create policy "public can read media"
  on storage.objects for select
  using (bucket_id = 'media');
