import { findOrderByNsu, markOrderAsPaid, recordPaymentEvent } from "@/lib/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    if (!payload || typeof payload !== "object") {
      return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    const body = payload as Record<string, unknown>;
    const orderNsu = readString(body, "order_nsu");
    const transactionNsu = readString(body, "transaction_nsu");
    const receiptUrl = safeHttpsUrl(readString(body, "receipt_url"));
    const captureMethod = readString(body, "capture_method");
    const paidAmountCents = readInteger(body, ["amount_cents", "amount", "paid_amount_cents", "paid_amount"]);
    const order = orderNsu ? await findOrderByNsu(orderNsu) : null;
    const event = await recordPaymentEvent({
      orderId: order?.id,
      orderNsu,
      eventType: order ? "payment_received" : "order_not_found",
      transactionNsu,
      payload,
    });

    if (!order) return Response.json({ ok: true, matched: false, duplicate: event.duplicate });
    if (paidAmountCents === undefined || paidAmountCents !== order.total_cents) {
      return Response.json({ ok: true, matched: true, paid: false, reason: "amount_mismatch", duplicate: event.duplicate });
    }

    await markOrderAsPaid({
      orderId: order.id,
      transactionNsu,
      receiptUrl,
      captureMethod,
      paidAmountCents,
      paidAt: readIsoDate(body, "paid_at"),
      rawWebhookPayload: payload,
    });
    return Response.json({ ok: true, matched: true, paid: true, duplicate: event.duplicate });
  } catch (error) {
    debugError("[InfinitePay webhook] erro", error);
    return Response.json({ ok: false, error: "webhook_processing_error" }, { status: 500 });
  }
}

function readString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readInteger(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = body[key];
    const number = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN;
    if (Number.isInteger(number) && number >= 0) return number;
  }
}

function readIsoDate(body: Record<string, unknown>, key: string) {
  const value = readString(body, key);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

function safeHttpsUrl(value?: string) {
  if (!value) return undefined;
  try { const url = new URL(value); return url.protocol === "https:" ? url.toString() : undefined; } catch { return undefined; }
}

function debugError(message: string, details: unknown) {
  if (process.env.INFINITEPAY_DEBUG === "true") console.error(message, details);
}
