import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { TrackingForm } from "./TrackingForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Rastreie seu pedido | eLeve Saúde",
  description: "Acompanhe a movimentação da sua entrega eLeve Saúde com transparência.",
};

const carriers = ["Jadlog · Package Centralizado", "Loggi · Express", "J&T · Standard"];

export default function TrackingPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}><div><Link href="/" aria-label="Ir para a página inicial"><BrandLogo negative size="small" /></Link><a href="#consulta">Consultar envio</a></div></header>
      <section className={styles.hero}>
        <div className={styles.heroCopy}><span className={styles.eyebrow}>Acompanhamento da entrega</span><h1>Rastreie seu pedido</h1><p>Acompanhe a movimentação da sua entrega com transparência.</p></div>
        <div id="consulta" className={styles.formWrap}><TrackingForm /></div>
      </section>
      <section className={styles.trust} aria-labelledby="trust-title">
        <div className={styles.trustIcon} aria-hidden="true">✓</div><div><span>Envio acompanhado</span><h2 id="trust-title">Seu pedido segue com uma parceira de confiança.</h2><p>Enviamos por transportadora parceira, com acompanhamento do pedido até a entrega.</p></div>
      </section>
      <section className={styles.carriers} aria-labelledby="carriers-title"><span className={styles.eyebrow}>Parceiras de envio</span><h2 id="carriers-title">Transportadoras que usamos</h2><p>A transportadora é definida conforme o endereço e as condições do envio, sem promessa de prazo exato nesta consulta.</p><div>{carriers.map((carrier, index) => <article key={carrier}><span aria-hidden="true">{index + 1}</span><strong>{carrier}</strong></article>)}</div></section>
      <section className={styles.help}><div><span className={styles.eyebrow}>Precisa de ajuda?</span><h2>Estamos com você até a entrega.</h2><p>Se o código não apresentar movimentações, confira os dados recebidos ou fale com nossa equipe.</p></div><nav aria-label="Próximos passos"><a className={styles.primaryLink} href="https://wa.me/5511920180233?text=Ol%C3%A1%21%20Preciso%20de%20ajuda%20para%20rastrear%20meu%20pedido." target="_blank" rel="noopener noreferrer">Falar com atendimento <span aria-hidden="true">↗</span></a><Link href="/caio">Quero realizar um novo pedido</Link><Link href="/pedido-protegido">Pedido protegido</Link></nav></section>
      <footer className={styles.footer}><BrandLogo negative size="small"/><p>Segurança, cuidado e transparência em cada etapa.</p><Link href="/">Voltar para a página inicial</Link></footer>
    </main>
  );
}
