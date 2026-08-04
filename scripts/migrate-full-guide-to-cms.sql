-- Migração manual e atômica do guia completo. Não executar automaticamente.
-- Esta única instrução preserva seções desconhecidas e campos JSON não preparados.
do $migration$
declare
  prepared_sections jsonb := $guide_sections$[{"id":"2f034136-3887-4a5e-9f61-000000000001","section_type":"hero","sort_order":0,"active":true,"content":{"sectionKey":"hero-guia","eyebrow":"Guia eLeve Saúde","title":"Antes de comprar qualquer protocolo para emagrecer, entenda isso.","subtitle":"Mounjaro é Tirzepatida — Tirzepatida é Mounjaro.","highlight":"Mounjaro é somente uma marca; Tirzepatida é o princípio ativo.","paragraphs":["Preço importa. Mas procedência, indicação, conservação e acompanhamento podem fazer toda a diferença para sua saúde.","Um guia simples para quem está pesquisando Tirzepatida, Semaglutida, Mounjaro, Ozempic, Wegovy ou produtos importados."],"footerText":"Procurar entender sobre o tratamento é sempre o melhor caminho #eLeveSaúde","headerCta":{"text":"Ver apresentações","url":"/isabela","style":"secondary"},"cards":[{"title":"Procedência","visualVariant":"procedure","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"title":"Prescrição","visualVariant":"prescription","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Acompanhamento","visualVariant":"support","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Conservação","visualVariant":"coldChain","imageUrl":"/educational/conservacao.webp","imageAlt":""},{"title":"Segurança","visualVariant":"safety","imageUrl":"/educational/checklist.webp","imageAlt":""}],"ctas":[{"text":"Falar com a eLeve no WhatsApp","url":"https://wa.me/5511920180233","style":"primary"},{"text":"Ver apresentações disponíveis","url":"/isabela","style":"secondary"}]}},{"id":"2f034136-3887-4a5e-9f61-000000000002","section_type":"section","sort_order":10,"active":true,"content":{"sectionKey":"informacao-clara","eyebrow":"Comece por aqui","title":"Informação clara antes de qualquer decisão","tinted":true,"paragraphs":["Talvez você tenha chegado aqui porque viu alguém falando sobre Mounjaro, Ozempic, Wegovy, Tirzepatida, Semaglutida ou canetas vindas do Paraguai. Talvez esteja buscando uma opção mais acessível, tenha medo de comprar algo falso ou só queira entender se esse tipo de tratamento faz sentido para você.","Este guia foi criado para explicar, de forma simples, o que observar antes de tomar qualquer decisão."],"cards":[{"title":"O que cada medicamento faz","visualVariant":"activeIngredient","imageUrl":"/educational/dose-apresentacao.webp","imageAlt":""},{"title":"Para quem pode ser indicado","visualVariant":"prescription","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Diferença entre Tirzepatida e Semaglutida","visualVariant":"mounjaro","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Riscos de comprar sem orientação","visualVariant":"safety","imageUrl":"/educational/checklist.webp","imageAlt":""},{"title":"Cuidados com produtos do Paraguai","visualVariant":"paraguay","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"title":"Como funciona uma jornada segura","visualVariant":"journey","imageUrl":"/educational/jornada.webp","imageAlt":""}]}},{"id":"2f034136-3887-4a5e-9f61-000000000003","section_type":"section","sort_order":20,"active":true,"content":{"sectionKey":"procura-canetas","eyebrow":"Por que agora?","title":"Por que tanta gente está procurando essas canetas?","paragraphs":["As canetas para emagrecimento se tornaram um dos assuntos mais comentados porque muitas pessoas buscam uma solução real para perder peso. Junto com o interesse, também cresceram as dúvidas, os anúncios suspeitos e a venda de produtos sem procedência clara."],"cards":[{"title":"Preço alto","visualVariant":"price","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Influência das redes sociais","visualVariant":"social","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Medo de produto falso","visualVariant":"fakeProduct","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"title":"Dúvidas sobre Paraguai","visualVariant":"paraguay","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"title":"Marca, princípio ativo e registro","visualVariant":"activeIngredient","imageUrl":"/educational/dose-apresentacao.webp","imageAlt":""}],"ctas":[{"text":"Falar com atendimento antes de escolher","url":"https://wa.me/5511920180233","style":"primary"}]}},{"id":"2f034136-3887-4a5e-9f61-000000000004","section_type":"section","sort_order":30,"active":true,"content":{"sectionKey":"medicamentos-glp-1","eyebrow":"Entenda o mecanismo","title":"O que são medicamentos GLP-1?","tinted":true,"paragraphs":["GLP-1 é uma classe de medicamentos que atua em mecanismos ligados à fome, saciedade, esvaziamento gástrico e controle glicêmico. Dependendo do princípio ativo, pode ser usado em contextos como diabetes tipo 2, obesidade ou controle crônico do peso, sempre conforme avaliação profissional."],"cards":[{"title":"Fome","visualVariant":"hunger","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Saciedade","visualVariant":"satiety","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Esvaziamento gástrico","visualVariant":"stomach","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Controle glicêmico","visualVariant":"glucose","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Apoio ao controle de peso","visualVariant":"weightSupport","imageUrl":"/educational/jornada.webp","imageAlt":""}]}},{"id":"2f034136-3887-4a5e-9f61-000000000005","section_type":"comparison","sort_order":40,"active":true,"content":{"sectionKey":"comparativo-marcas","eyebrow":"Comparativo simples","title":"Entenda a diferença entre marcas, princípios ativos e indicações","comparison":{"columnTitles":["",""],"items":[{"title":"Mounjaro","eyebrow":"Princípio ativo: Tirzepatida","description":"É uma marca comercial associada à tirzepatida. A indicação depende de avaliação profissional e regras sanitárias aplicáveis.","visualVariant":"mounjaro","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Wegovy","eyebrow":"Princípio ativo: Semaglutida","description":"É uma marca associada à semaglutida em contexto de controle de peso, conforme critérios clínicos e avaliação profissional.","visualVariant":"wegovy","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Ozempic","eyebrow":"Princípio ativo: Semaglutida","description":"É uma marca muito conhecida, mas não deve ser tratada genericamente como “caneta de emagrecimento”. A indicação depende do contexto clínico.","visualVariant":"ozempic","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Saxenda","eyebrow":"Princípio ativo: Liraglutida","description":"É outra opção da classe de medicamentos relacionados ao GLP-1, com indicação e avaliação próprias.","visualVariant":"saxenda","imageUrl":"/educational/comparativo.webp","imageAlt":""}]},"ctas":[{"text":"Ver apresentações disponíveis","url":"/isabela","style":"secondary"}]}},{"id":"2f034136-3887-4a5e-9f61-000000000006","section_type":"highlight","sort_order":50,"active":true,"content":{"sectionKey":"tirzepatida-mounjaro","eyebrow":"Marca x princípio ativo","title":"Tirzepatida é a mesma coisa que Mounjaro?","tinted":true,"paragraphs":["Tirzepatida é o princípio ativo. Mounjaro é uma marca comercial registrada. Nem todo produto que diz conter tirzepatida é automaticamente equivalente ao Mounjaro, e nem todo produto vendido fora do Brasil tem a mesma rastreabilidade, conservação ou avaliação sanitária."],"highlight":"Marca, princípio ativo, concentração, origem, conservação e rastreabilidade não são a mesma coisa.","image":{"url":"/educational/dose-apresentacao.webp","alt":"","visualVariant":"activeIngredient"},"ctas":[{"text":"Quero entender meu caso","url":"https://wa.me/5511920180233","style":"primary"}]}},{"id":"2f034136-3887-4a5e-9f61-000000000007","section_type":"section","sort_order":60,"active":true,"content":{"sectionKey":"canetas-paraguai","eyebrow":"Procedência","title":"Canetas do Paraguai: o que você precisa saber antes de decidir","paragraphs":["Produtos comprados fora do Brasil podem gerar dúvidas sobre registro, procedência, conservação, idioma da bula, rastreabilidade, dose, apresentação e suporte em caso de reação ou erro de uso."],"cards":[{"title":"Mesmo sendo do Paraguai, procedência importa","visualVariant":"paraguay","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"title":"Conservação importa","visualVariant":"coldChain","imageUrl":"/educational/conservacao.webp","imageAlt":""},{"title":"Bula e orientação importam","visualVariant":"prescription","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Dose e apresentação precisam ser compreendidas","visualVariant":"activeIngredient","imageUrl":"/educational/dose-apresentacao.webp","imageAlt":""},{"title":"Acompanhamento reduz decisões impulsivas","visualVariant":"support","imageUrl":"/educational/acompanhamento.webp","imageAlt":""}],"ctas":[{"text":"Falar com atendimento antes de escolher","url":"https://wa.me/5511920180233","style":"primary"}]}},{"id":"2f034136-3887-4a5e-9f61-000000000008","section_type":"section","sort_order":70,"active":true,"content":{"sectionKey":"para-quem","eyebrow":"Avaliação individual","title":"Para quem pode ser considerado?","tinted":true,"paragraphs":["Esse tipo de tratamento pode ser considerado quando existem questões como obesidade, sobrepeso com comorbidades, diabetes tipo 2 ou dificuldade de controle metabólico. É preciso ter definido qual seu objetivo com a aquisição do tratamento."],"cards":[{"title":"Obesidade","visualVariant":"weightSupport","imageUrl":"/educational/jornada.webp","imageAlt":""},{"title":"Sobrepeso com comorbidades","visualVariant":"safety","imageUrl":"/educational/checklist.webp","imageAlt":""},{"title":"Diabetes tipo 2","visualVariant":"glucose","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Dificuldade de controle metabólico","visualVariant":"stomach","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Histórico de tentativas sem resultado sustentável","visualVariant":"maintenance","imageUrl":"/educational/jornada.webp","imageAlt":""},{"title":"Plano alimentar e acompanhamento","visualVariant":"nutrition","imageUrl":"/educational/acompanhamento.webp","imageAlt":""}]}},{"id":"2f034136-3887-4a5e-9f61-000000000009","section_type":"list","sort_order":80,"active":true,"content":{"sectionKey":"checklist-compra","eyebrow":"Antes de comprar","title":"Checklist antes de comprar qualquer tratamento","checklist":["A conservação foi respeitada?","Você sabe como armazenar?","Você sabe a dose correta?","Existe reeducação alimentar?","Existe estratégia de manutenção?","Existe suporte durante a jornada?"],"image":{"url":"/educational/checklist.webp","alt":"","visualVariant":"checklist"},"ctas":[{"text":"Receber orientação pelo WhatsApp","url":"https://wa.me/5511920180233","style":"primary"}]}},{"id":"2f034136-3887-4a5e-9f61-000000000010","section_type":"list","sort_order":90,"active":true,"content":{"sectionKey":"jornada-eleve","eyebrow":"Jornada eLeve","title":"O medicamento pode ajudar, mas a jornada não pode depender só disso.","tinted":true,"paragraphs":["Quando o tratamento não vem acompanhado de orientação, a pessoa pode ter dificuldade com alimentação, preservação de massa magra, manejo de efeitos colaterais, adesão ao plano e manutenção do peso.","Na eLeve Saúde, o foco não é simplesmente falar sobre o tratamento. O foco é ajudar você a entender se existe uma estratégia segura, acessível e individualizada para o seu emagrecimento."],"cards":[{"title":"Alimentação","visualVariant":"nutrition","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Preservação de massa magra","visualVariant":"muscle","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Manejo de efeitos colaterais","visualVariant":"sideEffects","imageUrl":"/educational/checklist.webp","imageAlt":""},{"title":"Plano de manutenção","visualVariant":"maintenance","imageUrl":"/educational/jornada.webp","imageAlt":""},{"title":"Estratégia individualizada","visualVariant":"journey","imageUrl":"/educational/jornada.webp","imageAlt":""}],"listTitle":"Como organizamos a jornada","lists":[{"title":"","items":["Avaliação inicial","Entendimento do histórico e objetivo","Direcionamento certo","Reeducação alimentar — não pode comer errado","Acompanhamento durante a jornada","Educação para manutenção"]}],"ctas":[{"text":"Quero entender meu caso","url":"https://wa.me/5511920180233","style":"primary"}]}},{"id":"2f034136-3887-4a5e-9f61-000000000011","section_type":"section","sort_order":100,"active":true,"content":{"sectionKey":"objecoes-comuns","eyebrow":"Objeções comuns","title":"Dúvidas que aparecem antes da decisão","cards":[{"title":"Eu só quero comprar mais barato.","description":"Preço importa, mas o menor preço pode sair caro quando não há procedência, conservação e orientação.","visualVariant":"price","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"title":"Minha amiga usou e emagreceu.","description":"O que funcionou para uma pessoa pode não ser indicado para outra. Cada pessoa tem uma realidade.","visualVariant":"social","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"Eu já sei a dose.","description":"Dose não deve ser copiada. Ajustes dependem de avaliação profissional, tolerância individual e acompanhamento.","visualVariant":"prescription","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"title":"É tudo igual, só muda a marca.","description":"Não é tudo igual. Princípio ativo, concentração, formulação, registro, qualidade, conservação e rastreabilidade importam.","visualVariant":"activeIngredient","imageUrl":"/educational/dose-apresentacao.webp","imageAlt":""},{"title":"Quero perder peso rápido.","description":"A velocidade não pode ser o único objetivo. Segurança, preservação de massa muscular, adesão alimentar e manutenção do peso precisam entrar na estratégia.","visualVariant":"maintenance","imageUrl":"/educational/jornada.webp","imageAlt":""}]}},{"id":"2f034136-3887-4a5e-9f61-000000000012","section_type":"faq","sort_order":110,"active":true,"content":{"sectionKey":"faq-completo","eyebrow":"FAQ","title":"Respostas rápidas para perguntas importantes","tinted":true,"faq":[{"question":"Tirzepatida é igual a Mounjaro?","answer":"Tirzepatida é o princípio ativo; Mounjaro é uma marca comercial. Origem, formulação, concentração e rastreabilidade também precisam ser consideradas.","visualVariant":"activeIngredient","imageUrl":"/educational/dose-apresentacao.webp","imageAlt":""},{"question":"Ozempic serve para emagrecer?","answer":"A indicação depende do contexto clínico e deve ser definida por profissional habilitado; não deve ser usado por conta própria.","visualVariant":"ozempic","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"question":"Wegovy é diferente de Ozempic?","answer":"Ambos são associados à semaglutida, mas têm apresentações e indicações regulatórias próprias.","visualVariant":"wegovy","imageUrl":"/educational/comparativo.webp","imageAlt":""},{"question":"Mounjaro precisa de receita?","answer":"Sim. Medicamentos sujeitos a prescrição devem seguir as regras sanitárias e a avaliação profissional aplicáveis.","visualVariant":"prescription","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"question":"Posso comprar sem consulta?","answer":"Comprar ou usar sem avaliação aumenta riscos de indicação, dose, conservação e manejo inadequados.","visualVariant":"support","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"question":"Produto do Paraguai é seguro?","answer":"O país de origem, sozinho, não comprova segurança. Verifique registro, procedência, conservação, rastreabilidade e orientação.","visualVariant":"paraguay","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"question":"Registro no Paraguai vale no Brasil?","answer":"Não automaticamente. As autorizações sanitárias são territoriais e devem ser verificadas conforme as regras brasileiras.","visualVariant":"procedure","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"question":"Como saber se a Tirzepatida é original?","answer":"Confira fabricante, embalagem, lote, validade, origem, registro aplicável e cadeia de conservação; em caso de dúvida, não use.","visualVariant":"fakeProduct","imageUrl":"/educational/procedencia.webp","imageAlt":""},{"question":"O que acontece se a caneta ficar fora da geladeira?","answer":"A estabilidade varia conforme o produto e o tempo/temperatura de exposição. Consulte a bula e um profissional antes de usar.","visualVariant":"coldChain","imageUrl":"/educational/conservacao.webp","imageAlt":""},{"question":"Preciso fazer dieta junto?","answer":"A estratégia alimentar costuma fazer parte do cuidado e deve ser adaptada à sua realidade e às orientações profissionais.","visualVariant":"nutrition","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"question":"Preciso de nutricionista?","answer":"O acompanhamento nutricional pode apoiar alimentação adequada, preservação de massa magra e manutenção dos resultados.","visualVariant":"muscle","imageUrl":"/educational/acompanhamento.webp","imageAlt":""},{"question":"Como funciona o acompanhamento da eLeve?","answer":"A eLeve Saúde oferece orientação inicial, organização da jornada e suporte.","visualVariant":"journey","imageUrl":"/educational/jornada.webp","imageAlt":""}]}},{"id":"2f034136-3887-4a5e-9f61-000000000013","section_type":"cta","sort_order":120,"active":true,"content":{"sectionKey":"cta-final","eyebrow":"Próximo passo","title":"Quer entender se esse tipo de tratamento faz sentido para você?","body":"Fale com a equipe da eLeve Saúde e receba uma orientação inicial sobre emagrecimento, acompanhamento e opções seguras.","footerText":"Atendimento orientativo e sério","image":{"url":"/educational/jornada.webp","alt":"","visualVariant":"whatsapp"},"ctas":[{"text":"Falar com a eLeve no WhatsApp","url":"https://wa.me/5511920180233","style":"primary"},{"text":"Ver apresentações disponíveis","url":"/isabela","style":"secondary"}]}}]$guide_sections$::jsonb;
  guide_page_id uuid;
  prepared record;
  existing_id uuid;
  pages_count bigint;
  pages_backup_count bigint;
  sections_count bigint;
  sections_backup_count bigint;
  section_count integer;
  faq_count integer;
  card_count integer;
  checklist_count integer;
  comparison_count integer;
  asset_count integer;
  cta_count integer;
begin
  create table if not exists public.content_pages_backup_full_guide_20260803
    as table public.content_pages with data;
  create table if not exists public.content_sections_backup_full_guide_20260803
    as table public.content_sections with data;

  alter table public.content_pages_backup_full_guide_20260803 enable row level security;
  alter table public.content_sections_backup_full_guide_20260803 enable row level security;
  revoke all on table public.content_pages_backup_full_guide_20260803 from anon, authenticated;
  revoke all on table public.content_sections_backup_full_guide_20260803 from anon, authenticated;

  select count(*) into pages_count from public.content_pages;
  select count(*) into pages_backup_count from public.content_pages_backup_full_guide_20260803;
  select count(*) into sections_count from public.content_sections;
  select count(*) into sections_backup_count from public.content_sections_backup_full_guide_20260803;

  if pages_backup_count <> pages_count then
    raise exception 'Backup content_pages inválido: % registros no backup; % na origem.', pages_backup_count, pages_count;
  end if;
  if sections_backup_count <> sections_count then
    raise exception 'Backup content_sections inválido: % registros no backup; % na origem.', sections_backup_count, sections_count;
  end if;

  if jsonb_typeof(prepared_sections) <> 'array' then
    raise exception 'Dados preparados inválidos: era esperado um array JSONB.';
  end if;
  if jsonb_array_length(prepared_sections) <> 13 then
    raise exception 'Dados preparados inválidos: % seções; esperado 13.', jsonb_array_length(prepared_sections);
  end if;
  if exists (
    select 1
    from jsonb_array_elements(prepared_sections) as item
    where nullif(btrim(item->'content'->>'sectionKey'), '') is null
  ) then
    raise exception 'Dados preparados inválidos: existe seção sem sectionKey.';
  end if;

  select id into guide_page_id
  from public.content_pages
  where slug = 'guia-canetas-emagrecimento';

  if guide_page_id is null then
    insert into public.content_pages (slug, title, description, active, published_at)
    values ('guia-canetas-emagrecimento', 'Guia das Canetas para Emagrecimento', 'Informação clara antes de qualquer decisão.', true, now())
    returning id into guide_page_id;
  end if;

  for prepared in
    select *
    from jsonb_to_recordset(prepared_sections) as x(
      id uuid,
      section_type text,
      sort_order integer,
      active boolean,
      content jsonb
    )
    order by sort_order
  loop
    existing_id := null;
    select s.id into existing_id
    from public.content_sections s
    where s.page_id = guide_page_id
      and s.content->>'sectionKey' = prepared.content->>'sectionKey'
    order by s.created_at, s.id
    limit 1;

    if existing_id is null then
      insert into public.content_sections (id, page_id, section_type, sort_order, active, content, updated_at)
      values (prepared.id, guide_page_id, prepared.section_type, prepared.sort_order, prepared.active, prepared.content, now());
    else
      update public.content_sections
      set section_type = prepared.section_type,
          sort_order = prepared.sort_order,
          active = prepared.active,
          content = content || prepared.content,
          updated_at = now()
      where id = existing_id and page_id = guide_page_id;
    end if;
  end loop;

  select count(*) into section_count
  from jsonb_to_recordset(prepared_sections) as expected(
    id uuid, section_type text, sort_order integer, active boolean, content jsonb
  )
  join public.content_sections actual
    on actual.page_id = guide_page_id
   and actual.content->>'sectionKey' = expected.content->>'sectionKey'
  where actual.active;

  if section_count <> 13 then
    raise exception 'Paridade inválida: % seções ativas preparadas; esperado 13.', section_count;
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(prepared_sections) as expected(
      id uuid, section_type text, sort_order integer, active boolean, content jsonb
    )
    left join public.content_sections actual
      on actual.page_id = guide_page_id
     and actual.content->>'sectionKey' = expected.content->>'sectionKey'
     and actual.content->>'title' = expected.content->>'title'
     and actual.sort_order = expected.sort_order
     and actual.active = expected.active
    where actual.id is null
  ) then
    raise exception 'Paridade inválida: título, ordem ou atividade divergente.';
  end if;

  select coalesce(sum(jsonb_array_length(item->'content'->'faq')), 0)
  into faq_count
  from jsonb_array_elements(prepared_sections) as item
  where item->'content' ? 'faq';

  select coalesce(sum(jsonb_array_length(item->'content'->'checklist')), 0)
  into checklist_count
  from jsonb_array_elements(prepared_sections) as item
  where item->'content' ? 'checklist';

  select coalesce(sum(jsonb_array_length(item->'content'->'comparison'->'items')), 0)
  into comparison_count
  from jsonb_array_elements(prepared_sections) as item
  where item->'content' ? 'comparison';

  select coalesce(sum(
    case when item->'content' ? 'cards' then jsonb_array_length(item->'content'->'cards') else 0 end
    + case when item->'content' ? 'checklist' then jsonb_array_length(item->'content'->'checklist') else 0 end
    + case when item->'content' ? 'comparison' then jsonb_array_length(item->'content'->'comparison'->'items') else 0 end
    + case when item->'content' ? 'lists' then (
        select coalesce(sum(jsonb_array_length(list_item->'items')), 0)
        from jsonb_array_elements(item->'content'->'lists') as list_item
      ) else 0 end
  ), 0)
  into card_count
  from jsonb_array_elements(prepared_sections) as item;

  select coalesce(sum(
    case when item->'content' ? 'ctas' then jsonb_array_length(item->'content'->'ctas') else 0 end
    + case when item->'content' ? 'headerCta' then 1 else 0 end
  ), 0)
  into cta_count
  from jsonb_array_elements(prepared_sections) as item;

  select count(distinct asset) into asset_count
  from (
    select jsonb_path_query(item->'content', 'strict $.**.imageUrl') #>> '{}' as asset
    from jsonb_array_elements(prepared_sections) as item
    union all
    select item->'content'->'image'->>'url'
    from jsonb_array_elements(prepared_sections) as item
    where item->'content' ? 'image'
  ) assets
  where asset like '/educational/%';

  if faq_count <> 12 then raise exception 'Paridade inválida: % FAQs; esperado 12.', faq_count; end if;
  if card_count <> 58 then raise exception 'Paridade inválida: % cards; esperado 58.', card_count; end if;
  if checklist_count <> 6 then raise exception 'Paridade inválida: % checklists; esperado 6.', checklist_count; end if;
  if comparison_count <> 4 then raise exception 'Paridade inválida: % comparativos; esperado 4.', comparison_count; end if;
  if asset_count <> 7 then raise exception 'Paridade inválida: % assets; esperado 7.', asset_count; end if;
  if cta_count <> 11 then raise exception 'Paridade inválida: % CTAs; esperado 11.', cta_count; end if;

  if exists (
    select 1
    from jsonb_array_elements(prepared_sections) as item
    where position(chr(195) || chr(167) in item::text) > 0
       or position(chr(195) || chr(163) in item::text) > 0
       or position(chr(195) || chr(169) in item::text) > 0
       or position(chr(195) || chr(173) in item::text) > 0
       or position(chr(195) || chr(179) in item::text) > 0
       or position(chr(195) || chr(186) in item::text) > 0
       or position(chr(194) || chr(160) in item::text) > 0
       or position(chr(226) || chr(8364) in item::text) > 0
  ) then
    raise exception 'Paridade inválida: mojibake detectado nos dados preparados.';
  end if;

  raise notice 'BACKUPS VALIDADOS: content_pages %, content_sections %.', pages_backup_count, sections_backup_count;
  raise notice 'VALIDADO: 13 seções, 12 FAQs, 58 cards, 6 checklists, 4 comparativos, 7 assets e 11 CTAs.';
end
$migration$;
