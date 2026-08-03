# CONTEXTO DO PROJETO — eLeve Saúde

Use este arquivo como contexto de continuidade para o Codex.

## Regra de segurança inicial

Antes de alterar qualquer arquivo:

1. Não executar `git reset`, `git clean`, rebase ou checkout destrutivo.
2. Não fazer commit automaticamente.
3. Não alterar `.env.local` nem expor chaves/tokens.
4. Primeiro inspecionar o estado real do repositório.

## Projeto local

- Caminho no Windows: `C:\Projetos\eleva-saude`
- Framework: Next.js App Router
- Linguagem: TypeScript
- CSS: Tailwind
- Hospedagem: Netlify
- Banco: Supabase
- Pagamento: InfinitePay
- Frete: estrutura para Melhor Envio
- Domínio: `https://elevesaude.site`

## Marca e operação

- Marca: **eLeve Saúde**
- Slogan: **Um caminho mais leve para a sua saúde**
- Vendedores: Isabela e Caio
- Rotas de venda: `/isabela` e `/caio`
- WhatsApp oficial: `+55 11 92018-0233`
- InfiniteTag visual: `$eleve-saude`
- Handle usado pela API: `eleve-saude` (sem `$`)

## Estado funcional já alcançado

O histórico registra como implementado e validado:

- Checkout responsivo de venda assistida.
- Identidade visual eLeve Saúde.
- Catálogo e carrinho.
- Rotas por vendedor.
- Cupons por vendedor.
- Formulário de cliente e endereço.
- CEP automático.
- Integração InfinitePay.
- Registro de pedidos no Supabase.
- Webhook InfinitePay.
- Admin simples de pedidos.
- Deploy em Netlify e domínio `elevesaude.site`.
- Estrutura inicial de frete/Melhor Envio.
- Nove produtos da categoria Tirzepatida com imagens locais.

## Git — último estado confirmado no histórico

Último estado explicitamente confirmado:

- Branch: `logistica-melhor-envio`
- HEAD/local e remoto: commit `1289d57` — `Atualiza mensagem institucional do rodape`
- Commit anterior importante: `7b30e67` — `Adiciona CEP automatico e estrutura Melhor Envio`
- Commit de produtos/imagens citado no histórico: `dfef3d5` — `Adiciona produtos Tirzepatida e imagens`

Outros marcos/tags citados:

- `v1-checkout-funcional`
- `v2.1-checkout-aprovado`
- `infinitepay-mvp-ok`
- `pedidos-supabase-ok`
- `pagamento-webhook-supabase-ok`
- `pagamento-infinitepay-webhook-ok`
- `admin-pedidos-v1`
- `dominio-elevesaude-ok`
- `pre-deploy-netlify-ok`

**Atenção:** o trabalho da página educativa e das imagens estava sendo feito sem commit. Portanto, o estado local atual pode conter alterações importantes não versionadas.

## Produtos/imagens já citados

Diretório: `public/products`

- `tirzec-15.webp`
- `tirzec-4-ampolas.webp`
- `tg-15.webp`
- `lipoless.webp`
- `tirzegen.webp`
- `gluconex.webp`
- `tirzedral.webp`
- `tirzedral-md.webp`
- `lipoland.webp`

## Página educativa

Rota desejada/implementada durante o trabalho:

- Produção: `https://elevesaude.site/guia-canetas-emagrecimento`
- Local: `http://localhost:3000/guia-canetas-emagrecimento`
- Arquivo: `src/app/guia-canetas-emagrecimento/page.tsx`
- Componentes possíveis: `src/components/educational`
- Imagens: `public/educational`

A página educativa deve direcionar para:

- WhatsApp da eLeve Saúde.
- Página de vendas `/isabela`.

Na página de vendas, o link para o guia deve ser discreto e ficar antes da vitrine, sem distrair o checkout.

## Última tarefa solicitada antes da transferência

A última tarefa foi **padronizar/refazer as imagens da página educativa**, sem mexer na lógica do site e sem fazer commit.

Arquivos previstos em `public/educational`:

- `acompanhamento.webp`
- `checklist.webp`
- `comparativo.webp`
- `conservacao.webp`
- `dose-apresentacao.webp`
- `jornada.webp`
- `procedencia.webp`

Direção visual obrigatória:

- Fundo claro/off-white.
- Iluminação suave.
- Estética editorial e premium.
- Identidade eLeve Saúde.
- Composição limpa.
- Sombras leves.
- Sem aparência de colagem amadora.
- Embalagens reais dos produtos preservadas, com acabamento profissional.
- Formato `.webp` ou `.avif`.
- Aproximadamente 640×320 px.
- Peso ideal de 20 KB a 80 KB.
- Arquivos locais, sem URLs externas.

Regras específicas:

- `acompanhamento.webp`: prancheta/folha com logo eLeve.
- `checklist.webp`: checklist profissional com logo eLeve.
- `comparativo.webp`: 4 a 6 produtos reais, composição premium.
- `conservacao.webp`: caixa de isopor branca, gelo reutilizável e produto real.
- `dose-apresentacao.webp`: 3 a 5 apresentações reais, sem colagem simples.
- `jornada.webp`: preservar se já estiver aprovada.
- `procedencia.webp`: logo eLeve + carimbo “Original”.
- Não reintroduzir a imagem/card `orientacao` se já tiver sido removido.
- Preservar botão e CTA de WhatsApp.

## Primeiro diagnóstico obrigatório no Codex

Execute somente leitura/diagnóstico:

```powershell
Set-Location C:\Projetos\eleva-saude

git status
git branch --show-current
git log --oneline --decorate -12
git diff --stat
git diff --check

Test-Path .\src\app\guia-canetas-emagrecimento\page.tsx
Get-ChildItem .\public\educational -File -ErrorAction SilentlyContinue | Select-Object Name,Length,LastWriteTime
Get-ChildItem .\public\products -File -ErrorAction SilentlyContinue | Select-Object Name,Length
```

Depois informar, sem alterar nada:

1. Branch atual.
2. Commit HEAD.
3. Arquivos modificados/não rastreados.
4. Se a rota educativa existe.
5. Quais imagens educativas existem.
6. Se os nove produtos/imagens existem.
7. Se há risco de perder trabalho não commitado.

## Prompt inicial para o Codex

```text
Leia primeiro o arquivo CONTEXTO_CODEX_ELEVE_SAUDE.md na raiz do projeto.

Não altere arquivos ainda. Não execute reset, clean, rebase ou commit.

Faça o diagnóstico Git e de arquivos descrito nesse documento. Compare o estado real do repositório com o estado histórico. Em seguida, entregue um relatório objetivo contendo:
- branch e HEAD atuais;
- alterações não commitadas;
- existência da rota /guia-canetas-emagrecimento;
- inventário de public/educational e public/products;
- quais partes da última tarefa já estão prontas;
- plano mínimo para terminar a padronização das imagens sem tocar no checkout, InfinitePay, Supabase, webhook, admin, frete ou catálogo.

Espere aprovação antes de editar.
```

## Testes depois de concluir a tarefa visual

```powershell
npm.cmd run lint
npm.cmd run build
git diff --check
npm.cmd run dev
```

URLs de teste:

- `http://localhost:3000/guia-canetas-emagrecimento`
- `http://localhost:3000/isabela`
- `http://localhost:3000/educational/comparativo.webp`
- `http://localhost:3000/educational/dose-apresentacao.webp`
- `http://localhost:3000/educational/conservacao.webp`

Não fazer commit até aprovação visual.
