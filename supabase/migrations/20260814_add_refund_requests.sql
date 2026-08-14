begin;

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  customer_name text not null,
  cpf text not null check (cpf ~ '^\d{11}$'),
  payment_method text not null check (payment_method in ('PIX', 'Cartão de crédito', 'Cartão de débito', 'Boleto', 'Outro')),
  reason text not null check (reason in ('Produto não recebido', 'Extravio no transporte', 'Arrependimento', 'Cobrança incorreta', 'Pedido duplicado', 'Outro')),
  phone text,
  email text,
  details text,
  status text not null default 'pending' check (status in ('pending', 'in_review', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists refund_requests_status_created_at_idx on public.refund_requests(status, created_at desc);
create index if not exists refund_requests_order_number_idx on public.refund_requests(order_number);

alter table public.refund_requests enable row level security;

-- Não há política pública: leitura e escrita acontecem somente no servidor com a service role.

commit;
