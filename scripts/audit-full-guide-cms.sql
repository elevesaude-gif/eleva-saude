-- Auditoria manual e somente leitura do guia completo.

-- ============================================================
-- ESTADO ATUAL
-- ============================================================
select
  'content_pages' as origem,
  count(*) as total,
  count(*) filter (where active) as ativos
from public.content_pages
union all
select
  'content_sections',
  count(*),
  count(*) filter (where active)
from public.content_sections;

select
  p.slug,
  p.active as pagina_ativa,
  p.published_at,
  count(s.id) as secoes_totais,
  count(s.id) filter (where s.active) as secoes_ativas
from public.content_pages p
left join public.content_sections s on s.page_id = p.id
where p.slug = 'guia-canetas-emagrecimento'
group by p.slug, p.active, p.published_at;

select
  s.id,
  s.content->>'sectionKey' as section_key,
  s.content->>'title' as titulo,
  s.sort_order,
  s.section_type,
  s.active
from public.content_sections s
join public.content_pages p on p.id = s.page_id
where p.slug = 'guia-canetas-emagrecimento'
order by s.sort_order, s.id;

-- ============================================================
-- ESTADO DOS BACKUPS
-- ============================================================
do $backup_audit$
declare
  pages_backup regclass := to_regclass('public.content_pages_backup_full_guide_20260803');
  sections_backup regclass := to_regclass('public.content_sections_backup_full_guide_20260803');
  backup_count bigint;
begin
  if pages_backup is null then
    raise notice 'content_pages_backup_full_guide_20260803: BACKUP AUSENTE — esperado antes da migração';
  else
    execute format('select count(*) from %s', pages_backup) into backup_count;
    raise notice 'content_pages_backup_full_guide_20260803: % registros', backup_count;
  end if;

  if sections_backup is null then
    raise notice 'content_sections_backup_full_guide_20260803: BACKUP AUSENTE — esperado antes da migração';
  else
    execute format('select count(*) from %s', sections_backup) into backup_count;
    raise notice 'content_sections_backup_full_guide_20260803: % registros', backup_count;
  end if;
end
$backup_audit$;

-- ============================================================
-- PARIDADE DO GUIA
-- ============================================================
with guide_sections as (
  select s.*
  from public.content_sections s
  join public.content_pages p on p.id = s.page_id
  where p.slug = 'guia-canetas-emagrecimento'
    and s.content->>'sectionKey' in (
      'hero-guia', 'informacao-clara', 'procura-canetas', 'medicamentos-glp-1',
      'comparativo-marcas', 'tirzepatida-mounjaro', 'canetas-paraguai', 'para-quem',
      'checklist-compra', 'jornada-eleve', 'objecoes-comuns', 'faq-completo', 'cta-final'
    )
)
select
  count(*) as secoes_totais,
  count(*) filter (where active) as secoes_ativas,
  coalesce(sum(jsonb_array_length(content->'faq')) filter (where content ? 'faq'), 0) as faqs,
  coalesce(sum(
    case when content ? 'cards' then jsonb_array_length(content->'cards') else 0 end
    + case when content ? 'checklist' then jsonb_array_length(content->'checklist') else 0 end
    + case when content ? 'comparison' then jsonb_array_length(content->'comparison'->'items') else 0 end
    + case when content ? 'lists' then (
        select coalesce(sum(jsonb_array_length(list_item->'items')), 0)
        from jsonb_array_elements(content->'lists') as list_item
      ) else 0 end
  ), 0) as cards,
  coalesce(sum(jsonb_array_length(content->'checklist')) filter (where content ? 'checklist'), 0) as checklists,
  coalesce(sum(jsonb_array_length(content->'comparison'->'items')) filter (where content ? 'comparison'), 0) as comparativos,
  coalesce(sum(
    case when content ? 'ctas' then jsonb_array_length(content->'ctas') else 0 end
    + case when content ? 'headerCta' then 1 else 0 end
  ), 0) as ctas
from guide_sections;

with guide_sections as (
  select s.content
  from public.content_sections s
  join public.content_pages p on p.id = s.page_id
  where p.slug = 'guia-canetas-emagrecimento'
    and s.content->>'sectionKey' in (
      'hero-guia', 'informacao-clara', 'procura-canetas', 'medicamentos-glp-1',
      'comparativo-marcas', 'tirzepatida-mounjaro', 'canetas-paraguai', 'para-quem',
      'checklist-compra', 'jornada-eleve', 'objecoes-comuns', 'faq-completo', 'cta-final'
    )
), assets as (
  select jsonb_path_query(content, 'strict $.**.imageUrl') #>> '{}' as asset
  from guide_sections
  union all
  select content->'image'->>'url'
  from guide_sections
  where content ? 'image'
)
select count(distinct asset) as assets_unicos
from assets
where asset like '/educational/%';

select
  'content_pages' as origem,
  p.id,
  p.slug as identificador
from public.content_pages p
where p.slug = 'guia-canetas-emagrecimento'
  and (position(chr(195) || chr(167) in to_jsonb(p)::text) > 0
    or position(chr(195) || chr(163) in to_jsonb(p)::text) > 0
    or position(chr(195) || chr(169) in to_jsonb(p)::text) > 0
    or position(chr(194) || chr(160) in to_jsonb(p)::text) > 0
    or position(chr(226) || chr(8364) in to_jsonb(p)::text) > 0)
union all
select
  'content_sections',
  s.id,
  s.content->>'sectionKey'
from public.content_sections s
join public.content_pages p on p.id = s.page_id
where p.slug = 'guia-canetas-emagrecimento'
  and (position(chr(195) || chr(167) in s.content::text) > 0
    or position(chr(195) || chr(163) in s.content::text) > 0
    or position(chr(195) || chr(169) in s.content::text) > 0
    or position(chr(195) || chr(173) in s.content::text) > 0
    or position(chr(195) || chr(179) in s.content::text) > 0
    or position(chr(195) || chr(186) in s.content::text) > 0
    or position(chr(194) || chr(160) in s.content::text) > 0
    or position(chr(226) || chr(8364) in s.content::text) > 0);
