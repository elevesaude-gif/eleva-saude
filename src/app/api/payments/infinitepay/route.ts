import {
  createInfinitePayCheckout,
  InfinitePayError,
  type InfinitePayItem,
} from "@/lib/infinitepay";
import { sellers } from "@/lib/sellers";
import { getAuthoritativeProductsByIds, InvalidAuthoritativeProductError, ProductValidationUnavailableError } from "@/lib/products";
import { calculateAuthoritativeSubtotal } from "@/lib/product-validation";
import { createOrderWithItems, recordCheckoutFailure, updateOrderPaymentUrl } from "@/lib/orders";
import { getShippingQuotes, verifySealedShippingQuote } from "@/lib/shipping";
import type { CustomerData, SellerSlug } from "@/types/checkout";
import { initialCoupons, validateCoupon, type Coupon } from "@/lib/coupons";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CheckoutRequest = {
  items: Array<{ productId: string; quantity: number }>;
  customer: CustomerData;
  seller: SellerSlug;
  shippingId: string;
  shippingQuoteToken?: string;
  couponCode?: string;
  coupon?: Coupon;
};

export async function POST(request: Request) {
  let savedOrder: { id: string; order_nsu: string } | undefined;
  let sanitizedPayload: unknown;
  let stage: "validation" | "supabase" | "infinitepay" = "validation";

  try {
    const input: unknown = await request.json();
    sanitizedPayload = sanitizeCheckoutRequest(input);
    debugInfo("1. payload recebido");
    if (!isCheckoutRequest(input)) {
      return errorResponse("validation_error", "Dados do pedido inválidos.", 400);
    }
    debugInfo("2. validação concluída");

    const availableProducts = await getAuthoritativeProductsByIds(input.items);
    const canonicalLines = input.items.map((requestedItem) => {
      const product = availableProducts.find((candidate) => candidate.id === requestedItem.productId);
      if (!product) throw new InvalidCheckoutError("Produto inválido.");
      const unitPriceCents = product.priceCents ?? Math.round(product.price * 100);
      return {
        productId: product.id,
        description: product.name,
        quantity: requestedItem.quantity,
        unitPriceCents,
        lineTotalCents: unitPriceCents * requestedItem.quantity,
      };
    });

    const subtotalCents = calculateAuthoritativeSubtotal(canonicalLines.map(line=>({unitPriceCents:line.unitPriceCents,quantity:line.quantity})));
    const shippingOptions = await getShippingQuotes({
      postalCode: input.customer.zipCode,
      items: input.items.map(item=>({id:item.productId,quantity:item.quantity})),
      subtotalCents,
      authoritativeProducts:availableProducts,
    });
    const sealedShipping = verifySealedShippingQuote(input.shippingQuoteToken, {
      postalCode: input.customer.zipCode,
      items: input.items.map(item=>({id:item.productId,quantity:item.quantity})),
      subtotalCents,
    });
    const shipping = shippingOptions.find((option) => option.id === input.shippingId);
    if (!shipping || shipping.id !== input.shippingId || (shipping.source === "melhor_envio" && (!sealedShipping || sealedShipping.id !== shipping.id || sealedShipping.priceCents !== shipping.priceCents))) throw new InvalidCheckoutError("Frete inválido.");

    const normalizedCoupon = input.couponCode?.trim().toUpperCase();
    const couponDefinition = input.coupon ?? initialCoupons.find((coupon) => coupon.code === normalizedCoupon);
    const couponResult = normalizedCoupon && couponDefinition ? validateCoupon([couponDefinition], normalizedCoupon, input.seller, subtotalCents / 100) : null;
    const couponIsValid = couponResult?.valid === true;
    const discountCents = couponResult?.valid ? Math.round(couponResult.discount * 100) : 0;
    const shippingCents = shipping.priceCents;
    const totalCents = subtotalCents - discountCents + shippingCents;

    debugInfo("3. totais recalculados", { subtotalCents, discountCents, shippingCents, totalCents });

    const orderNsu = generateOrderNsu();
    stage = "supabase";
    debugInfo("4. salvando pedido no Supabase");
    savedOrder = await createOrderWithItems({
      orderNsu,
      sellerSlug: input.seller,
      sellerName: sellers[input.seller],
      customer: {
        name: input.customer.fullName.trim(),
        cpf: input.customer.cpf.replace(/\D/g, ""),
        phone: input.customer.whatsapp.replace(/\D/g, ""),
        email: input.customer.email.trim().toLowerCase(),
        postalCode: input.customer.zipCode.replace(/\D/g, ""),
        street: input.customer.street.trim(),
        number: input.customer.number.trim(),
        complement: input.customer.complement.trim() || undefined,
        neighborhood: input.customer.neighborhood.trim(),
        city: input.customer.city.trim(),
        state: input.customer.state.trim().toUpperCase(),
        reference: input.customer.reference.trim() || undefined,
      },
      subtotalCents,
      discountCents,
      shippingCents,
      totalCents,
      shippingId: shipping.id,
      shippingCompany: shipping.provider,
      shippingService: shipping.service,
      shippingDeadline: shipping.deliveryTime,
      shippingQuoteSource: shipping.source,
      shippingDeliveryTime: shipping.deliveryTime,
      shippingServiceId: shipping.id,
      couponCode: couponIsValid ? normalizedCoupon : undefined,
      rawCheckoutPayload: sanitizedPayload,
      items: canonicalLines.map((line) => ({
        productId: line.productId,
        productName: line.description,
        quantity: line.quantity,
        unitPriceCents: line.unitPriceCents,
        totalPriceCents: line.lineTotalCents,
      })),
    }, (saveStage) => {
      if (saveStage === "order_saved") debugInfo("5. pedido salvo");
      if (saveStage === "saving_items") debugInfo("6. salvando itens");
      if (saveStage === "items_saved") debugInfo("7. itens salvos");
    });

    const paymentItems = buildPaymentItems(canonicalLines, discountCents, subtotalCents);
    if (shippingCents > 0) paymentItems.push({ description: `Frete - ${shipping.provider} ${shipping.service}`, quantity: 1, price: shippingCents });
    stage = "infinitepay";
    debugInfo("8. criando checkout InfinitePay");
    const paymentUrl = await createInfinitePayCheckout({
      orderNsu: savedOrder.order_nsu,
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
    debugInfo("9. URL de pagamento recebida");

    stage = "supabase";
    await updateOrderPaymentUrl(savedOrder.id, paymentUrl);
    debugInfo("10. payment_url salva no Supabase");
    debugInfo("11. retornando sucesso ao front");
    return NextResponse.json({ ok: true, orderId: savedOrder.id, orderNsu: savedOrder.order_nsu, paymentUrl });
  } catch (error) {
    if (savedOrder) {
      await recordCheckoutFailure(savedOrder.id, {
        request: sanitizedPayload,
        checkout_error: safeErrorForStorage(error),
      }).catch((storageError) => debugError("[InfinitePay] falha ao registrar erro", storageError));
    }
    if (error instanceof InvalidCheckoutError) {
      return errorResponse("validation_error", error.message, 400, error);
    }
    if(error instanceof ProductValidationUnavailableError){return errorResponse("product_validation_unavailable","Não foi possível validar os produtos neste momento. Tente novamente.",503);}
    if(error instanceof InvalidAuthoritativeProductError){return errorResponse("validation_error",error.message,400);}
    debugError("[InfinitePay] falha ao criar checkout", safeErrorForLog(error));
    if (error instanceof InfinitePayError || stage === "infinitepay") {
      return errorResponse(
        "infinitepay_error",
        "A InfinitePay não conseguiu criar o pagamento.",
        error instanceof InfinitePayError ? normalizeHttpStatus(error.status) : 502,
        error,
      );
    }
    if (stage === "supabase") {
      return errorResponse("supabase_error", "Não foi possível salvar ou consultar o pedido.", 500, error);
    }
    return errorResponse("internal_checkout_error", "Não foi possível iniciar o pagamento. Tente novamente.", 500, error);
  }
}

function buildPaymentItems(
  lines: Array<{ description: string; quantity: number; lineTotalCents: number; unitPriceCents: number }>,
  discountCents: number,
  subtotalCents: number,
): InfinitePayItem[] {
  if (!discountCents) return lines.map((line) => ({ description: line.description, quantity: line.quantity, price: line.unitPriceCents }));
  let allocatedDiscount = 0;
  return lines.map((line, index) => {
    const lineDiscount = index === lines.length - 1
      ? discountCents - allocatedDiscount
      : Math.round(discountCents * (line.lineTotalCents / subtotalCents));
    allocatedDiscount += lineDiscount;
    return { description: `${line.quantity}x ${line.description} (desconto aplicado)`, quantity: 1, price: line.lineTotalCents - lineDiscount };
  });
}

function isCheckoutRequest(value: unknown): value is CheckoutRequest {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<CheckoutRequest>;
  if(!Object.keys(value).every(key=>["items","customer","seller","shippingId","shippingQuoteToken","couponCode","coupon"].includes(key)))return false;
  return (
    (input.seller === "isabela" || input.seller === "caio") && Array.isArray(input.items) && input.items.length > 0 &&
    input.items.length <= 100 && input.items.every((item) => Boolean(item && Object.keys(item).length===2 && typeof item.productId === "string" &&
      Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99)) &&
    new Set(input.items.map((item) => item.productId)).size === input.items.length && Boolean(input.customer && hasRequiredCustomerData(input.customer)) &&
    typeof input.shippingId === "string" && (input.shippingQuoteToken === undefined || typeof input.shippingQuoteToken === "string") &&
    (input.couponCode === undefined || typeof input.couponCode === "string") && (input.coupon === undefined || isCouponPayload(input.coupon))
  );
}

function isCouponPayload(value: unknown): value is Coupon {
  if (!value || typeof value !== "object") return false;
  const coupon = value as Partial<Coupon>;
  return Object.keys(value).every((key) => ["id","code","seller","discountType","discountValue","minimumPurchase","maximumUses","currentUses","startsAt","expiresAt","active"].includes(key)) &&
    typeof coupon.id === "string" && typeof coupon.code === "string" && ["isabela","caio","todos"].includes(coupon.seller ?? "") && ["percentual","fixo"].includes(coupon.discountType ?? "") &&
    [coupon.discountValue,coupon.minimumPurchase,coupon.maximumUses,coupon.currentUses].every((number) => typeof number === "number" && Number.isFinite(number) && number >= 0) &&
    typeof coupon.startsAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(coupon.startsAt) && typeof coupon.expiresAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(coupon.expiresAt) && typeof coupon.active === "boolean";
}

function hasRequiredCustomerData(customer: CustomerData) {
  return typeof customer.fullName === "string" && customer.fullName.trim().length >= 3 && typeof customer.email === "string" &&
    /^\S+@\S+\.\S+$/.test(customer.email.trim()) && typeof customer.whatsapp === "string" && customer.whatsapp.replace(/\D/g, "").length === 11 &&
    typeof customer.cpf === "string" && customer.cpf.replace(/\D/g, "").length === 11 && typeof customer.zipCode === "string" &&
    customer.zipCode.replace(/\D/g, "").length === 8 && typeof customer.street === "string" && customer.street.trim().length > 0 &&
    typeof customer.number === "string" && customer.number.trim().length > 0 && typeof customer.complement === "string" &&
    typeof customer.neighborhood === "string" && customer.neighborhood.trim().length > 0 && typeof customer.city === "string" &&
    customer.city.trim().length > 0 && typeof customer.state === "string" && /^[A-Za-z]{2}$/.test(customer.state) &&
    typeof customer.reference === "string";
}

function sanitizeCheckoutRequest(value: unknown) {
  if (!value || typeof value !== "object") return value;
  const body = value as Record<string, unknown>;
  const customer = body.customer && typeof body.customer === "object" ? body.customer as Record<string, unknown> : undefined;
  const safeBody = { ...body };
  delete safeBody.testToken;
  return { ...safeBody, ...(customer ? { customer: { ...customer, cpf: maskValue(String(customer.cpf || ""), 2), whatsapp: maskValue(String(customer.whatsapp || ""), 4), email: maskEmail(String(customer.email || "")) } } : {}) };
}

function safeErrorForStorage(error: unknown) {
  if (error instanceof InfinitePayError) return { ...serializeError(error), status: error.status, response: error.responseBody };
  if (error instanceof Error) return serializeError(error);
  return { message: String(error) };
}

function safeErrorForLog(error: unknown) {
  if (error instanceof InfinitePayError) return { name: error.name, message: error.message, status: error.status };
  if (error instanceof Error) return { name: error.name, message: error.message };
  return { name: "UnknownError" };
}

type CheckoutErrorCode = "supabase_error" | "infinitepay_error" | "validation_error" | "internal_checkout_error" | "product_validation_unavailable";

function errorResponse(code: CheckoutErrorCode, message: string, status: number, error?: unknown) {
  return NextResponse.json({
    ok: false,
    error: code,
    message,
    detail: process.env.NODE_ENV === "development" && error !== undefined ? serializeError(error) : undefined,
  }, { status });
}

function serializeError(error: unknown) {
  if (!(error instanceof Error)) return { name: "UnknownError", message: String(error), cause: undefined };
  const supabase = parseSupabaseError(error.message);
  return {
    name: error.name,
    message: supabase?.message ?? error.message,
    cause: serializeCause(error.cause),
    ...(supabase ? { code: supabase.code, details: supabase.details, hint: supabase.hint } : {}),
  };
}

function parseSupabaseError(message: string): { message: string; code?: string; details?: string; hint?: string } | undefined {
  try {
    const parsed: unknown = JSON.parse(message);
    if (!parsed || typeof parsed !== "object") return undefined;
    const value = parsed as Record<string, unknown>;
    if (typeof value.message !== "string") return undefined;
    return {
      message: value.message,
      code: typeof value.code === "string" ? value.code : undefined,
      details: typeof value.details === "string" ? value.details : undefined,
      hint: typeof value.hint === "string" ? value.hint : undefined,
    };
  } catch {
    return undefined;
  }
}

function serializeCause(cause: unknown): unknown {
  if (cause instanceof Error) return { name: cause.name, message: cause.message };
  if (cause === undefined || cause === null || ["string", "number", "boolean"].includes(typeof cause)) return cause;
  return String(cause);
}

function generateOrderNsu() {
  const compactDate = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  return `ELEVE-${compactDate}-${crypto.randomUUID().slice(0, 8)}`;
}
function normalizePhone(value: string) { const digits = value.replace(/\D/g, ""); return digits.startsWith("55") ? `+${digits}` : `+55${digits}`; }
function maskEmail(value: string) { const [local, domain] = value.split("@"); return domain ? `${local.slice(0, 2)}***@${domain}` : "***"; }
function maskValue(value: string, visibleEnd: number) { return value.length > visibleEnd ? `${"*".repeat(Math.min(6, value.length - visibleEnd))}${value.slice(-visibleEnd)}` : "***"; }
function normalizeHttpStatus(status: number) { return Number.isInteger(status) && status >= 400 && status <= 599 ? status : 502; }
function debugInfo(message: string, details?: unknown) { if (process.env.INFINITEPAY_DEBUG === "true") console.info(message, details ?? ""); }
function debugError(message: string, details: unknown) { if (process.env.INFINITEPAY_DEBUG === "true") console.error(message, details); }
class InvalidCheckoutError extends Error {}
