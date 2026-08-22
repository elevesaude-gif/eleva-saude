const INFINITEPAY_LINKS_ENDPOINT = "https://api.checkout.infinitepay.io/links";
export const INFINITEPAY_FISCAL_PRODUCT_DESCRIPTION = "Suplemento T";

export type InfinitePayItem = {
  quantity: number;
  price: number;
  description: string;
};

export type InfinitePayCustomer = {
  name: string;
  email: string;
  phoneNumber: string;
  address: {
    zipCode: string;
    number: string;
    complement?: string;
  };
};

type CreateInfinitePayCheckoutInput = {
  orderNsu: string;
  items: InfinitePayItem[];
  customer?: InfinitePayCustomer;
  totalCents: number;
};

export type InfinitePayCheckoutResult = {
  paymentUrl: string;
  responseStatus: number;
  providerStatus?: string;
  providerTransactionId?: string;
};

export function buildInfinitePayFiscalItems(items: InfinitePayItem[]): InfinitePayItem[] {
  return items.map((item) => ({
    quantity: item.quantity,
    price: item.price,
    description: INFINITEPAY_FISCAL_PRODUCT_DESCRIPTION,
  }));
}

export class InfinitePayError extends Error {
  readonly status: number;
  readonly responseBody?: unknown;
  readonly code: string;

  constructor(
    message: string,
    status: number,
    responseBody?: unknown,
    code = "infinitepay_error",
  ) {
    super(message);
    this.name = "InfinitePayError";
    this.status = status;
    this.responseBody = responseBody;
    this.code = code;
  }
}

export async function createInfinitePayCheckout({
  orderNsu,
  items,
  customer,
  totalCents,
}: CreateInfinitePayCheckoutInput): Promise<InfinitePayCheckoutResult> {
  const appUrl = getAppUrl();

  const handle = getInfinitePayHandle();

  const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (
    calculatedTotal !== totalCents ||
    totalCents <= 0 ||
    items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isInteger(item.price) || item.price < 0)
  ) {
    throw new InfinitePayError("Total ou itens do checkout inconsistentes.", 400);
  }

  const redirectUrl = `${appUrl}/pedido/sucesso`;
  const webhookUrl = `${appUrl}/api/webhooks/infinitepay`;
  const fiscalItems = buildInfinitePayFiscalItems(items);
  const payload = {
    handle,
    order_nsu: orderNsu,
    ...(customer ? { customer: {
      name: customer.name,
      email: customer.email,
      phone_number: customer.phoneNumber,
    }, address: {
      cep: customer.address.zipCode,
      number: customer.address.number,
      ...(customer.address.complement ? { complement: customer.address.complement } : {}),
    } } : {}),
    items: fiscalItems,
    redirect_url: redirectUrl,
    webhook_url: webhookUrl,
  };

  debugInfo("[InfinitePay] checkout enviado", {
    handle,
    order_nsu: orderNsu,
    redirect_url: redirectUrl,
    webhook_url: webhookUrl,
    item_count: items.length,
    total_cents: totalCents,
    fiscal_description: INFINITEPAY_FISCAL_PRODUCT_DESCRIPTION,
  });

  let response: Response;
  try {
    response = await fetch(INFINITEPAY_LINKS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (error) {
    debugError("[InfinitePay] erro de fetch", getFetchErrorDetails(error));
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new InfinitePayError(
      timedOut ? "Timeout ao conectar com a InfinitePay." : "Falha de conexão com a InfinitePay.",
      502,
      undefined,
      timedOut ? "infinitepay_timeout" : "infinitepay_transport_error",
    );
  }

  const responseText = await response.text();
  const data = parseResponseBody(responseText);
  logCheckoutResult({
    order_nsu: orderNsu,
    response_status: response.status,
    item_count: items.length,
    total_cents: totalCents,
    fiscal_description: INFINITEPAY_FISCAL_PRODUCT_DESCRIPTION,
    webhook_url_present: payload.webhook_url ? "sim" : "não",
  });
  debugInfo("[InfinitePay] resposta recebida", { status: response.status });

  if (!response.ok) {
    debugError("[InfinitePay] resposta de erro", { status: response.status });
    throw new InfinitePayError(
      getInfinitePayErrorMessage(data) ?? "InfinitePay recusou a criação do checkout.",
      response.status,
      data,
    );
  }

  if (!isCheckoutResponse(data)) {
    throw new InfinitePayError("Resposta inválida da InfinitePay: URL de pagamento ausente.", 502, data);
  }

  const paymentUrl = new URL(data.url);
  if (paymentUrl.protocol !== "https:") {
    throw new InfinitePayError("URL de pagamento inválida.", 502, data);
  }

  return {
    paymentUrl: paymentUrl.toString(),
    responseStatus: response.status,
    providerStatus: readProviderString(data, ["status", "payment_status"]),
    providerTransactionId: readProviderString(data, ["payment_id", "transaction_id", "transaction_nsu", "id"]),
  };
}

export function getInfinitePayHandle(): string {
  const handle = process.env.INFINITEPAY_HANDLE?.trim().replace(/^\$+/, "");
  if (!handle) throw new InfinitePayError("INFINITEPAY_HANDLE não configurado", 500);
  return handle;
}

function isCheckoutResponse(value: unknown): value is { url: string } {
  return Boolean(value && typeof value === "object" && "url" in value && typeof value.url === "string");
}

function parseResponseBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getInfinitePayErrorMessage(value: unknown): string | undefined {
  if (typeof value === "string") return value.trim() || undefined;
  if (!value || typeof value !== "object") return undefined;

  for (const key of ["message", "error", "detail"]) {
    const candidate = (value as Record<string, unknown>)[key];
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim();
  }
}

function readProviderString(value: unknown, keys: string[]) {
  if (!value || typeof value !== "object") return undefined;
  for (const key of keys) {
    const candidate = (value as Record<string, unknown>)[key];
    if ((typeof candidate === "string" || typeof candidate === "number") && String(candidate).trim()) return String(candidate).trim();
  }
}

function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");
  if (configured) {
    try {
      return new URL(configured).toString().replace(/\/+$/, "");
    } catch {
      throw new InfinitePayError("NEXT_PUBLIC_APP_URL inválida.", 500);
    }
  }
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  throw new InfinitePayError("NEXT_PUBLIC_APP_URL não configurada.", 500);
}

function getFetchErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      cause: error.cause,
      ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {}),
    };
  }

  return {
    name: "UnknownError",
    message: String(error),
    cause: undefined,
  };
}

function debugError(message: string, details: unknown) {
  if (process.env.INFINITEPAY_DEBUG === "true") console.error(message, details);
}

function debugInfo(message: string, details: unknown) {
  if (process.env.INFINITEPAY_DEBUG === "true") console.info(message, details);
}

function logCheckoutResult(details: {
  order_nsu: string;
  response_status: number;
  item_count: number;
  total_cents: number;
  fiscal_description: typeof INFINITEPAY_FISCAL_PRODUCT_DESCRIPTION;
  webhook_url_present: "sim" | "não";
}) {
  console.info("[InfinitePay] checkout", details);
}
