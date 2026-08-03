begin;

create table if not exists public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  description text,
  active boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.content_pages(id) on delete cascade,
  section_type text not null check (section_type in ('hero','section','highlight','image','list','comparison','faq','cta')),
  sort_order integer not null default 0 check (sort_order >= 0),
  active boolean not null default true,
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists content_sections_page_order_idx on public.content_sections(page_id, sort_order);

create table if not exists public.products (
  id text primary key check (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null,
  description text not null default '',
  category text not null,
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  image_alt text not null default '',
  requires_shipping boolean not null default true,
  weight_grams integer not null default 0 check (weight_grams >= 0),
  height_cm numeric(10,2) not null default 0 check (height_cm >= 0),
  width_cm numeric(10,2) not null default 0 check (width_cm >= 0),
  length_cm numeric(10,2) not null default 0 check (length_cm >= 0),
  insured_value_cents integer not null default 0 check (insured_value_cents >= 0),
  stock integer check (stock is null or stock >= 0),
  sort_order integer not null default 0,
  featured boolean not null default false,
  active boolean not null default true,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_pages enable row level security;
alter table public.content_sections enable row level security;
alter table public.products enable row level security;

drop policy if exists "published content pages are public" on public.content_pages;
create policy "published content pages are public" on public.content_pages for select to anon, authenticated
  using (active and published_at is not null and published_at <= now());
drop policy if exists "published content sections are public" on public.content_sections;
create policy "published content sections are public" on public.content_sections for select to anon, authenticated
  using (active and exists (select 1 from public.content_pages p where p.id = page_id and p.active and p.published_at <= now()));
drop policy if exists "active products are public" on public.products;
create policy "active products are public" on public.products for select to anon, authenticated
  using (active and deleted_at is null);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('eleve-media', 'eleve-media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read eleve media" on storage.objects;
create policy "public can read eleve media" on storage.objects for select to anon, authenticated
  using (bucket_id = 'eleve-media');

-- Não há policies de INSERT, UPDATE ou DELETE para anon/authenticated.
-- Uploads administrativos usam a service role exclusivamente no servidor, que ignora RLS.

commit;
