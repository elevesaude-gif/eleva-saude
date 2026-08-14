"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, InputEvent } from "react";
import styles from "./page.module.css";

type RefundFormData = { orderNumber: string; customerName: string; cpf: string; paymentMethod: string; reason: string; phone: string; email: string; details: string };
type RefundResponse = { success?: boolean; id?: string; created_at?: string; error?: string; details?: string };
const initialForm: RefundFormData = { orderNumber: "", customerName: "", cpf: "", paymentMethod: "", reason: "", phone: "", email: "", details: "" };

function maskCpf(value: string) {
  return value.replace(/\D/g, "").slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}
function isValidCpf(value: string) {
  const digits = onlyDigits(value);
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
  const [formData, setFormData] = useState({
    orderNumber: "",
    customerName: "",
    cpf: "",
    paymentMethod: "",
    reason: "",
    phone: "",
    email: "",
    details: "",
  });
  const [cpfTouched, setCpfTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [protocol, setProtocol] = useState("");
  const cpfDigits = onlyDigits(formData.cpf);
  const showCpfError = cpfDigits.length > 0 && !isValidCpf(formData.cpf) && (submitAttempted || cpfTouched || cpfDigits.length === 11);

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | InputEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = event.currentTarget;
    const nextValue = name === "cpf" ? maskCpf(value) : name === "phone" ? maskPhone(value) : value;
    setFormData((current) => ({ ...current, [name]: nextValue }));
    if (status === "error") { setStatus("idle"); setError(""); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitAttempted(true);
    const currentForm = new FormData(event.currentTarget);
    const getValue = (name: string) => String(currentForm.get(name) ?? "").trim();
    const orderNumber = getValue("orderNumber");
    const customerName = getValue("customerName");
    const cpf = getValue("cpf");
    const paymentMethod = getValue("paymentMethod");
    const reason = getValue("reason");

    if (!orderNumber || !customerName || !cpf || !paymentMethod || !reason) {
      setStatus("error");
      setError("Preencha os campos obrigatórios para solicitar a análise.");
      return;
    }
    if (!isValidCpf(cpf)) {
      setStatus("error");
      setError("CPF inválido. Confira os números digitados.");
      return;
    }
    if (status === "sending") return;
    setStatus("sending"); setError("");
    try {
      const payload = {
        order_number: orderNumber,
        customer_name: customerName,
        cpf: onlyDigits(cpf),
        payment_method: paymentMethod,
        reason,
        phone: getValue("phone"),
        email: getValue("email"),
        details: getValue("details"),
      };
      const response = await fetch("/api/refund-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as RefundResponse;
      if (!response.ok || result.success !== true || !result.id) {
        console.error("[refund-request-form] API recusou a solicitação:", { status: response.status, result });
        setStatus("error");
        setError("Não foi possível registrar sua solicitação agora. Tente novamente ou fale com o atendimento.");
        return;
      }
      setProtocol(result.id);
      setStatus("success"); setFormData(initialForm); setCpfTouched(false); setSubmitAttempted(false);
    } catch (error) {
      console.error("[refund-request-form] erro ao enviar solicitação:", error);
      setStatus("error"); setError("Não foi possível registrar sua solicitação agora. Tente novamente ou fale com o atendimento.");
    }
  }

  if (status === "success") return <div className={styles.success} role="status"><div>✓</div><span>Solicitação enviada com sucesso</span><h3>Protocolo: {protocol}</h3><p><strong>Status inicial: Em análise</strong></p><p>Nossa equipe irá verificar os dados enviados e retornará pelo canal informado.</p><button type="button" onClick={() => { setProtocol(""); setStatus("idle"); }}>Enviar outra solicitação</button></div>;

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.field}><label htmlFor="orderNumber">Número do pedido <b>*</b></label><input id="orderNumber" name="orderNumber" value={formData.orderNumber} onChange={handleChange} onInput={handleChange} required autoComplete="off" placeholder="Ex.: ELV-123456" maxLength={80}/></div>
    <div className={styles.field}><label htmlFor="customerName">Nome completo <b>*</b></label><input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} onInput={handleChange} required autoComplete="name" placeholder="Digite seu nome completo" maxLength={160}/></div>
    <div className={styles.twoColumns}>
      <div className={styles.field}><label htmlFor="cpf">CPF <b>*</b></label><input id="cpf" name="cpf" value={formData.cpf} onChange={handleChange} onInput={handleChange} onBlur={() => setCpfTouched(true)} required inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" maxLength={14} aria-invalid={showCpfError} aria-describedby={showCpfError ? "cpf-error" : undefined}/>{showCpfError && <p id="cpf-error" className={styles.fieldError} role="alert">CPF inválido. Confira os números digitados.</p>}</div>
      <div className={styles.field}><label htmlFor="paymentMethod">Forma de pagamento <b>*</b></label><select id="paymentMethod" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} onInput={handleChange} required><option value="">Selecione</option><option>PIX</option><option>Cartão de crédito</option><option>Cartão de débito</option><option>Boleto</option><option>Outro</option></select></div>
    </div>
    <div className={styles.field}><label htmlFor="reason">Motivo da solicitação <b>*</b></label><select id="reason" name="reason" value={formData.reason} onChange={handleChange} onInput={handleChange} required><option value="">Selecione o motivo</option><option>Produto não recebido</option><option>Extravio no transporte</option><option>Arrependimento</option><option>Cobrança incorreta</option><option>Pedido duplicado</option><option>Outro</option></select></div>
    <div className={styles.twoColumns}>
      <div className={styles.field}><label htmlFor="phone">Telefone <span>(opcional)</span></label><input id="phone" name="phone" value={formData.phone} onChange={handleChange} onInput={handleChange} inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000"/></div>
      <div className={styles.field}><label htmlFor="email">E-mail <span>(opcional)</span></label><input id="email" name="email" value={formData.email} onChange={handleChange} onInput={handleChange} type="email" inputMode="email" autoComplete="email" placeholder="voce@email.com" maxLength={254}/></div>
    </div>
    <div className={styles.field}><label htmlFor="details">Detalhes <span>(opcional)</span></label><textarea id="details" name="details" value={formData.details} onChange={handleChange} onInput={handleChange} placeholder="Conte brevemente o que aconteceu" maxLength={2000} rows={4}/></div>
    {error && <p className={styles.formError} role="alert">{error}</p>}
    <button className={styles.submit} disabled={status === "sending"} type="submit">{status === "sending" ? "Enviando..." : "Solicitar análise de estorno"}<span aria-hidden="true">→</span></button>
    <p className={styles.formFootnote}>Ao enviar, você solicita uma análise. A aprovação não é automática.</p>
  </form>;
}
