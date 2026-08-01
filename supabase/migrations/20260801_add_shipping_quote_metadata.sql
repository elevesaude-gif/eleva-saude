-- Aplicar antes de publicar o código desta branch.
-- Colunas opcionais preservam todos os pedidos existentes.
alter table public.orders
  add column if not exists shipping_quote_source text,
  add column if not exists shipping_delivery_time text,
  add column if not exists shipping_service_id text;

comment on column public.orders.shipping_quote_source is 'Origem da cotação: melhor_envio, fallback, teste ou digital.';
comment on column public.orders.shipping_delivery_time is 'Prazo normalizado exibido ao cliente no checkout.';
comment on column public.orders.shipping_service_id is 'Identificador do serviço na origem da cotação.';
