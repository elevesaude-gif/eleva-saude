import type { ChangeEvent } from "react";
import type { CustomerData } from "@/types/checkout";

type Props = { data: CustomerData; onChange: (data: CustomerData) => void };

const fieldClass = "mt-1.5 w-full rounded-xl border border-[#d9e2dd] bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-[#a1aaa5] focus:border-[#2F7D5C] focus:ring-3 focus:ring-[#2F7D5C]/10";

export function CustomerForm({ data, onChange }: Props) {
  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const next = { ...data, [name]: value };
    if (name === "zipCode" && value.replace(/\D/g, "") === "05388090") {
      Object.assign(next, {
        street: "Rua Paulo Augusto Signore",
        neighborhood: "Vila Dalva",
        city: "São Paulo",
        state: "SP",
      });
    }
    onChange(next);
  };

  const field = (label: string, name: keyof CustomerData, placeholder: string, props?: { required?: boolean; type?: string; maxLength?: number }) => (
    <label className="block text-xs font-semibold text-[#46524b]">
      {label}{props?.required && <span className="text-[#b56e4a]"> *</span>}
      <input className={fieldClass} name={name} value={data[name]} onChange={update} placeholder={placeholder} {...props} />
    </label>
  );

  return (
    <section className="rounded-3xl border border-[#dfe8e3] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-[#EAF5EF] text-[#2F7D5C]">♙</span>
        <div><h2 className="font-bold text-[#1F2933]">Seus dados</h2><p className="text-xs text-[#748079]">Para identificação e acompanhamento do pedido</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{field("Nome completo", "fullName", "Como podemos chamar você?", { required: true })}</div>
        {field("CPF", "cpf", "000.000.000-00", { required: true, maxLength: 14 })}
        {field("WhatsApp", "whatsapp", "(11) 99999-9999", { required: true, maxLength: 15 })}
        <div className="sm:col-span-2">{field("E-mail", "email", "voce@email.com", { required: true, type: "email" })}</div>
      </div>
      <div className="my-6 border-t border-[#e6ece8]" />
      <div className="mb-4"><h3 className="font-bold text-[#1F2933]">Endereço de entrega</h3><p className="text-xs text-[#748079]">Informe onde você deseja receber seu pedido</p></div>
      <div className="grid gap-4 sm:grid-cols-6">
        <div className="sm:col-span-2">{field("CEP", "zipCode", "00000-000", { required: true, maxLength: 9 })}</div>
        <div className="sm:col-span-4">{field("Rua", "street", "Nome da rua", { required: true })}</div>
        <div className="sm:col-span-2">{field("Número", "number", "123", { required: true })}</div>
        <div className="sm:col-span-4">{field("Complemento", "complement", "Apto, bloco, casa...")}</div>
        <div className="sm:col-span-3">{field("Bairro", "neighborhood", "Seu bairro", { required: true })}</div>
        <div className="sm:col-span-2">{field("Cidade", "city", "Sua cidade", { required: true })}</div>
        <div className="sm:col-span-1">{field("UF", "state", "SP", { required: true, maxLength: 2 })}</div>
        <div className="sm:col-span-6">{field("Ponto de referência", "reference", "Próximo a...")}</div>
      </div>
    </section>
  );
}
