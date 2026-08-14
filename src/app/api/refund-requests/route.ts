import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paymentMethods = new Set(["PIX", "Cartão de crédito", "Cartão de débito", "Boleto", "Outro"]);
const reasons = new Set(["Produto não recebido", "Extravio no transporte", "Arrependimento", "Cobrança incorreta", "Pedido duplicado", "Outro"]);
type RefundInput = { orderNumber: string; customerName: string; cpf: string; paymentMethod: string; reason: string; phone?: string; email?: string; details?: string };

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    if (!isRefundInput(input)) return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
    const { error } = await getSupabaseServerClient().from("refund_requests").insert({
      order_number: input.orderNumber.trim(), customer_name: input.customerName.trim(), cpf: input.cpf.replace(/\D/g, ""),
      payment_method: input.paymentMethod, reason: input.reason, phone: cleanOptional(input.phone),
      email: cleanOptional(input.email)?.toLowerCase() ?? null, details: cleanOptional(input.details), status: "pending",
    });
    if (error) throw new Error(`refund_request_insert_failed:${error.code}`);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Falha ao registrar solicitação de estorno", error instanceof Error ? error.message : "unknown_error");
    return Response.json({ ok: false, error: "request_failed", message: "Não foi possível registrar a solicitação agora." }, { status: 500 });
  }
}

function cleanOptional(value: string | undefined) { const clean = value?.trim(); return clean || null; }
function isRefundInput(value: unknown): value is RefundInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<RefundInput>;
  const email = input.email?.trim() ?? ""; const phone = input.phone?.replace(/\D/g, "") ?? "";
  return typeof input.orderNumber === "string" && input.orderNumber.trim().length > 0 && input.orderNumber.trim().length <= 80 &&
    typeof input.customerName === "string" && input.customerName.trim().length >= 3 && input.customerName.trim().length <= 160 &&
    typeof input.cpf === "string" && input.cpf.replace(/\D/g, "").length === 11 && typeof input.paymentMethod === "string" && paymentMethods.has(input.paymentMethod) &&
    typeof input.reason === "string" && reasons.has(input.reason) && (input.phone === undefined || typeof input.phone === "string") && phone.length <= 15 &&
    (input.email === undefined || typeof input.email === "string") && (!email || /^\S+@\S+\.\S+$/.test(email)) && email.length <= 254 &&
    (input.details === undefined || (typeof input.details === "string" && input.details.length <= 2000));
}
