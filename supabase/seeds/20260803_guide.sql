-- Não reaplicar em produção após edições pelo CMS sem revisão.
-- Importação inicial idempotente: a reaplicação substitui o conteúdo atual do guia.
insert into public.content_pages (slug,title,description,active,published_at)
values ('guia-canetas-emagrecimento','Guia das Canetas para Emagrecimento','Informação clara antes de qualquer decisão.',true,now())
on conflict (slug) do update set title=excluded.title,description=excluded.description,active=excluded.active,published_at=excluded.published_at;

delete from public.content_sections where page_id=(select id from public.content_pages where slug='guia-canetas-emagrecimento');
insert into public.content_sections (page_id,section_type,sort_order,active,content) values
((select id from public.content_pages where slug='guia-canetas-emagrecimento'),'hero',0,true,'{"eyebrow":"Guia eLeve Saúde","title":"Antes de comprar qualquer protocolo para emagrecer, entenda isso.","subtitle":"Mounjaro é somente uma marca; Tirzepatida é o princípio ativo.","body":"Preço importa. Mas procedência, indicação, conservação e acompanhamento podem fazer toda a diferença para sua saúde.","ctaText":"Falar com a eLeve no WhatsApp","ctaUrl":"https://wa.me/5511920180233"}'::jsonb),
((select id from public.content_pages where slug='guia-canetas-emagrecimento'),'section',10,true,'{"eyebrow":"Comece por aqui","title":"Informação clara antes de qualquer decisão","paragraphs":["Este guia explica, de forma simples, o que observar antes de tomar qualquer decisão."]}'::jsonb),
((select id from public.content_pages where slug='guia-canetas-emagrecimento'),'list',20,true,'{"title":"Checklist antes de comprar qualquer tratamento","items":["A conservação foi respeitada?","Você sabe como armazenar?","Você sabe a dose correta?","Existe acompanhamento durante a jornada?"]}'::jsonb),
((select id from public.content_pages where slug='guia-canetas-emagrecimento'),'faq',30,true,'{"title":"Perguntas frequentes","items":[{"title":"Tirzepatida é igual a Mounjaro?","text":"Tirzepatida é o princípio ativo; Mounjaro é uma marca comercial."},{"title":"Posso comprar sem consulta?","text":"Comprar ou usar sem avaliação aumenta riscos."}]}'::jsonb),
((select id from public.content_pages where slug='guia-canetas-emagrecimento'),'cta',40,true,'{"title":"Quer entender se esse tipo de tratamento faz sentido para você?","body":"Fale com a equipe da eLeve Saúde.","ctaText":"Falar com a eLeve no WhatsApp","ctaUrl":"https://wa.me/5511920180233"}'::jsonb);
