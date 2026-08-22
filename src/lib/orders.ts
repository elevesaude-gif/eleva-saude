import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrderItemInput = {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
};

export type CreateOrderInput = {
  orderNsu: string;
  sellerSlug: string;
  sellerName: string;
  customer: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    postalCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    reference?: string;
  };
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  shippingId: string;
  shippingCompany?: string;
  shippingService: string;
  shippingDeadline?: string;
  shippingQuoteSource?: string;
  shippingDeliveryTime?: string;
  shippingServiceId?: string;
  couponCode?: string;
  rawCheckoutPayload: unknown;
  items: OrderItemInput[];
};

export type OrderRecord = {
  id: string;
  order_nsu: string;
  total_cents: number;
  payment_status: string;
  payment_url: string | null;
  transaction_nsu: string | null;
  receipt_url: string | null;
  capture_method: string | null;
};

type OrderSaveStage = "order_saved" | "saving_items" | "items_saved";

type SupabaseErrorShape = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

function throwSupabaseError(error: SupabaseErrorShape): never {
  throw new Error(JSON.stringify({
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  }));
}

export async function createOrderWithItems(
  input: CreateOrderInput,
  onStage?: (stage: OrderSaveStage) => void,
): Promise<OrderRecord> {
  const supabase = getSupabaseServerClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_nsu: input.orderNsu,
      seller_slug: input.sellerSlug,
      seller_name: input.sellerName,
      customer_name: input.customer.name,
      customer_cpf: input.customer.cpf,
      customer_phone: input.customer.phone,
      customer_email: input.customer.email,
      postal_code: input.customer.postalCode,
      street: input.customer.street,
      address_number: input.customer.number,
      complement: input.customer.complement || null,
      neighborhood: input.customer.neighborhood,
      city: input.customer.city,
      state: input.customer.state,
      reference: input.customer.reference || null,
      subtotal_cents: input.subtotalCents,
      discount_cents: input.discountCents,
      shipping_cents: input.shippingCents,
      total_cents: input.totalCents,
      shipping_id: input.shippingId,
      shipping_company: input.shippingCompany || null,
      shipping_service: input.shippingService,
      shipping_deadline: input.shippingDeadline || null,
      shipping_quote_source: input.shippingQuoteSource || null,
      shipping_delivery_time: input.shippingDeliveryTime || null,
      shipping_service_id: input.shippingServiceId || null,
      coupon_code: input.couponCode || null,
      payment_status: "pending",
      fulfillment_status: "pending",
      raw_checkout_payload: input.rawCheckoutPayload,
    })
    .select("id, order_nsu, total_cents, payment_status, payment_url, transaction_nsu, receipt_url, capture_method")
    .single();

  if (orderError) throwSupabaseError(orderError);
  if (!order) throw new Error(JSON.stringify({ message: "Supabase não retornou o pedido inserido." }));
  onStage?.("order_saved");
  onStage?.("saving_items");

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price_cents: item.unitPriceCents,
      total_price_cents: item.totalPriceCents,
    })),
  );

  if (itemsError) throwSupabaseError(itemsError);
  onStage?.("items_saved");
  return order as OrderRecord;
}

export async function updateOrderPaymentUrl(orderId: string, paymentUrl: string) {
  const { error } = await getSupabaseServerClient().from("orders").update({ payment_url: paymentUrl }).eq("id", orderId);
  if (error) throwSupabaseError(error);
}

export async function countOrdersByCouponCode(couponCode: string) {
  const { count, error } = await getSupabaseServerClient()
    .from("orders")
    .select("id", { count: "exact", head: true })
    .ilike("coupon_code", couponCode.trim());
  if (error) throwSupabaseError(error);
  return count ?? 0;
}

export async function recordCheckoutFailure(orderId: string, rawCheckoutPayload: unknown) {
  const { error } = await getSupabaseServerClient()
    .from("orders")
    .update({ raw_checkout_payload: rawCheckoutPayload, payment_url: null })
    .eq("id", orderId);
  if (error) throwSupabaseError(error);
}

export async function createPaymentAttempt(input: {
  orderId: string;
  sellerSlug: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountCents: number;
}) {
  const { data, error } = await getSupabaseServerClient().from("payment_attempts").insert({
    order_id: input.orderId,
    seller_slug: input.sellerSlug,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone,
    amount_cents: input.amountCents,
    installments: null,
    provider: "infinitepay",
    status: "initiated",
  }).select("id").single();
  if (error) throwSupabaseError(error);
  if (!data) throw new Error("Supabase não retornou a tentativa de pagamento inserida.");
  return data.id as string;
}

export async function updatePaymentAttempt(input: {
  attemptId: string;
  status: "link_created" | "provider_rejected" | "provider_error" | "internal_error" | "paid";
  providerStatus?: string;
  providerTransactionId?: string;
  errorCode?: string;
  errorMessage?: string;
}) {
  const { error } = await getSupabaseServerClient().from("payment_attempts").update({
    status: input.status,
    provider_status: input.providerStatus || null,
    provider_transaction_id: input.providerTransactionId || null,
    error_code: input.errorCode || null,
    error_message: input.errorMessage || null,
    updated_at: new Date().toISOString(),
  }).eq("id", input.attemptId);
  if (error) throwSupabaseError(error);
}

export async function markLatestPaymentAttemptAsPaid(input: {
  orderId: string;
  providerTransactionId?: string;
  providerStatus?: string;
  installments?: number;
}) {
  const supabase = getSupabaseServerClient();
  const { data, error: findError } = await supabase
    .from("payment_attempts")
    .select("id")
    .eq("order_id", input.orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (findError) throwSupabaseError(findError);
  if (!data) return;
  const { error } = await supabase.from("payment_attempts").update({
    status: "paid",
    provider_status: input.providerStatus || "paid",
    provider_transaction_id: input.providerTransactionId || null,
    installments: input.installments || null,
    error_code: null,
    error_message: null,
    updated_at: new Date().toISOString(),
  }).eq("id", data.id);
  if (error) throwSupabaseError(error);
}

export async function findOrderByNsu(orderNsu: string): Promise<OrderRecord | null> {
  const { data, error } = await getSupabaseServerClient()
    .from("orders")
    .select("id, order_nsu, total_cents, payment_status, payment_url, transaction_nsu, receipt_url, capture_method")
    .eq("order_nsu", orderNsu)
    .maybeSingle();
  if (error) throwSupabaseError(error);
  return data as OrderRecord | null;
}

export async function markOrderAsPaid(input: {
  orderId: string;
  transactionNsu?: string;
  receiptUrl?: string;
  captureMethod?: string;
  paidAmountCents: number;
  paidAt?: string;
  rawWebhookPayload: unknown;
}) {
  const supabase = getSupabaseServerClient();
  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      transaction_nsu: input.transactionNsu || null,
      receipt_url: input.receiptUrl || null,
      capture_method: input.captureMethod || null,
      paid_amount_cents: input.paidAmountCents,
      paid_at: input.paidAt || new Date().toISOString(),
      raw_webhook_payload: input.rawWebhookPayload,
    })
    .eq("id", input.orderId);
  if (error) throwSupabaseError(error);

  const { error: fulfillmentError } = await supabase
    .from("orders")
    .update({ fulfillment_status: "paid_not_fulfilled" })
    .eq("id", input.orderId)
    .in("fulfillment_status", ["pending", "awaiting_payment"]);
  if (fulfillmentError) throwSupabaseError(fulfillmentError);
}

export async function recordPaymentEvent(input: {
  orderId?: string;
  orderNsu?: string;
  eventType: string;
  transactionNsu?: string;
  payload: unknown;
}) {
  const supabase = getSupabaseServerClient();
  if (input.transactionNsu) {
    const { data, error } = await supabase
      .from("payment_events")
      .select("id")
      .eq("transaction_nsu", input.transactionNsu)
      .maybeSingle();
    if (error) throwSupabaseError(error);
    if (data) return { duplicate: true };
  }

  const { error } = await supabase.from("payment_events").insert({
    order_id: input.orderId || null,
    order_nsu: input.orderNsu || null,
    provider: "infinitepay",
    event_type: input.eventType,
    transaction_nsu: input.transactionNsu || null,
    payload: input.payload,
  });
  if (error?.code === "23505") return { duplicate: true };
  if (error) throwSupabaseError(error);
  return { duplicate: false };
}
