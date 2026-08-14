import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const paymentMethods = new Set(["PIX", "Cartão de crédito", "Cartão de débito", "Boleto", "Outro"]);
const reasons = new Set(["Produto não recebido", "Extravio no transporte", "Arrependimento", "Cobrança incorreta", "Pedido duplicado", "Outro"]);
type RefundInput = { order_number: string; customer_name: string; cpf: string; payment_method: string; reason: string; phone?: string; email?: string; details?: string };

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!supabaseUrl) {
    console.error("[refund-requests] NEXT_PUBLIC_SUPABASE_URL não está configurada.");
    return Response.json({ error: "missing_supabase_url" }, { status: 500 });
  }

  if (!serviceRoleKey) {
    console.error("[refund-requests] SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor.");
    return Response.json({ error: "missing_service_role_key" }, { status: 500 });
  }

  try {
    const input: unknown = await request.json();
    if (!isRefundInput(input)) return Response.json({ success: false, error: "invalid_request" }, { status: 400 });

    const { data, error } = await getSupabaseServerClient()
      .from("refund_requests")
      .insert({
        order_number: input.order_number.trim(),
        customer_name: input.customer_name.trim(),
        cpf: input.cpf.replace(/\D/g, ""),
        payment_method: input.payment_method,
        reason: input.reason,
        phone: cleanOptional(input.phone),
        email: cleanOptional(input.email)?.toLowerCase() ?? null,
        details: cleanOptional(input.details),
        status: "pending",
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("[refund-requests] erro ao inserir:", error);
      return Response.json({ error: "insert_failed", details: error.message }, { status: 500 });
    }

    return Response.json({ success: true, id: data.id, created_at: data.created_at }, { status: 201 });
  } catch (error) {
    console.error("[refund-requests] falha inesperada:", error);
    return Response.json({ success: false, error: "request_failed", message: "Não foi possível registrar a solicitação agora." }, { status: 500 });
  }
}

function cleanOptional(value: string | undefined) { const clean = value?.trim(); return clean || null; }
function isRefundInput(value: unknown): value is RefundInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<RefundInput>;
  const email = input.email?.trim() ?? ""; const phone = input.phone?.replace(/\D/g, "") ?? "";
  return typeof input.order_number === "string" && input.order_number.trim().length > 0 && input.order_number.trim().length <= 80 &&
    typeof input.customer_name === "string" && input.customer_name.trim().length >= 3 && input.customer_name.trim().length <= 160 &&
    typeof input.cpf === "string" && input.cpf.replace(/\D/g, "").length === 11 && typeof input.payment_method === "string" && paymentMethods.has(input.payment_method) &&
    typeof input.reason === "string" && reasons.has(input.reason) && (input.phone === undefined || typeof input.phone === "string") && phone.length <= 15 &&
    (input.email === undefined || typeof input.email === "string") && (!email || /^\S+@\S+\.\S+$/.test(email)) && email.length <= 254 &&
    (input.details === undefined || (typeof input.details === "string" && input.details.length <= 2000));
}
