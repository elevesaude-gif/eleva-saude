"use client";

import { FormEvent, useMemo, useState } from "react";
import styles from "./page.module.css";

type FormData = { orderNumber: string; customerName: string; cpf: string; paymentMethod: string; reason: string; phone: string; email: string; details: string };
const initialForm: FormData = { orderNumber: "", customerName: "", cpf: "", paymentMethod: "", reason: "", phone: "", email: "", details: "" };

function maskCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function isValidCpf(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calculateDigit = (length: number) => {
    const sum = digits.slice(0, length).split("").reduce((total, digit, index) => total + Number(digit) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === Number(digits[9]) && calculateDigit(10) === Number(digits[10]);
}
function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

export function RefundRequestForm() {
  const [form, setForm] = useState(initialForm);
  const [cpfTouched, setCpfTouched] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const cpfDigits = form.cpf.replace(/\D/g, "");
  const cpfValid = useMemo(() => isValidCpf(form.cpf), [form.cpf]);
  const showCpfError = cpfDigits.length > 0 && !cpfValid && (cpfTouched || cpfDigits.length === 11);
  const disabledReason = useMemo(() => {
    if (!form.orderNumber.trim()) return "Informe o número do pedido.";
    if (!form.customerName.trim()) return "Informe o nome completo.";
    if (!form.cpf.trim()) return "Informe o CPF.";
    if (!cpfValid) return "Informe um CPF válido.";
    if (!form.paymentMethod) return "Selecione a forma de pagamento.";
    if (!form.reason) return "Selecione o motivo da solicitação.";
    return "";
  }, [cpfValid, form]);
  const isValid = disabledReason === "";

  function update(field: keyof FormData, value: string) {
    setForm((current) => ({ ...current, [field]: field === "cpf" ? maskCpf(value) : field === "phone" ? maskPhone(value) : value }));
    if (status === "error") { setStatus("idle"); setError(""); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || status === "sending") return;
    setStatus("sending"); setError("");
    try {
      const response = await fetch("/api/refund-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) throw new Error("request_failed");
      setStatus("success"); setForm(initialForm); setCpfTouched(false);
    } catch {
      setStatus("error"); setError("Não foi possível enviar agora. Tente novamente em instantes ou fale com nosso atendimento.");
    }
  }

  if (status === "success") return <div className={styles.success} role="status"><div>✓</div><span>Solicitação registrada</span><h3>Recebemos seus dados.</h3><p>Solicitação recebida. Nossa equipe irá analisar os dados enviados e retornará pelo canal informado.</p><button type="button" onClick={() => setStatus("idle")}>Enviar outra solicitação</button></div>;

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.field}><label htmlFor="orderNumber">Número do pedido <b>*</b></label><input id="orderNumber" value={form.orderNumber} onChange={(e) => update("orderNumber", e.target.value)} required autoComplete="off" placeholder="Ex.: ELV-123456" maxLength={80}/></div>
    <div className={styles.field}><label htmlFor="customerName">Nome completo <b>*</b></label><input id="customerName" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} required autoComplete="name" placeholder="Digite seu nome completo" maxLength={160}/></div>
    <div className={styles.twoColumns}>
      <div className={styles.field}><label htmlFor="cpf">CPF <b>*</b></label><input id="cpf" value={form.cpf} onChange={(e) => update("cpf", e.target.value)} onBlur={() => setCpfTouched(true)} required inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" maxLength={14} aria-invalid={showCpfError} aria-describedby={showCpfError ? "cpf-error" : undefined}/>{showCpfError && <p id="cpf-error" className={styles.fieldError} role="alert">CPF inválido. Confira os números digitados.</p>}</div>
      <div className={styles.field}><label htmlFor="paymentMethod">Forma de pagamento <b>*</b></label><select id="paymentMethod" value={form.paymentMethod} onChange={(e) => update("paymentMethod", e.target.value)} required><option value="">Selecione</option><option>PIX</option><option>Cartão de crédito</option><option>Cartão de débito</option><option>Boleto</option><option>Outro</option></select></div>
    </div>
    <div className={styles.field}><label htmlFor="reason">Motivo da solicitação <b>*</b></label><select id="reason" value={form.reason} onChange={(e) => update("reason", e.target.value)} required><option value="">Selecione o motivo</option><option>Produto não recebido</option><option>Extravio no transporte</option><option>Arrependimento</option><option>Cobrança incorreta</option><option>Pedido duplicado</option><option>Outro</option></select></div>
    <div className={styles.twoColumns}>
      <div className={styles.field}><label htmlFor="phone">Telefone <span>(opcional)</span></label><input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000"/></div>
      <div className={styles.field}><label htmlFor="email">E-mail <span>(opcional)</span></label><input id="email" value={form.email} onChange={(e) => update("email", e.target.value)} type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" maxLength={254}/></div>
    </div>
    <div className={styles.field}><label htmlFor="details">Detalhes <span>(opcional)</span></label><textarea id="details" value={form.details} onChange={(e) => update("details", e.target.value)} placeholder="Conte brevemente o que aconteceu" maxLength={2000} rows={4}/></div>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    {!isValid && <p className={styles.disabledReason} role="status">Para habilitar o envio: {disabledReason}</p>}
    <button className={styles.submit} disabled={!isValid || status === "sending"} type="submit">{status === "sending" ? "Enviando..." : "Solicitar análise de estorno"}<span aria-hidden="true">→</span></button>
    <p className={styles.formFootnote}>Ao enviar, você solicita uma análise. A aprovação não é automática.</p>
  </form>;
}
