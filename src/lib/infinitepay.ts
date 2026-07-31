const INFINITEPAY_LINKS_ENDPOINT = "https://api.checkout.infinitepay.io/links";

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

export class InfinitePayError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly responseBody?: unknown,
  ) {
    super(message);
    this.name = "InfinitePayError";
  }
}

export async function createInfinitePayCheckout({
  orderNsu,
  items,
  customer,
  totalCents,
}: CreateInfinitePayCheckoutInput): Promise<string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/, "");

  const handle = getInfinitePayHandle();

  const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (
    calculatedTotal !== totalCents ||
    totalCents <= 0 ||
    items.some((item) => !Number.isInteger(item.quantity) || item.quantity <= 0 || !Number.isInteger(item.price) || item.price < 0)
  ) {
    throw new InfinitePayError("Total ou itens do checkout inconsistentes.", 400);
  }

  const redirectUrl = appUrl && !isLocalUrl(appUrl) ? `${appUrl}/pedido/sucesso` : undefined;
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
    items,
    ...(redirectUrl ? { redirect_url: redirectUrl } : {}),
  };

  console.info("[InfinitePay] handle usado", handle);
  console.info("[InfinitePay] payload final enviado", sanitizePayloadForLog(payload));

  let response: Response;
  try {
    response = await fetch(INFINITEPAY_LINKS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (error) {
    debugError("[InfinitePay] erro de fetch", getFetchErrorDetails(error));
    throw error;
  }

  const responseText = await response.text();
  const data = parseResponseBody(responseText);
  console.info("[InfinitePay] status e resposta", { status: response.status, response: data });

  if (!response.ok) {
    debugError("[InfinitePay] corpo da resposta de erro", data);
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

  return paymentUrl.toString();
}

export function getInfinitePayHandle(): string {
  const handle = process.env.INFINITEPAY_HANDLE?.trim();
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

function isLocalUrl(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function sanitizePayloadForLog(payload: {
  handle: string;
  order_nsu: string;
  customer?: { name: string; email: string; phone_number: string };
  address?: { cep: string; number: string; complement?: string };
  items: InfinitePayItem[];
  redirect_url?: string;
}) {
  return {
    ...payload,
    handle: maskValue(payload.handle, 3),
    ...(payload.customer ? { customer: {
      name: payload.customer.name,
      email: maskEmail(payload.customer.email),
      phone_number: maskValue(payload.customer.phone_number, 4),
    } } : {}),
    ...(payload.address ? { address: {
      cep: maskValue(payload.address.cep, 3),
      number: "***",
      ...(payload.address.complement ? { complement: "***" } : {}),
    } } : {}),
  };
}

function maskEmail(value: string) {
  const [localPart, domain] = value.split("@");
  return domain ? `${localPart.slice(0, 2)}***@${domain}` : "***";
}

function maskValue(value: string, visibleEnd: number) {
  return value.length > visibleEnd
    ? `${"*".repeat(Math.min(6, value.length - visibleEnd))}${value.slice(-visibleEnd)}`
    : "***";
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
