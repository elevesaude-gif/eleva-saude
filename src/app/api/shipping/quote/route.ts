import { getShippingQuotes, sealShippingQuotes, ShippingQuoteUnavailableError } from "@/lib/shipping";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type QuoteRequest = {
  postalCode: string;
  items: Array<{ id: string; quantity: number }>;
  subtotalCents: number;
  testToken?: string;
};

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    if (!isQuoteRequest(input)) {
      return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }
    const allowTestProduct = Boolean(process.env.TEST_PRODUCT_TOKEN) && input.testToken === process.env.TEST_PRODUCT_TOKEN;
    const options = sealShippingQuotes(await getShippingQuotes({ ...input, allowTestProduct, reportUnavailable: true }), {
      postalCode: input.postalCode,
      items: input.items,
      subtotalCents: input.subtotalCents,
    });
    return Response.json({ ok: true, options });
  } catch (error) {
    const message = error instanceof Error ? error.message : "invalid_request";
    const status = message.startsWith("invalid_") ? 400 : error instanceof ShippingQuoteUnavailableError ? 503 : 500;
    const publicMessage = error instanceof ShippingQuoteUnavailableError
      ? "Não foi possível calcular o frete agora. Confira o CEP ou tente novamente em instantes."
      : "Não foi possível processar a solicitação de frete.";
    return Response.json({ ok: false, error: message, message: publicMessage }, { status });
  }
}

function isQuoteRequest(value: unknown): value is QuoteRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<QuoteRequest>;
  return typeof input.postalCode === "string" && input.postalCode.replace(/\D/g, "").length === 8 &&
    Array.isArray(input.items) && input.items.length > 0 && input.items.every((item) => Boolean(item && typeof item.id === "string" && Number.isInteger(item.quantity))) &&
    Number.isInteger(input.subtotalCents) && Number(input.subtotalCents) >= 0 &&
    (input.testToken === undefined || typeof input.testToken === "string");
}
