create table public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id),
  seller_slug text not null,
  customer_name text,
  customer_email text,
  customer_phone text,
  amount_cents bigint not null check (amount_cents > 0),
  installments smallint check (installments is null or installments > 0),
  provider text not null default 'infinitepay',
  provider_transaction_id text,
  provider_status text,
  status text not null check (status in ('initiated', 'link_created', 'provider_rejected', 'provider_error', 'internal_error', 'paid')),
  error_code text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payment_attempts_order_id_idx on public.payment_attempts (order_id);
create index payment_attempts_created_at_idx on public.payment_attempts (created_at desc);
create index payment_attempts_status_created_at_idx on public.payment_attempts (status, created_at desc);
create index payment_attempts_provider_transaction_id_idx
  on public.payment_attempts (provider_transaction_id)
  where provider_transaction_id is not null;

alter table public.payment_attempts enable row level security;

revoke all on table public.payment_attempts from anon, authenticated;
