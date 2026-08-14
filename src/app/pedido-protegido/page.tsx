import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { RefundRequestForm } from "./RefundRequestForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Pedido Protegido | Solicitação de análise de estorno | eLeve Saúde",
  description:
    "Abra uma solicitação formal para análise de estorno de um pedido eLeve Saúde, com acompanhamento, segurança e transparência.",
};

const eligibleSituations = [
  ["package", "Produto não recebido", "Quando o pedido não chegou ao destino informado."],
  ["route", "Extravio no transporte", "Quando a transportadora identifica perda durante o envio."],
  ["card", "Cobrança incorreta", "Para divergências no valor ou na forma de cobrança."],
  ["copy", "Pedido duplicado", "Quando mais de um pedido ou pagamento foi gerado."],
  ["return", "Arrependimento dentro do prazo aplicável", "Conforme o prazo e as regras aplicáveis ao pedido."],
  ["search", "Outro motivo sujeito à análise", "Nossa equipe verifica as informações e orienta os próximos passos."],
] as const;

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    package: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5v10l-9 5-9-5V8Z"/><path d="M12 13v10"/></>,
    route: <><circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M8.5 17.5c2-1.2 2.5-2.6 2-4.2-.5-1.7.2-3.5 2-4.4l3-1.6"/></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></>,
    copy: <><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    return: <><path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v6M8 11h6"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function ProtectedOrderPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="Ir para a página inicial"><BrandLogo negative size="small" /></Link>
          <a className={styles.headerHelp} href="#solicitacao">Abrir solicitação</a>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}><span>✓</span> Segurança do seu pedido</span>
            <h1>Pedido Protegido <em>eLeve Saúde</em></h1>
            <p>Esta solicitação inicia uma análise formal de estorno em casos elegíveis de problemas na entrega, cobrança ou insatisfação.</p>
            <div className={styles.trustTags} aria-label="Benefícios do processo">
              <span>Pedido protegido</span><span>Análise formal</span><span>Atendimento seguro</span>
            </div>
            <a href="#solicitacao" className={styles.primaryCta}>Iniciar solicitação <span aria-hidden="true">↓</span></a>
          </div>
          <div className={styles.sealWrap} aria-label="Garantia de 30 dias sujeita às regras aplicáveis">
            <div className={styles.sealRays} aria-hidden="true" />
            <div className={styles.seal}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5.2-3.4 8.5-8 10-4.6-1.5-8-4.8-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>
              <strong>30 dias</strong><span>de garantia*</span><small>ou seu dinheiro de volta</small>
            </div>
            <p>*Conforme elegibilidade e regras aplicáveis.</p>
          </div>
        </div>
      </section>

      <section className={styles.confidence} aria-labelledby="confianca-title">
        <div className={styles.confidenceIcon}><Icon name="package" /></div>
        <div><span>Compra acompanhada</span><h2 id="confianca-title">Seu pedido conta com um processo claro.</h2>
          <p>Na eLeve Saúde, cada pedido possui acompanhamento e registro. Caso aconteça algum problema com sua compra, você pode abrir uma solicitação de análise para que nossa equipe verifique seu caso com segurança.</p>
        </div>
      </section>

      <section className={styles.situations} aria-labelledby="situacoes-title">
        <div className={styles.sectionHeading}><span>Quando solicitar</span><h2 id="situacoes-title">Situações que podem ser analisadas</h2><p>Cada caso passa por uma verificação individual dos dados e das regras aplicáveis.</p></div>
        <div className={styles.cardGrid}>{eligibleSituations.map(([icon, title, description]) => <article className={styles.situationCard} key={title}><div><Icon name={icon} /></div><h3>{title}</h3><p>{description}</p></article>)}</div>
      </section>

      <section id="solicitacao" className={styles.formSection} aria-labelledby="form-title">
        <div className={styles.formIntro}><span>Solicitação segura</span><h2 id="form-title">Conte o que aconteceu com seu pedido</h2><p>Preencha os dados abaixo. Eles serão usados exclusivamente para identificar o pedido, analisar o caso e entrar em contato sobre a solicitação.</p>
          <div className={styles.process}><div><b>1</b><p><strong>Você envia</strong><span>os dados do pedido</span></p></div><i/><div><b>2</b><p><strong>Nós analisamos</strong><span>o histórico e as regras</span></p></div><i/><div><b>3</b><p><strong>Você recebe</strong><span>um retorno da equipe</span></p></div></div>
        </div>
        <RefundRequestForm />
      </section>

      <section className={styles.notice}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 20 6v5c0 5.2-3.4 8.5-8 10-4.6-1.5-8-4.8-8-10V6l8-3Z"/><path d="M12 8v5M12 17h.01"/></svg><p><strong>Importante:</strong> O envio da solicitação não garante aprovação automática de estorno. Cada caso será analisado conforme os dados do pedido, forma de pagamento, status de entrega e regras aplicáveis.</p></section>

      <footer className={styles.footer}><BrandLogo negative size="small"/><p>Segurança, cuidado e transparência em cada etapa.</p><nav aria-label="Links finais"><Link href="/">Voltar para a página inicial</Link><a href="https://wa.me/5511920180233?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20com%20um%20pedido." target="_blank" rel="noopener noreferrer">Falar com atendimento</a></nav></footer>
    </main>
  );
}
