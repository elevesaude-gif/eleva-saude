import type { Metadata } from "next";
import { WhatsAppGroupCta } from "./WhatsAppGroupCta";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Grupo VIP eLeve Saúde | Canetas Emagrecedoras sem Mistério",
  description:
    "Entre gratuitamente no Grupo VIP eLeve Saúde e acompanhe conteúdos sobre canetas emagrecedoras, diferenças entre tratamentos, efeitos, platô, procedência e cuidados.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Grupo VIP eLeve Saúde",
    description:
      "Informação clara sobre canetas emagrecedoras, procedência, tratamentos, efeitos e muito mais.",
    type: "website",
  },
};

const questions = [
  "Qual a diferença entre os principais tratamentos?",
  "Por que o peso pode parar de baixar?",
  "Como entender procedência e segurança?",
  "Quais dúvidas e efeitos merecem atenção?",
];

export default function Home() {
  return (
    <main className={styles.landing}>
      <div className={styles.page}>
        <div className={styles.brand} aria-label="eLeve Saúde">
          <div className={styles.brandMark} aria-hidden="true">
            e
          </div>
          <div>eLeve Saúde</div>
        </div>

        <section className={styles.card} aria-labelledby="titulo-principal">
          <div className={styles.hero}>
            <div className={styles.eyebrow}>
              🇵🇾 Grupo VIP • Entrada gratuita
            </div>

            <h1 id="titulo-principal" className={styles.title}>
              “É do Paraguai?”
              <span>Sim. Agora faça as perguntas certas.</span>
            </h1>

            <p className={styles.lead}>
              Entre para o Grupo VIP eLeve Saúde e acompanhe informações claras
              sobre <strong>canetas emagrecedoras, tratamentos, procedência, efeitos,
              platô e cuidados</strong> durante o processo.
            </p>

            <div className={styles.questions} aria-label="Assuntos do grupo">
              {questions.map((question) => (
                <div className={styles.question} key={question}>
                  <div className={styles.check} aria-hidden="true">
                    ✓
                  </div>
                  <div>{question}</div>
                </div>
              ))}
            </div>

            <div className={styles.ctaWrap}>
              <WhatsAppGroupCta
                className={styles.cta}
                iconClassName={styles.ctaIcon}
              />
              <div className={styles.microcopy}>
                Acesso gratuito • Clique e entre no grupo
              </div>
            </div>

            <div className={styles.trust}>
              <span aria-hidden="true">🇵🇾</span>
              <span>Paraguai sem mistério. Informação antes da decisão.</span>
            </div>
          </div>
        </section>

        <div className={styles.footer}>
          Conteúdo informativo. Informações compartilhadas no grupo não substituem
          avaliação, diagnóstico, prescrição ou acompanhamento individual por
          profissional habilitado.
        </div>
      </div>
    </main>
  );
}
