import "server-only";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export const fulfillmentStatuses = [
  "awaiting_payment",
  "paid_not_fulfilled",
  "in_preparation",
  "shipped",
  "completed",
  "canceled",
] as const;

export type FulfillmentStatus = typeof fulfillmentStatuses[number];
export type AdminFilter = "all" | "pending" | "paid" | "completed" | "canceled";

export type AdminOrder = {
  id: string;
  order_nsu: string;
  seller_slug: string;
  seller_name: string;
  customer_name: string;
  customer_cpf: string;
  customer_phone: string;
  customer_email: string;
  postal_code: string;
  street: string;
  address_number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  reference: string | null;
  subtotal_cents: number;
  discount_cents: number;
  shipping_cents: number;
  total_cents: number;
  shipping_id: string;
  shipping_company: string | null;
  shipping_service: string;
  shipping_deadline: string | null;
  shipping_quote_source: string | null;
  shipping_delivery_time: string | null;
  shipping_service_id: string | null;
  coupon_code: string | null;
  payment_status: string;
  fulfillment_status: string;
  payment_url: string | null;
  transaction_nsu: string | null;
  receipt_url: string | null;
  capture_method: string | null;
  paid_amount_cents: number | null;
  created_at: string;
  paid_at: string | null;
};

export type AdminOrderItem = {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price_cents: number;
  total_price_cents: number;
};

export type AdminPaymentEvent = {
  id: string;
  provider: string;
  event_type: string;
  transaction_nsu: string | null;
  created_at: string;
};

const orderColumns = "id,order_nsu,seller_slug,seller_name,customer_name,customer_cpf,customer_phone,customer_email,postal_code,street,address_number,complement,neighborhood,city,state,reference,subtotal_cents,discount_cents,shipping_cents,total_cents,shipping_id,shipping_company,shipping_service,shipping_deadline,shipping_quote_source,shipping_delivery_time,shipping_service_id,coupon_code,payment_status,fulfillment_status,payment_url,transaction_nsu,receipt_url,capture_method,paid_amount_cents,created_at,paid_at";

export async function getAdminDashboard(filter: AdminFilter, search: string) {
  const supabase = getSupabaseServerClient();
  const startOfToday = getStartOfTodayInSaoPaulo();
  const [recentResult, todayResult, paidTodayResult, pendingResult] = await Promise.all([
    supabase.from("orders").select(orderColumns).order("created_at", { ascending: false }).limit(200),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", startOfToday),
    supabase.from("orders").select("total_cents").eq("payment_status", "paid").gte("paid_at", startOfToday),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status", "pending"),
  ]);

  for (const result of [recentResult, todayResult, paidTodayResult, pendingResult]) {
    if (result.error) throw new Error(result.error.message);
  }

  const paidToday = (paidTodayResult.data ?? []) as Array<{ total_cents: number }>;
  const normalizedSearch = normalizeSearch(search);
  const orders = ((recentResult.data ?? []) as AdminOrder[]).filter((order) => {
    const matchesFilter = filter === "all" ||
      (filter === "pending" && order.payment_status === "pending") ||
      (filter === "paid" && order.payment_status === "paid") ||
      (filter === "completed" && order.fulfillment_status === "completed") ||
      (filter === "canceled" && order.fulfillment_status === "canceled");
    if (!matchesFilter) return false;
    if (!normalizedSearch) return true;
    return [order.order_nsu, order.customer_name, order.customer_phone, order.customer_email]
      .some((value) => normalizeSearch(value).includes(normalizedSearch));
  });

  return {
    orders,
    metrics: {
      ordersToday: todayResult.count ?? 0,
      paidToday: paidToday.length,
      paidRevenueTodayCents: paidToday.reduce((sum, order) => sum + order.total_cents, 0),
      pending: pendingResult.count ?? 0,
    },
  };
}

export async function getAdminOrder(id: string) {
  const supabase = getSupabaseServerClient();
  const orderResult = await supabase.from("orders").select(orderColumns).eq("id", id).maybeSingle();
  if (orderResult.error) throw new Error(orderResult.error.message);
  if (!orderResult.data) return null;
  const order = orderResult.data as AdminOrder;
  const [itemsResult, eventsResult] = await Promise.all([
    supabase.from("order_items").select("id,product_id,product_name,quantity,unit_price_cents,total_price_cents").eq("order_id", id).order("id"),
    supabase.from("payment_events").select("id,provider,event_type,transaction_nsu,created_at").or(`order_id.eq.${id},order_nsu.eq.${order.order_nsu}`).order("created_at", { ascending: false }).limit(10),
  ]);
  if (itemsResult.error) throw new Error(itemsResult.error.message);
  if (eventsResult.error) throw new Error(eventsResult.error.message);
  return {
    order,
    items: (itemsResult.data ?? []) as AdminOrderItem[],
    events: (eventsResult.data ?? []) as AdminPaymentEvent[],
  };
}

export async function updateOrderFulfillmentStatus(id: string, status: FulfillmentStatus) {
  const { error } = await getSupabaseServerClient().from("orders").update({ fulfillment_status: status }).eq("id", id);
  if (error) throw new Error(error.message);
}

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}

function getStartOfTodayInSaoPaulo() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}T00:00:00-03:00`;
}
