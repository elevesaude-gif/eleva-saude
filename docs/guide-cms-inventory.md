# Inventário do CMS — guia de canetas

Fonte oficial: `src/app/guia-canetas-emagrecimento/page.tsx`. Representação preparada: `src/content/guide-cms.json`.

## Estrutura encontrada

`content_pages` possui `id`, `slug`, `title`, `description`, `active`, `published_at`, `created_at` e `updated_at`. `content_sections` possui `id`, `page_id`, `section_type`, `sort_order`, `active`, `content`, `created_at` e `updated_at`; `content` é um objeto `jsonb`. Não foram pressupostas outras colunas.

O modelo usa uma linha por seção e mantém o conteúdo integral no JSON. Cada JSON recebe `sectionKey` estável; IDs UUID existentes são reutilizados quando a seção pode ser reconhecida. Campos desconhecidos são mesclados e preservados. Arrays aninhados preservam ordem e representam parágrafos, cards, listas, checklist, FAQ, comparação, imagens e CTAs.

## Seções, ordem e blocos

| Ordem | `sectionKey` | `section_type` | Blocos inventariados |
| ---: | --- | --- | --- |
| 0 | `hero-guia` | `hero` | eyebrow, título, subtítulo, destaque, 2 parágrafos, rodapé, 5 cards com imagens/alt, CTA do cabeçalho e 2 CTAs do hero |
| 10 | `informacao-clara` | `section` | eyebrow, título, 2 parágrafos e 6 cards com imagens/alt |
| 20 | `procura-canetas` | `section` | eyebrow, título, parágrafo, 5 cards com imagens/alt e CTA |
| 30 | `medicamentos-glp-1` | `section` | eyebrow, título, parágrafo e 5 cards com imagens/alt |
| 40 | `comparativo-marcas` | `comparison` | eyebrow, título, títulos de colunas, 4 comparações com princípio ativo, descrição, imagem/alt e CTA |
| 50 | `tirzepatida-mounjaro` | `highlight` | eyebrow, título, parágrafo, texto em destaque, imagem/alt e CTA |
| 60 | `canetas-paraguai` | `section` | eyebrow, título, parágrafo, 5 cards com imagens/alt e CTA |
| 70 | `para-quem` | `section` | eyebrow, título, parágrafo e 6 cards com imagens/alt |
| 80 | `checklist-compra` | `list` | eyebrow, título, 6 itens de checklist, imagem/alt e CTA |
| 90 | `jornada-eleve` | `list` | eyebrow, título, 2 parágrafos, 5 cards, subtítulo de lista, 6 etapas e CTA |
| 100 | `objecoes-comuns` | `section` | eyebrow, título e 5 cards com respostas e imagens/alt |
| 110 | `faq-completo` | `faq` | eyebrow, título e 12 pares completos de pergunta/resposta com imagens/alt |
| 120 | `cta-final` | `cta` | eyebrow, título, corpo, rodapé, imagem/alt e 2 CTAs |

## Totais e convenções

- 13 seções ativas preparadas.
- 12 FAQs.
- 58 cards: cards visuais comuns + 4 comparativos + 6 itens de checklist + 6 etapas da jornada; FAQs não entram na contagem de cards.
- 6 itens de checklist.
- 4 cards comparativos.
- 7 assets únicos em `/educational`: `acompanhamento.webp`, `checklist.webp`, `comparativo.webp`, `conservacao.webp`, `dose-apresentacao.webp`, `jornada.webp` e `procedencia.webp`.
- 11 CTAs renderizados: 10 dentro do corpo das seções e o botão “Ver apresentações” do cabeçalho, armazenado junto ao hero para preservar a composição e o total histórico.

Todos os textos, URLs, imagens, textos alternativos (inclusive os vazios intencionais de imagens decorativas), ordem e tipos de bloco estão registrados integralmente no JSON preparado. O conteúdo público continua sendo renderizado diretamente pela página estática.
