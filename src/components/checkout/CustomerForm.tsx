import type { ChangeEvent, FormEvent } from "react";
import type { CustomerData } from "@/types/checkout";

type Props = { data: CustomerData; onChange: (data: CustomerData) => void };

const fieldClass = "peer mt-2 w-full rounded-[14px] border border-[#E6E8ED] bg-[#F7F8FA] px-4 py-3.5 text-sm text-[#0D1B2A] outline-none transition placeholder:text-[#344563]/55 hover:border-[#C9C6F0] focus:border-[#C9C6F0] focus:bg-white focus:ring-4 focus:ring-[#C9C6F0]/50 invalid:not-placeholder-shown:border-[#344563]";
const digits = (value: string) => value.replace(/\D/g, "");
const maskCpf = (value: string) => digits(value).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (value: string) => digits(value).slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
const maskZip = (value: string) => digits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export function CustomerForm({ data, onChange }: Props) {
  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const { name } = event.target;
    let { value } = event.target;
    if (name === "cpf") value = maskCpf(value);
    if (name === "whatsapp") value = maskPhone(value);
    if (name === "zipCode") value = maskZip(value);
    if (name === "state") value = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);

    const next = { ...data, [name]: value };
    if (name === "zipCode" && digits(value) === "05388090") {
      Object.assign(next, { street: "Rua Paulo Augusto Signore", neighborhood: "Vila Dalva", city: "São Paulo", state: "SP" });
    }
    onChange(next);
  };

  const field = (
    label: string,
    name: keyof CustomerData,
    placeholder: string,
    props?: { required?: boolean; type?: string; inputMode?: "text" | "numeric" | "email"; pattern?: string; autoComplete?: string; hint?: string },
  ) => {
    const invalid = (event: FormEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      input.setCustomValidity(input.validity.valueMissing ? `Preencha o campo ${label.toLowerCase()}.` : `Confira o formato de ${label.toLowerCase()}.`);
    };
    return (
      <label className="block text-xs font-bold text-[#0D1B2A]">
        {label}{props?.required && <span className="ml-0.5 text-[#344563]">*</span>}
        <input className={fieldClass} name={name} value={data[name]} onChange={update} onInvalid={invalid} onInput={(e) => e.currentTarget.setCustomValidity("")} placeholder={placeholder} {...props} />
        {props?.hint && <span className="mt-1.5 block text-[10px] font-normal text-[#344563]">{props.hint}</span>}
      </label>
    );
  };

  return (
    <>
      <section className="checkout-card">
        <div className="section-heading">
          <span className="section-icon">◯</span>
          <div><p className="section-kicker">Contato</p><h2 className="section-title">Dados para contato</h2><p className="section-description">Informações para identificar e acompanhar seu pedido.</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{field("Nome completo", "fullName", "Como podemos chamar você?", { required: true, autoComplete: "name" })}</div>
          {field("CPF", "cpf", "000.000.000-00", { required: true, inputMode: "numeric", pattern: "\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}", hint: "Usado apenas para identificação do pedido" })}
          {field("WhatsApp", "whatsapp", "(11) 99999-9999", { required: true, inputMode: "numeric", pattern: "\\(\\d{2}\\) \\d{5}-\\d{4}", autoComplete: "tel" })}
          <div className="sm:col-span-2">{field("E-mail", "email", "voce@email.com", { required: true, type: "email", inputMode: "email", autoComplete: "email" })}</div>
        </div>
      </section>
      <section className="checkout-card">
        <div className="section-heading">
          <span className="section-icon">⌂</span>
          <div><p className="section-kicker">Entrega</p><h2 className="section-title">Endereço de entrega</h2><p className="section-description">Informe onde deseja receber os itens do seu pedido.</p></div>
        </div>
        <div className="grid gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">{field("CEP", "zipCode", "00000-000", { required: true, inputMode: "numeric", pattern: "\\d{5}-\\d{3}", autoComplete: "postal-code", hint: digits(data.zipCode) === "05388090" ? "✓ Endereço preenchido automaticamente" : "Digite o CEP para continuar" })}</div>
          <div className="sm:col-span-4">{field("Rua", "street", "Nome da rua", { required: true, autoComplete: "address-line1" })}</div>
          <div className="sm:col-span-2">{field("Número", "number", "123", { required: true, inputMode: "numeric" })}</div>
          <div className="sm:col-span-4">{field("Complemento", "complement", "Apto, bloco, casa...", { autoComplete: "address-line2" })}</div>
          <div className="sm:col-span-3">{field("Bairro", "neighborhood", "Seu bairro", { required: true })}</div>
          <div className="sm:col-span-2">{field("Cidade", "city", "Sua cidade", { required: true, autoComplete: "address-level2" })}</div>
          <div className="sm:col-span-1">{field("UF", "state", "SP", { required: true, pattern: "[A-Z]{2}", autoComplete: "address-level1" })}</div>
          <div className="sm:col-span-6">{field("Ponto de referência", "reference", "Ex.: portão ao lado da praça")}</div>
        </div>
      </section>
    </>
  );
}
