import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CardVisual, type VisualVariant } from "@/components/educational/CardVisual";
import { EducationalCard } from "@/components/educational/EducationalCard";
import { WhatsAppButton } from "@/components/educational/WhatsAppButton";
import { StructuredGuide } from "@/components/educational/StructuredGuide";
import { getPublishedGuide } from "@/lib/guide-content";
import { connection } from "next/server";

export const metadata: Metadata = {
  title: "Guia das Canetas para Emagrecimento | eLeve Saúde",
  description: "Entenda Tirzepatida, Semaglutida, Mounjaro, Ozempic e Wegovy, além dos cuidados com procedência, indicação, conservação e acompanhamento.",
};

type CardData = { title: string; description?: string; eyebrow?: string; visualVariant: VisualVariant };

const heroCards: CardData[] = [
  { title: "Procedência", visualVariant: "procedure" },
  { title: "Prescrição", visualVariant: "prescription" },
  { title: "Acompanhamento", visualVariant: "support" },
  { title: "Conservação", visualVariant: "coldChain" },
  { title: "Segurança", visualVariant: "safety" },
];
const openingCards: CardData[] = [
  { title: "O que cada medicamento faz", visualVariant: "activeIngredient" },
  { title: "Para quem pode ser indicado", visualVariant: "prescription" },
  { title: "Diferença entre Tirzepatida e Semaglutida", visualVariant: "mounjaro" },
  { title: "Riscos de comprar sem orientação", visualVariant: "safety" },
  { title: "Cuidados com produtos do Paraguai", visualVariant: "paraguay" },
  { title: "Como funciona uma jornada segura", visualVariant: "journey" },
];
const faq: CardData[] = [
  { title: "Tirzepatida é igual a Mounjaro?", description: "Tirzepatida é o princípio ativo; Mounjaro é uma marca comercial. Origem, formulação, concentração e rastreabilidade também precisam ser consideradas.", visualVariant: "activeIngredient" },
  { title: "Ozempic serve para emagrecer?", description: "A indicação depende do contexto clínico e deve ser definida por profissional habilitado; não deve ser usado por conta própria.", visualVariant: "ozempic" },
  { title: "Wegovy é diferente de Ozempic?", description: "Ambos são associados à semaglutida, mas têm apresentações e indicações regulatórias próprias.", visualVariant: "wegovy" },
  { title: "Mounjaro precisa de receita?", description: "Sim. Medicamentos sujeitos a prescrição devem seguir as regras sanitárias e a avaliação profissional aplicáveis.", visualVariant: "prescription" },
  { title: "Posso comprar sem consulta?", description: "Comprar ou usar sem avaliação aumenta riscos de indicação, dose, conservação e manejo inadequados.", visualVariant: "support" },
  { title: "Produto do Paraguai é seguro?", description: "O país de origem, sozinho, não comprova segurança. Verifique registro, procedência, conservação, rastreabilidade e orientação.", visualVariant: "paraguay" },
  { title: "Registro no Paraguai vale no Brasil?", description: "Não automaticamente. As autorizações sanitárias são territoriais e devem ser verificadas conforme as regras brasileiras.", visualVariant: "procedure" },
  { title: "Como saber se a Tirzepatida é original?", description: "Confira fabricante, embalagem, lote, validade, origem, registro aplicável e cadeia de conservação; em caso de dúvida, não use.", visualVariant: "fakeProduct" },
  { title: "O que acontece se a caneta ficar fora da geladeira?", description: "A estabilidade varia conforme o produto e o tempo/temperatura de exposição. Consulte a bula e um profissional antes de usar.", visualVariant: "coldChain" },
  { title: "Preciso fazer dieta junto?", description: "A estratégia alimentar costuma fazer parte do cuidado e deve ser adaptada à sua realidade e às orientações profissionais.", visualVariant: "nutrition" },
  { title: "Preciso de nutricionista?", description: "O acompanhamento nutricional pode apoiar alimentação adequada, preservação de massa magra e manutenção dos resultados.", visualVariant: "muscle" },
  { title: "Como funciona o acompanhamento da eLeve?", description: "A eLeve Saúde oferece orientação inicial, organização da jornada e suporte.", visualVariant: "journey" },
];

function SecondaryButton({ children }: { children: React.ReactNode }) {
  return <Link href="/isabela" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#D1D5DB] bg-white px-5 py-3 text-sm font-bold text-[#0D1B2A] transition hover:border-[#047857] hover:text-[#047857]">{children}</Link>;
}
function Section({ eyebrow, title, children, tinted = false }: { eyebrow: string; title: string; children: React.ReactNode; tinted?: boolean }) {
  return <section className={tinted ? "bg-[#EEF7F2] px-5 py-16 sm:px-8 sm:py-20" : "px-5 py-16 sm:px-8 sm:py-20"}><div className="mx-auto max-w-6xl"><p className="mb-3 text-xs font-extrabold uppercase tracking-[.18em] text-[#047857]">{eyebrow}</p><h2 className="max-w-4xl font-serif text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">{title}</h2><div className="mt-7 text-base leading-7 text-[#344563]">{children}</div></div></section>;
}
function CardGrid({ cards, columns = 3, compact = false }: { cards: CardData[]; columns?: 2 | 3; compact?: boolean }) {
  return <div className={`mt-8 grid gap-4 sm:grid-cols-2 ${columns === 3 ? "lg:grid-cols-3" : ""}`}>{cards.map((card) => <EducationalCard key={card.title} {...card} compact={compact} />)}</div>;
}

export default async function WeightLossPensGuidePage() {
  await connection();
  const publishedGuide = await getPublishedGuide();
  if (publishedGuide) return <StructuredGuide page={publishedGuide} />;
  const highlights: CardData[] = [
    { title: "Preço alto", visualVariant: "price" }, { title: "Influência das redes sociais", visualVariant: "social" },
    { title: "Medo de produto falso", visualVariant: "fakeProduct" }, { title: "Dúvidas sobre Paraguai", visualVariant: "paraguay" },
    { title: "Marca, princípio ativo e registro", visualVariant: "activeIngredient" },
  ];
  const glpCards: CardData[] = [
    { title: "Fome", visualVariant: "hunger" }, { title: "Saciedade", visualVariant: "satiety" },
    { title: "Esvaziamento gástrico", visualVariant: "stomach" }, { title: "Controle glicêmico", visualVariant: "glucose" },
    { title: "Apoio ao controle de peso", visualVariant: "weightSupport" },
  ];
  const medicines: CardData[] = [
    { title: "Mounjaro", eyebrow: "Princípio ativo: Tirzepatida", description: "É uma marca comercial associada à tirzepatida. A indicação depende de avaliação profissional e regras sanitárias aplicáveis.", visualVariant: "mounjaro" },
    { title: "Wegovy", eyebrow: "Princípio ativo: Semaglutida", description: "É uma marca associada à semaglutida em contexto de controle de peso, conforme critérios clínicos e avaliação profissional.", visualVariant: "wegovy" },
    { title: "Ozempic", eyebrow: "Princípio ativo: Semaglutida", description: "É uma marca muito conhecida, mas não deve ser tratada genericamente como “caneta de emagrecimento”. A indicação depende do contexto clínico.", visualVariant: "ozempic" },
    { title: "Saxenda", eyebrow: "Princípio ativo: Liraglutida", description: "É outra opção da classe de medicamentos relacionados ao GLP-1, com indicação e avaliação próprias.", visualVariant: "saxenda" },
  ];
  const paraguayCards: CardData[] = [
    { title: "Mesmo sendo do Paraguai, procedência importa", visualVariant: "paraguay" }, { title: "Conservação importa", visualVariant: "coldChain" },
    { title: "Bula e orientação importam", visualVariant: "prescription" }, { title: "Dose e apresentação precisam ser compreendidas", visualVariant: "activeIngredient" },
    { title: "Acompanhamento reduz decisões impulsivas", visualVariant: "support" },
  ];
  const consideredCards: CardData[] = [
    { title: "Obesidade", visualVariant: "weightSupport" }, { title: "Sobrepeso com comorbidades", visualVariant: "safety" },
    { title: "Diabetes tipo 2", visualVariant: "glucose" }, { title: "Dificuldade de controle metabólico", visualVariant: "stomach" },
    { title: "Histórico de tentativas sem resultado sustentável", visualVariant: "maintenance" }, { title: "Plano alimentar e acompanhamento", visualVariant: "nutrition" },
  ];
  const checklist = ["A conservação foi respeitada?", "Você sabe como armazenar?", "Você sabe a dose correta?", "Existe reeducação alimentar?", "Existe estratégia de manutenção?", "Existe suporte durante a jornada?"];
  const careCards: CardData[] = [
    { title: "Alimentação", visualVariant: "nutrition" }, { title: "Preservação de massa magra", visualVariant: "muscle" },
    { title: "Manejo de efeitos colaterais", visualVariant: "sideEffects" },
    { title: "Plano de manutenção", visualVariant: "maintenance" }, { title: "Estratégia individualizada", visualVariant: "journey" },
  ];
  const journey = ["Avaliação inicial", "Entendimento do histórico e objetivo", "Direcionamento certo", "Reeducação alimentar — não pode comer errado", "Acompanhamento durante a jornada", "Educação para manutenção"];
  const objections: CardData[] = [
    { title: "Eu só quero comprar mais barato.", description: "Preço importa, mas o menor preço pode sair caro quando não há procedência, conservação e orientação.", visualVariant: "price" },
    { title: "Minha amiga usou e emagreceu.", description: "O que funcionou para uma pessoa pode não ser indicado para outra. Cada pessoa tem uma realidade.", visualVariant: "social" },
    { title: "Eu já sei a dose.", description: "Dose não deve ser copiada. Ajustes dependem de avaliação profissional, tolerância individual e acompanhamento.", visualVariant: "prescription" },
    { title: "É tudo igual, só muda a marca.", description: "Não é tudo igual. Princípio ativo, concentração, formulação, registro, qualidade, conservação e rastreabilidade importam.", visualVariant: "activeIngredient" },
    { title: "Quero perder peso rápido.", description: "A velocidade não pode ser o único objetivo. Segurança, preservação de massa muscular, adesão alimentar e manutenção do peso precisam entrar na estratégia.", visualVariant: "maintenance" },
  ];

  return <main className="min-h-screen bg-[#FAFAF7] text-[#0D1B2A]">
    <header className="border-b border-[#E6E8ED] bg-white px-5 py-3"><div className="mx-auto flex max-w-6xl items-center justify-between"><BrandLogo size="small" /><SecondaryButton>Ver apresentações</SecondaryButton></div></header>
    <div className="bg-[#0D1B2A] px-5 py-4 text-center text-sm font-bold leading-6 text-white">Você só continuará sendo o único (a) acima do peso em 2026 se quiser. <span className="text-[#6EE7B7]">Pense nisso!</span></div>

    <section className="relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24"><div className="absolute -right-28 top-0 size-80 rounded-full bg-[#A7F3D0]/30 blur-3xl" /><div className="relative mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-center"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#047857]">Guia eLeve Saúde</p><h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.05] tracking-[-.045em] sm:text-6xl">Antes de comprar qualquer protocolo para emagrecer, entenda isso.</h1><p className="mt-6 text-xl font-bold leading-8">Mounjaro é Tirzepatida — Tirzepatida é Mounjaro.</p><p className="mt-1 text-lg">Mounjaro é somente uma marca; Tirzepatida é o princípio ativo.</p><p className="mt-6 max-w-3xl leading-7 text-[#344563]">Preço importa. Mas procedência, indicação, conservação e acompanhamento podem fazer toda a diferença para sua saúde.</p><p className="mt-3 max-w-3xl text-sm leading-6 text-[#344563]">Um guia simples para quem está pesquisando Tirzepatida, Semaglutida, Mounjaro, Ozempic, Wegovy ou produtos importados.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><WhatsAppButton>Falar com a eLeve no WhatsApp</WhatsAppButton><SecondaryButton>Ver apresentações disponíveis</SecondaryButton></div><p className="mt-4 text-xs text-[#344563]">Procurar entender sobre o tratamento é sempre o melhor caminho #eLeveSaúde</p></div><div className="grid grid-cols-2 gap-3">{heroCards.map((card, index) => <div key={card.title} className={index === 4 ? "col-span-2 mx-auto w-1/2 min-w-36" : ""}><EducationalCard {...card} compact imagePriority={index === 0} /></div>)}</div></div></section>

    <Section eyebrow="Comece por aqui" title="Informação clara antes de qualquer decisão" tinted><p className="max-w-4xl">Talvez você tenha chegado aqui porque viu alguém falando sobre Mounjaro, Ozempic, Wegovy, Tirzepatida, Semaglutida ou canetas vindas do Paraguai. Talvez esteja buscando uma opção mais acessível, tenha medo de comprar algo falso ou só queira entender se esse tipo de tratamento faz sentido para você.</p><p className="mt-4 max-w-4xl">Este guia foi criado para explicar, de forma simples, o que observar antes de tomar qualquer decisão.</p><CardGrid cards={openingCards} compact /></Section>
    <Section eyebrow="Por que agora?" title="Por que tanta gente está procurando essas canetas?"><p className="max-w-4xl">As canetas para emagrecimento se tornaram um dos assuntos mais comentados porque muitas pessoas buscam uma solução real para perder peso. Junto com o interesse, também cresceram as dúvidas, os anúncios suspeitos e a venda de produtos sem procedência clara.</p><CardGrid cards={highlights} compact /><div className="mt-8"><WhatsAppButton>Falar com atendimento antes de escolher</WhatsAppButton></div></Section>
    <Section eyebrow="Entenda o mecanismo" title="O que são medicamentos GLP-1?" tinted><p className="max-w-4xl">GLP-1 é uma classe de medicamentos que atua em mecanismos ligados à fome, saciedade, esvaziamento gástrico e controle glicêmico. Dependendo do princípio ativo, pode ser usado em contextos como diabetes tipo 2, obesidade ou controle crônico do peso, sempre conforme avaliação profissional.</p><CardGrid cards={glpCards} compact /></Section>
    <Section eyebrow="Comparativo simples" title="Entenda a diferença entre marcas, princípios ativos e indicações"><CardGrid cards={medicines} columns={2} /><div className="mt-8"><SecondaryButton>Ver apresentações disponíveis</SecondaryButton></div></Section>
    <Section eyebrow="Marca x princípio ativo" title="Tirzepatida é a mesma coisa que Mounjaro?" tinted><p className="max-w-4xl">Tirzepatida é o princípio ativo. Mounjaro é uma marca comercial registrada. Nem todo produto que diz conter tirzepatida é automaticamente equivalente ao Mounjaro, e nem todo produto vendido fora do Brasil tem a mesma rastreabilidade, conservação ou avaliação sanitária.</p><div className="mt-8 grid overflow-hidden rounded-[28px] bg-[#0D1B2A] sm:grid-cols-[180px_1fr]"><CardVisual variant="activeIngredient" /><blockquote className="p-7 text-xl font-bold leading-8 text-white">Marca, princípio ativo, concentração, origem, conservação e rastreabilidade <span className="text-[#6EE7B7]">não são a mesma coisa.</span></blockquote></div><div className="mt-8"><WhatsAppButton>Quero entender meu caso</WhatsAppButton></div></Section>
    <Section eyebrow="Procedência" title="Canetas do Paraguai: o que você precisa saber antes de decidir"><p className="max-w-4xl">Produtos comprados fora do Brasil podem gerar dúvidas sobre registro, procedência, conservação, idioma da bula, rastreabilidade, dose, apresentação e suporte em caso de reação ou erro de uso.</p><CardGrid cards={paraguayCards} compact /><div className="mt-8"><WhatsAppButton>Falar com atendimento antes de escolher</WhatsAppButton></div></Section>
    <Section eyebrow="Avaliação individual" title="Para quem pode ser considerado?" tinted><p className="max-w-4xl">Esse tipo de tratamento pode ser considerado quando existem questões como obesidade, sobrepeso com comorbidades, diabetes tipo 2 ou dificuldade de controle metabólico. É preciso ter definido qual seu objetivo com a aquisição do tratamento.</p><CardGrid cards={consideredCards} compact /></Section>
    <Section eyebrow="Antes de comprar" title="Checklist antes de comprar qualquer tratamento"><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{checklist.map((item, index) => <EducationalCard key={item} title={item} eyebrow={`Item ${index + 1}`} visualVariant="checklist" compact />)}</div><div className="mt-8"><WhatsAppButton>Receber orientação pelo WhatsApp</WhatsAppButton></div></Section>
    <Section eyebrow="Jornada eLeve" title="O medicamento pode ajudar, mas a jornada não pode depender só disso." tinted><p className="max-w-4xl">Quando o tratamento não vem acompanhado de orientação, a pessoa pode ter dificuldade com alimentação, preservação de massa magra, manejo de efeitos colaterais, adesão ao plano e manutenção do peso.</p><CardGrid cards={careCards} compact /><h3 className="mt-12 text-2xl font-bold text-[#0D1B2A]">Como organizamos a jornada</h3><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{journey.map((item, index) => <EducationalCard key={item} title={item} eyebrow={`Etapa ${index + 1}`} visualVariant="journey" compact />)}</div><p className="mt-8 max-w-4xl">Na eLeve Saúde, o foco não é simplesmente falar sobre o tratamento. O foco é ajudar você a entender se existe uma estratégia segura, acessível e individualizada para o seu emagrecimento.</p><div className="mt-8"><WhatsAppButton>Quero entender meu caso</WhatsAppButton></div></Section>
    <Section eyebrow="Objeções comuns" title="Dúvidas que aparecem antes da decisão"><CardGrid cards={objections} columns={2} /></Section>
    <Section eyebrow="FAQ" title="Respostas rápidas para perguntas importantes" tinted><div className="mt-8 grid gap-4 sm:grid-cols-2">{faq.map((item) => <details key={item.title} className="group overflow-hidden rounded-[24px] border border-[#DDE5E1] bg-white shadow-[0_8px_28px_rgba(13,27,42,.045)]"><CardVisual variant={item.visualVariant} compact /><summary className="cursor-pointer list-none p-5 pr-6 font-bold text-[#0D1B2A]">{item.title}<span className="float-right text-[#047857] transition group-open:rotate-45">+</span></summary><p className="border-t border-[#E6E8ED] px-5 pb-5 pt-4 text-sm leading-6">{item.description}</p></details>)}</div></Section>
    <section className="bg-[#0D1B2A] px-5 py-20 text-white sm:px-8"><div className="mx-auto max-w-4xl text-center"><div className="mx-auto mb-8 max-w-xs"><CardVisual variant="whatsapp" /></div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#6EE7B7]">Próximo passo</p><h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Quer entender se esse tipo de tratamento faz sentido para você?</h2><p className="mx-auto mt-6 max-w-2xl leading-7 text-white/75">Fale com a equipe da eLeve Saúde e receba uma orientação inicial sobre emagrecimento, acompanhamento e opções seguras.</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><WhatsAppButton>Falar com a eLeve no WhatsApp</WhatsAppButton><Link href="/isabela" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/30 px-5 py-3 text-sm font-bold text-white hover:bg-white/10">Ver apresentações disponíveis</Link></div><p className="mt-5 text-xs text-white/60">Atendimento orientativo e sério</p></div></section>
  </main>;
}
