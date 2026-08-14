"use client";

import { FormEvent, useState } from "react";
import styles from "./page.module.css";

type Movement = { status: string; description?: string; location?: string; updatedAt?: string };
type TrackingResult = {
  configured: boolean;
  found?: boolean;
  trackingCode?: string;
  carrier?: string;
  status?: string;
  updatedAt?: string;
  movements?: Movement[];
  message?: string;
  error?: string;
};

const notFoundMessage = "Ainda não encontramos movimentações para este código. Confira se o código foi digitado corretamente ou tente novamente mais tarde.";

export function TrackingForm() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const trackingCode = String(formData.get("trackingCode") || "").trim();
    const carrier = String(formData.get("carrier") || "");
    if (!trackingCode) return;

    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/tracking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trackingCode, carrier }),
      });
      const data = await response.json() as TrackingResult;
      setResult(data);
    } catch {
      setResult({ configured: true, error: "Não foi possível consultar o rastreio agora. Tente novamente em alguns instantes." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form className={styles.form} onSubmit={handleSubmit} aria-describedby="tracking-help">
        <div className={styles.field}>
          <label htmlFor="trackingCode">Código de rastreio ou número do envio</label>
          <input id="trackingCode" name="trackingCode" type="text" autoComplete="off" placeholder="Ex.: código recebido após a postagem" required maxLength={120} />
        </div>
        <div className={styles.field}>
          <label htmlFor="carrier">Transportadora <span>(opcional)</span></label>
          <select id="carrier" name="carrier" defaultValue="">
            <option value="">Não sei / Buscar automaticamente</option>
            <option value="jadlog">Jadlog · Package Centralizado</option>
            <option value="loggi">Loggi · Express</option>
            <option value="jt">J&amp;T · Standard</option>
          </select>
        </div>
        <button className={styles.submit} type="submit" disabled={loading}>
          {loading ? <><span className={styles.spinner} aria-hidden="true" /> Consultando rastreio...</> : <>Consultar rastreio <span aria-hidden="true">→</span></>}
        </button>
        <p id="tracking-help" className={styles.formHelp}>Use o código informado no atendimento ou na confirmação de envio.</p>
      </form>

      <div className={styles.resultRegion} aria-live="polite">
        {result && !result.configured && <Fallback />}
        {result?.configured && result.error && <MessageCard tone="error" title="Consulta indisponível" text={result.error} />}
        {result?.configured && result.found === false && <MessageCard tone="neutral" title="Rastreio ainda sem movimentação" text={notFoundMessage} />}
        {result?.configured && result.found && <TrackingDetails result={result} />}
      </div>
    </div>
  );
}

function Fallback() {
  return <MessageCard tone="neutral" title="Rastreio automático em configuração" text="Nossa consulta automática ainda está em configuração. Confira o código recebido e tente novamente mais tarde. Se precisar, fale com o atendimento para verificarmos seu envio com Jadlog, Loggi ou J&T." />;
}

function MessageCard({ tone, title, text }: { tone: "error" | "neutral"; title: string; text: string }) {
  return <section className={`${styles.messageCard} ${tone === "error" ? styles.error : ""}`} role={tone === "error" ? "alert" : "status"}><span aria-hidden="true">{tone === "error" ? "!" : "i"}</span><div><h2>{title}</h2><p>{text}</p></div></section>;
}

function TrackingDetails({ result }: { result: TrackingResult }) {
  return (
    <section className={styles.trackingDetails}>
      <div className={styles.resultHeading}><span>Envio localizado</span><h2>{result.status}</h2><p>{result.message}</p></div>
      <dl className={styles.summary}>
        <div><dt>Código consultado</dt><dd>{result.trackingCode}</dd></div>
        {result.carrier && <div><dt>Transportadora</dt><dd>{result.carrier}</dd></div>}
        <div><dt>Status atual</dt><dd>{result.status}</dd></div>
        {result.updatedAt && <div><dt>Última atualização</dt><dd>{formatDate(result.updatedAt)}</dd></div>}
      </dl>
      {result.movements && result.movements.length > 0 && (
        <div className={styles.timeline}>
          <h3>Movimentações do pedido</h3>
          <ol>{result.movements.map((movement, index) => <li key={`${movement.updatedAt || "event"}-${index}`}><span aria-hidden="true" /><div><strong>{movement.status}</strong>{movement.description && <p>{movement.description}</p>}<small>{[movement.location, movement.updatedAt && formatDate(movement.updatedAt)].filter(Boolean).join(" · ")}</small></div></li>)}</ol>
        </div>
      )}
    </section>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}
