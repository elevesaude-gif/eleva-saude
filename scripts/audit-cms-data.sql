-- Execute primeiro apenas as seções 1 e 2 no SQL Editor do Supabase.
-- A seção 3 cria backups privados; a seção 4 corrige e relata mudanças.
-- Revise nomes/contagens antes de executar as seções 3 e 4.

-- 1) Estrutura real
select table_name, ordinal_position, column_name, data_type, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('products','content_pages','content_sections','order_items')
order by table_name, ordinal_position;

-- 2) Auditoria recursiva de text/jsonb sem alterações
create or replace function pg_temp.has_mojibake(value jsonb) returns boolean
language sql immutable as $$
  select value::text ~ '(Ã.|Â.|â€|â€™|â€œ|�)'
$$;

do $$
declare column_record record; affected bigint;
begin
  create temporary table if not exists cms_encoding_audit(table_name text, column_name text, affected_rows bigint) on commit preserve rows;
  truncate cms_encoding_audit;
  for column_record in
    select table_name,column_name,data_type from information_schema.columns
    where table_schema='public' and table_name in ('products','content_pages','content_sections')
      and data_type in ('text','character varying','json','jsonb')
  loop
    execute format('select count(*) from public.%I where pg_temp.has_mojibake(to_jsonb(%I))',column_record.table_name,column_record.column_name) into affected;
    insert into cms_encoding_audit values(column_record.table_name,column_record.column_name,affected);
  end loop;
end $$;
select * from cms_encoding_audit where affected_rows > 0 order by table_name,column_name;

-- 3) BACKUP: troque o sufixo pelo horário UTC atual antes de executar.
-- Os backups não recebem grants públicos e têm RLS habilitado.
-- create table public.cms_backup_products_YYYYMMDD_HH24MISS as table public.products;
-- alter table public.cms_backup_products_YYYYMMDD_HH24MISS enable row level security;
-- revoke all on public.cms_backup_products_YYYYMMDD_HH24MISS from anon, authenticated;
-- create table public.cms_backup_content_pages_YYYYMMDD_HH24MISS as table public.content_pages;
-- alter table public.cms_backup_content_pages_YYYYMMDD_HH24MISS enable row level security;
-- revoke all on public.cms_backup_content_pages_YYYYMMDD_HH24MISS from anon, authenticated;
-- create table public.cms_backup_content_sections_YYYYMMDD_HH24MISS as table public.content_sections;
-- alter table public.cms_backup_content_sections_YYYYMMDD_HH24MISS enable row level security;
-- revoke all on public.cms_backup_content_sections_YYYYMMDD_HH24MISS from anon, authenticated;
-- select 'products' tabela,(select count(*) from public.products) origem,(select count(*) from public.cms_backup_products_YYYYMMDD_HH24MISS) backup
-- union all select 'content_pages',(select count(*) from public.content_pages),(select count(*) from public.cms_backup_content_pages_YYYYMMDD_HH24MISS)
-- union all select 'content_sections',(select count(*) from public.content_sections),(select count(*) from public.cms_backup_content_sections_YYYYMMDD_HH24MISS);

-- 4) CORREÇÃO MANUAL: executar somente depois de criar e conferir os backups.
-- A função preserva strings corretas e percorre objetos/arrays JSON recursivamente.
create or replace function pg_temp.fix_mojibake_text(value text) returns text
language plpgsql immutable as $$
declare fixed text;
begin
  if value is null or value !~ '(Ã.|Â.|â€|â€™|â€œ|�)' then return value; end if;
  begin fixed := convert_from(convert_to(value,'LATIN1'),'UTF8');
  exception when others then return value;
  end;
  return fixed;
end $$;
create or replace function pg_temp.fix_mojibake_json(value jsonb) returns jsonb
language plpgsql immutable as $$
declare result jsonb;
begin
  case jsonb_typeof(value)
    when 'string' then return to_jsonb(pg_temp.fix_mojibake_text(value #>> '{}'));
    when 'array' then select jsonb_agg(pg_temp.fix_mojibake_json(item) order by ord) into result from jsonb_array_elements(value) with ordinality as a(item,ord);
    when 'object' then select jsonb_object_agg(key,pg_temp.fix_mojibake_json(item)) into result from jsonb_each(value) as o(key,item);
    else return value;
  end case;
  return coalesce(result,value);
end $$;

-- Gere UPDATEs específicos a partir do information_schema; não inclui IDs, datas,
-- preços, status ou relacionamentos. Rode cada UPDATE em transação e use RETURNING.
select case when data_type in ('json','jsonb') then
  format('update public.%I set %I=pg_temp.fix_mojibake_json(%I::jsonb) where pg_temp.has_mojibake(to_jsonb(%I)) returning id,%L as field;',table_name,column_name,column_name,column_name,column_name)
else
  format('update public.%I set %I=pg_temp.fix_mojibake_text(%I) where pg_temp.has_mojibake(to_jsonb(%I)) returning id,%L as field;',table_name,column_name,column_name,column_name,column_name)
end as reviewed_update_sql
from information_schema.columns
where table_schema='public' and table_name in ('products','content_pages','content_sections')
  and data_type in ('text','character varying','json','jsonb') and column_name <> 'id'
order by table_name,ordinal_position;

-- Correção já delimitada pela auditoria de 2026-08-03: apenas products.description.
-- Execute após o backup, dentro de BEGIN/COMMIT, e confira o relatório retornado.
-- begin;
-- with candidates as (
--   select id, description as before_value, pg_temp.fix_mojibake_text(description) as after_value
--   from public.products
--   where pg_temp.has_mojibake(to_jsonb(description))
-- ), updated as (
--   update public.products p set description=c.after_value, updated_at=now()
--   from candidates c where p.id=c.id and c.before_value is distinct from c.after_value
--   returning p.id
-- )
-- select 'products' as table_name,u.id,'description' as field,c.before_value,c.after_value
-- from updated u join candidates c using(id);
-- commit;
