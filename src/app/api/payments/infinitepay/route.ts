import {
  createInfinitePayCheckout,
  getInfinitePayHandle,
  InfinitePayError,
  type InfinitePayItem,
} from "@/lib/infinitepay";
import { products, shippingOptions } from "@/lib/mock-data";
import type { CustomerData, SellerSlug } from "@/types/checkout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutRequest = {
  items: Array<{ id: string; quantity: number }>;
  customer: CustomerData;
  seller: SellerSlug;
  shippingId: string;
  couponCode?: string;
  totalCents: number;
};

export async function POST(request: Request) {
  try {
    const input: unknown = await request.json();
    console.info("[InfinitePay] body recebido", sanitizeCheckoutRequest(input));
    if (!isCheckoutRequest(input)) {
      return Response.json({ error: "invalid_checkout_request", message: "Dados do pedido inválidos." }, { status: 400 });
    }

    console.info("[InfinitePay] produtos recebidos", input.items);
    console.info("[InfinitePay] frete recebido", input.shippingId);
    console.info("[InfinitePay] customer recebido", sanitizeCustomer(input.customer));
    console.info("[InfinitePay] handle usado", getInfinitePayHandle());

    const canonicalLines = input.items.map((requestedItem) => {
      const product = products.find((candidate) => candidate.id === requestedItem.id);
      if (!product) throw new InvalidCheckoutError("Produto inválido.");
      return {
        description: product.name,
        quantity: requestedItem.quantity,
        unitPriceCents: Math.round(product.price * 100),
        lineTotalCents: Math.round(product.price * 100) * requestedItem.quantity,
      };
    });

    const shipping = shippingOptions.find((option) => option.id === input.shippingId);
    if (!shipping) throw new InvalidCheckoutError("Frete inválido.");

    const subtotalCents = canonicalLines.reduce((sum, line) => sum + line.lineTotalCents, 0);
    const expectedCoupon = `${input.seller.toUpperCase()}10`;
    const couponIsValid = input.couponCode?.trim().toUpperCase() === expectedCoupon;
    const discountCents = couponIsValid ? Math.round(subtotalCents * 0.1) : 0;
    const shippingCents = Math.round(shipping.price * 100);
    const totalCents = subtotalCents - discountCents + shippingCents;
    console.info("[InfinitePay] subtotal calculado", subtotalCents);
    console.info("[InfinitePay] total calculado", totalCents);

    if (input.totalCents !== totalCents) {
      throw new InvalidCheckoutError("O total do pedido mudou. Revise o pedido e tente novamente.");
    }

    const paymentItems = buildPaymentItems(canonicalLines, discountCents, subtotalCents);
    paymentItems.push({ description: `Frete - ${shipping.name}`, quantity: 1, price: shippingCents });

    const orderNsu = generateOrderNsu();
    debugInfo("[InfinitePay] order_nsu:", orderNsu);
    const paymentUrl = await createInfinitePayCheckout({
      orderNsu,
      items: paymentItems,
      customer: {
        name: input.customer.fullName.trim(),
        email: input.customer.email.trim(),
        phoneNumber: normalizePhone(input.customer.whatsapp),
        address: {
          zipCode: input.customer.zipCode.replace(/\D/g, ""),
          number: input.customer.number.trim(),
          complement: input.customer.complement.trim() || undefined,
        },
      },
      totalCents,
    });

    return Response.json({ ok: true, orderNsu, paymentUrl });
  } catch (error) {
    if (error instanceof InvalidCheckoutError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof InfinitePayError) {
      debugError("[InfinitePay] falha ao criar checkout", {
        status: error.status,
        message: error.message,
      });
      return Response.json(
        {
          error: "internal_checkout_error",
          message: sanitizeErrorMessage(error.message),
          detail: developmentDetail(error),
        },
        { status: normalizeHttpStatus(error.status) },
      );
    }
    debugError("[InfinitePay] erro inesperado", error);
    return Response.json(
      {
        error: "internal_checkout_error",
        message: sanitizeErrorMessage(error instanceof Error ? error.message : "Erro interno desconhecido."),
        detail: developmentDetail(error),
      },
      { status: 502 },
    );
  }
}

function sanitizeCheckoutRequest(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const body = value as Record<string, unknown>;
  return { ...body, ...(body.customer && typeof body.customer === "object" ? { customer: sanitizeCustomer(body.customer as CustomerData) } : {}) };
}

function sanitizeCustomer(customer: CustomerData) {
  return { ...customer, cpf: maskValue(customer.cpf, 2), whatsapp: maskValue(customer.whatsapp, 4), email: maskEmail(customer.email) };
}

function maskEmail(value: string) {
  const [local, domain] = value.split("@");
  return domain ? `${local.slice(0, 2)}***@${domain}` : "***";
}

function maskValue(value: string, visibleEnd: number) {
  return value.length > visibleEnd ? `${"*".repeat(Math.min(6, value.length - visibleEnd))}${value.slice(-visibleEnd)}` : "***";
}

function developmentDetail(error: unknown) {
  if (process.env.NODE_ENV !== "development") return undefined;
  if (error instanceof InfinitePayError) return { status: error.status, response: error.responseBody };
  if (error instanceof Error) return { name: error.name, message: error.message, cause: error.cause };
  return String(error);
}

function buildPaymentItems(
  lines: Array<{ description: string; quantity: number; unitPriceCents: number; lineTotalCents: number }>,
  discountCents: number,
  subtotalCents: number,
): InfinitePayItem[] {
  if (!discountCents) {
    return lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      price: line.unitPriceCents,
    }));
  }

  let allocatedDiscount = 0;
  return lines.map((line, index) => {
    const isLast = index === lines.length - 1;
    const lineDiscount = isLast
      ? discountCents - allocatedDiscount
      : Math.round(discountCents * (line.lineTotalCents / subtotalCents));
    allocatedDiscount += lineDiscount;
    return {
      description: `${line.quantity}x ${line.description} (desconto aplicado)`,
      quantity: 1,
      price: line.lineTotalCents - lineDiscount,
    };
  });
}

function generateOrderNsu() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const time = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
    String(now.getSeconds()).padStart(2, "0"),
  ].join("");
  return `ELEVE-${date}-${time}-${crypto.randomUUID().slice(0, 8)}`;
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.startsWith("55") ? `+${digits}` : `+55${digits}`;
}

function isCheckoutRequest(value: unknown): value is CheckoutRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<CheckoutRequest>;
  return (
    (input.seller === "isabela" || input.seller === "caio") &&
    Array.isArray(input.items) &&
    input.items.length > 0 &&
    input.items.length <= products.length &&
    input.items.every((item) =>
      Boolean(item && typeof item.id === "string" && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99)
    ) &&
    new Set(input.items.map((item) => item.id)).size === input.items.length &&
    Boolean(input.customer && hasRequiredCustomerData(input.customer)) &&
    typeof input.shippingId === "string" &&
    (input.couponCode === undefined || typeof input.couponCode === "string") &&
    typeof input.totalCents === "number" &&
    Number.isInteger(input.totalCents) &&
    input.totalCents > 0
  );
}

function hasRequiredCustomerData(customer: CustomerData) {
  return (
    typeof customer.fullName === "string" &&
    typeof customer.email === "string" &&
    typeof customer.whatsapp === "string" &&
    typeof customer.cpf === "string" &&
    typeof customer.zipCode === "string" &&
    typeof customer.street === "string" &&
    typeof customer.number === "string" &&
    typeof customer.neighborhood === "string" &&
    typeof customer.city === "string" &&
    typeof customer.state === "string" &&
    typeof customer.complement === "string" &&
    customer.fullName.trim().length >= 3 &&
    /^\S+@\S+\.\S+$/.test(customer.email.trim()) &&
    customer.whatsapp.replace(/\D/g, "").length === 11 &&
    customer.cpf.replace(/\D/g, "").length === 11 &&
    customer.zipCode.replace(/\D/g, "").length === 8 &&
    customer.street.trim().length > 0 &&
    customer.number.trim().length > 0 &&
    customer.neighborhood.trim().length > 0 &&
    customer.city.trim().length > 0 &&
    /^[A-Za-z]{2}$/.test(customer.state)
  );
}

class InvalidCheckoutError extends Error {}

function sanitizeErrorMessage(message: string) {
  return message.replace(/[\r\n\t]+/g, " ").trim().slice(0, 300) || "A InfinitePay recusou a criação do pagamento.";
}

function normalizeHttpStatus(status: number) {
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 502;
}

function debugInfo(message: string, details: unknown) {
  if (process.env.INFINITEPAY_DEBUG === "true") console.info(message, details);
}

function debugError(message: string, details: unknown) {
  if (process.env.INFINITEPAY_DEBUG === "true") console.error(message, details);
}
