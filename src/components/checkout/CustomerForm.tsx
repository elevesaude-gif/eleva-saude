import { useEffect, useState, type ChangeEvent, type Dispatch, type FormEvent, type SetStateAction } from "react";
import type { CustomerData } from "@/types/checkout";

type Props = { data: CustomerData; onChange: Dispatch<SetStateAction<CustomerData>> };
type ZipStatus = "idle" | "loading" | "found" | "not_found" | "error";

const fieldClass = "peer mt-2 w-full rounded-[14px] border border-[#E6E8ED] bg-[#F7F8FA] px-4 py-3.5 text-sm text-[#0D1B2A] outline-none transition placeholder:text-[#344563]/55 hover:border-[#C9C6F0] focus:border-[#C9C6F0] focus:bg-white focus:ring-4 focus:ring-[#C9C6F0]/50 invalid:not-placeholder-shown:border-[#B42318] invalid:not-placeholder-shown:bg-[#FEF3F2]";
const digits = (value: string) => value.replace(/\D/g, "");
const maskCpf = (value: string) => digits(value).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
const maskPhone = (value: string) => digits(value).slice(0, 11).replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
const maskZip = (value: string) => digits(value).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");

export function CustomerForm({ data, onChange }: Props) {
  const [zipStatus, setZipStatus] = useState<ZipStatus>("idle");

  useEffect(() => {
    const zipCode = digits(data.zipCode);
    if (zipCode.length !== 8) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setZipStatus("loading");
      void fetch(`/api/address/lookup?postalCode=${zipCode}`, { signal: controller.signal })
      .then(async (response) => {
        const body: unknown = await response.json();
        if (!response.ok || !isAddressResponse(body)) {
          const code = body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : "address_lookup_failed";
          throw new Error(code);
        }
        return body;
      })
      .then((address) => {
        onChange((current) => ({
          ...current,
          street: address.street || current.street,
          neighborhood: address.neighborhood || current.neighborhood,
          city: address.city || current.city,
          state: address.state || current.state,
        }));
        setZipStatus("found");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setZipStatus(error instanceof Error && error.message === "address_not_found" ? "not_found" : "error");
      });
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [data.zipCode, onChange]);

  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const { name } = event.target;
    let { value } = event.target;
    if (name === "cpf") value = maskCpf(value);
    if (name === "whatsapp") value = maskPhone(value);
    if (name === "zipCode") value = maskZip(value);
    if (name === "state") value = value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 2);

    if (name === "zipCode") setZipStatus("idle");

    onChange((current) => ({ ...current, [name]: value }));
  };

  const field = (
    label: string,
    name: keyof CustomerData,
    placeholder: string,
    props?: { required?: boolean; type?: string; inputMode?: "text" | "numeric" | "email"; pattern?: string; autoComplete?: string; hint?: string },
  ) => {
    const successHint = name === "zipCode" && zipStatus === "found";
    const invalid = (event: FormEvent<HTMLInputElement>) => {
      const input = event.currentTarget;
      input.setCustomValidity(input.validity.valueMissing ? `Preencha o campo ${label.toLowerCase()}.` : `Confira o formato de ${label.toLowerCase()}.`);
    };
    return (
      <label className="block text-xs font-bold text-[#0D1B2A]">
        {label}{props?.required && <span className="ml-0.5 text-[#344563]">*</span>}
        <input className={fieldClass} name={name} value={data[name]} onChange={update} onInvalid={invalid} onInput={(e) => e.currentTarget.setCustomValidity("")} placeholder={placeholder} {...props} />
        {props?.hint && <span className={`mt-1.5 block text-[10px] font-normal ${successHint ? "rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] px-2 py-1.5 text-[#047857]" : "text-[#344563]"}`}>{successHint && "✓ "}{props.hint}</span>}
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
          <div className="sm:col-span-2">{field("CEP", "zipCode", "00000-000", { required: true, inputMode: "numeric", pattern: "\\d{5}-\\d{3}", autoComplete: "postal-code", hint: zipStatusMessage(zipStatus) })}</div>
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

function zipStatusMessage(status: ZipStatus) {
  if (status === "loading") return "Buscando endereço...";
  if (status === "found") return "Endereço encontrado. Confira o número e complemento.";
  if (status === "not_found") return "CEP não encontrado. Preencha o endereço manualmente.";
  if (status === "error") return "Erro ao consultar CEP. Preencha o endereço manualmente.";
  return "Digite o CEP para buscar o endereço";
}

function isAddressResponse(value: unknown): value is { street: string; neighborhood: string; city: string; state: string } {
  if (!value || typeof value !== "object") return false;
  const address = value as Record<string, unknown>;
  return typeof address.street === "string" && typeof address.neighborhood === "string" && typeof address.city === "string" && typeof address.state === "string";
}
