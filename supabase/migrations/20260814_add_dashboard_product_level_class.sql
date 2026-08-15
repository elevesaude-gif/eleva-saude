begin;

alter table public.dashboard_products
  add column if not exists level_class text not null default '';

comment on column public.dashboard_products.level_class is
  'Classe visual/de evidência (campo cls do dashboard HTML original).';

commit;
