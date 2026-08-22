"use client";

import { useEffect, useState } from "react";
import { couponDiscountLabel, initialCoupons, loadCoupons, normalizeCouponCode, saveCoupons, type Coupon } from "@/lib/coupons";

type EditorState = { mode: "create" | "edit"; coupon: Coupon };

export function CouponsAdmin() {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setCoupons(loadCoupons()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function openCreate() {
    setEditor({ mode: "create", coupon: createEmptyCoupon() });
    setNotice(null);
  }

  function openEdit(coupon: Coupon) {
    setEditor({ mode: "edit", coupon: { ...coupon } });
    setNotice(null);
  }

  function updateField<K extends keyof Coupon>(key: K, value: Coupon[K]) {
    setEditor((current) => current ? { ...current, coupon: { ...current.coupon, [key]: value } } : null);
  }

  function persist(next: Coupon[], successMessage: string) {
    if (!saveCoupons(next)) {
      setNotice({ kind: "error", text: "Não foi possível salvar no navegador. Verifique se o armazenamento local está permitido." });
      return false;
    }
    setCoupons(next);
    setNotice({ kind: "success", text: successMessage });
    return true;
  }

  function saveEditor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const coupon = { ...editor.coupon, code: normalizeCouponCode(editor.coupon.code) };
    if (coupons.some((item) => item.id !== coupon.id && normalizeCouponCode(item.code) === coupon.code)) {
      setNotice({ kind: "error", text: "Já existe um cupom com esse código." });
      return;
    }
    const next = editor.mode === "create"
      ? [coupon, ...coupons]
      : coupons.map((item) => item.id === coupon.id ? coupon : item);
    if (persist(next, editor.mode === "create" ? "Cupom criado com sucesso." : "Cupom atualizado com sucesso.")) setEditor(null);
  }

  function toggleActive(coupon: Coupon) {
    const next = coupons.map((item) => item.id === coupon.id ? { ...item, active: !item.active } : item);
    persist(next, `Cupom ${coupon.active ? "desativado" : "ativado"} com sucesso.`);
  }

  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#344563]">Vendas</p><h1 className="mt-1 font-serif text-3xl font-semibold">Cupons de desconto</h1><p className="mt-2 text-sm text-[#344563]">Cadastre e gerencie os cupons usados nos checkouts de Isabela, Caio e Bruno.</p></div>
      <button type="button" onClick={openCreate} className="rounded-xl bg-[#047857] px-5 py-3 text-sm font-bold text-white hover:bg-[#065F46]">+ Novo cupom</button>
    </div>

    {notice && <div role={notice.kind === "error" ? "alert" : "status"} className={`mt-5 rounded-xl border px-4 py-3 text-sm font-semibold ${notice.kind === "error" ? "border-[#B42318]/20 bg-[#FEF3F2] text-[#B42318]" : "border-[#A7F3D0] bg-[#ECFDF5] text-[#047857]"}`}>{notice.text}</div>}

    <div className="mt-6 overflow-x-auto rounded-[24px] border border-[#E6E8ED] bg-white shadow-sm">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-[#E6E8ED] bg-[#F7F8FA] text-[10px] uppercase tracking-wider text-[#344563]"><tr>{["Código", "Vendedor", "Desconto", "Compra mínima", "Usos", "Validade", "Status", "Ações"].map((heading) => <Th key={heading}>{heading}</Th>)}</tr></thead>
        <tbody>{coupons.map((coupon) => <tr key={coupon.id} className="border-b border-[#E6E8ED] last:border-0">
          <Td><strong>{coupon.code}</strong></Td><Td className="capitalize">{coupon.seller}</Td><Td>{couponDiscountLabel(coupon)}</Td><Td>{money(coupon.minimumPurchase)}</Td><Td>{coupon.currentUses} / {coupon.maximumUses || "∞"}</Td><Td>{date(coupon.startsAt)} a {date(coupon.expiresAt)}</Td>
          <Td><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${coupon.active ? "bg-[#ECFDF5] text-[#047857]" : "bg-[#FEF3F2] text-[#B42318]"}`}>{coupon.active ? "Ativo" : "Inativo"}</span></Td>
          <Td><div className="flex gap-2"><button type="button" onClick={() => openEdit(coupon)} className="rounded-lg border border-[#E6E8ED] px-3 py-2 text-xs font-bold">Editar</button><button type="button" onClick={() => toggleActive(coupon)} className="rounded-lg bg-[#F1F2F5] px-3 py-2 text-xs font-bold">{coupon.active ? "Desativar" : "Ativar"}</button></div></Td>
        </tr>)}</tbody>
      </table>
      {!coupons.length && <div className="p-10 text-center text-sm text-[#344563]"><p>Nenhum cupom cadastrado.</p><button type="button" onClick={() => persist(initialCoupons, "Cupons iniciais restaurados.")} className="mt-3 font-bold text-[#047857]">Restaurar cupons iniciais</button></div>}
    </div>

    {editor && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#0D1B2A]/55 p-4" role="dialog" aria-modal="true" aria-labelledby="coupon-editor-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditor(null); }}>
      <form onSubmit={saveEditor} className="my-6 w-full max-w-4xl rounded-[24px] bg-white p-5 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-[#344563]">Cadastro de cupom</p><h2 id="coupon-editor-title" className="mt-1 text-xl font-bold">{editor.mode === "create" ? "Novo cupom" : `Editar ${editor.coupon.code}`}</h2></div><button type="button" onClick={() => setEditor(null)} aria-label="Fechar formulário" className="rounded-lg px-3 py-2 text-xl text-[#344563] hover:bg-[#F1F2F5]">×</button></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Label text="Código"><input required autoFocus value={editor.coupon.code} onChange={(e) => updateField("code", e.target.value.toUpperCase())} className="admin-input" placeholder="EXEMPLO10" /></Label>
          <Label text="Vendedor"><select value={editor.coupon.seller} onChange={(e) => updateField("seller", e.target.value as Coupon["seller"])} className="admin-input"><option value="todos">Todos</option><option value="isabela">Isabela</option><option value="caio">Caio</option><option value="bruno">Bruno</option></select></Label>
          <Label text="Tipo de desconto"><select value={editor.coupon.discountType} onChange={(e) => updateField("discountType", e.target.value as Coupon["discountType"])} className="admin-input"><option value="percentual">Percentual</option><option value="fixo">Valor fixo</option><option value="frete_gratis">Frete grátis</option></select></Label>
          {editor.coupon.discountType !== "frete_gratis" && <NumberField label="Valor do desconto" value={editor.coupon.discountValue} onChange={(value) => updateField("discountValue", value)} step="0.01" max={editor.coupon.discountType === "percentual" ? 100 : undefined} />}
          <NumberField label="Valor mínimo da compra" value={editor.coupon.minimumPurchase} onChange={(value) => updateField("minimumPurchase", value)} step="0.01" />
          <NumberField label="Limite máximo de usos" value={editor.coupon.maximumUses} onChange={(value) => updateField("maximumUses", value)} />
          <NumberField label="Usos atuais" value={editor.coupon.currentUses} onChange={(value) => updateField("currentUses", value)} />
          <Label text="Data de início"><input required type="date" value={editor.coupon.startsAt} onChange={(e) => updateField("startsAt", e.target.value)} className="admin-input" /></Label>
          <Label text="Data de validade"><input required type="date" min={editor.coupon.startsAt} value={editor.coupon.expiresAt} onChange={(e) => updateField("expiresAt", e.target.value)} className="admin-input" /></Label>
          <Label text="Status"><select value={editor.coupon.active ? "ativo" : "inativo"} onChange={(e) => updateField("active", e.target.value === "ativo")} className="admin-input"><option value="ativo">Ativo</option><option value="inativo">Inativo</option></select></Label>
        </div>
        <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setEditor(null)} className="rounded-xl border border-[#E6E8ED] px-5 py-3 text-sm font-bold">Cancelar</button><button type="submit" className="rounded-xl bg-[#0D1B2A] px-6 py-3 text-sm font-bold text-white hover:bg-[#344563]">{editor.mode === "create" ? "Criar cupom" : "Salvar alterações"}</button></div>
      </form>
    </div>}
  </main>;
}

function createEmptyCoupon(): Coupon {
  const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { id: randomId, code: "", seller: "todos", discountType: "percentual", discountValue: 10, minimumPurchase: 0, maximumUses: 100, currentUses: 0, startsAt: localDate(), expiresAt: "", active: true };
}
function localDate() { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10); }
function Label({ text, children }: { text: string; children: React.ReactNode }) { return <label className="grid gap-1.5 text-xs font-bold text-[#344563]">{text}{children}</label>; }
function NumberField({ label, value, onChange, step = "1", max }: { label: string; value: number; onChange: (value: number) => void; step?: string; max?: number }) { return <Label text={label}><input required min="0" max={max} step={step} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="admin-input" /></Label>; }
function Th({ children }: { children: React.ReactNode }) { return <th className="px-4 py-3 font-extrabold">{children}</th>; }
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <td className={`px-4 py-4 ${className}`}>{children}</td>; }
function money(value: number) { return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function date(value: string) { return value ? new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR") : "—"; }
