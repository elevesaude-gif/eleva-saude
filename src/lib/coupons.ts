import type { SellerSlug } from "@/types/checkout";

export type CouponSeller = SellerSlug | "todos";
export type DiscountType = "percentual" | "fixo";
export type Coupon = { id: string; code: string; seller: CouponSeller; discountType: DiscountType; discountValue: number; minimumPurchase: number; maximumUses: number; currentUses: number; startsAt: string; expiresAt: string; active: boolean };
export type CouponValidation = { valid: true; coupon: Coupon; discount: number; message: string } | { valid: false; message: string };

export const COUPONS_STORAGE_KEY = "eleva-saude:coupons:v1";
export const initialCoupons: Coupon[] = [
  { id: "isabela-10", code: "ISABELA10", seller: "isabela", discountType: "percentual", discountValue: 10, minimumPurchase: 0, maximumUses: 1000, currentUses: 0, startsAt: "2025-01-01", expiresAt: "2030-12-31", active: true },
  { id: "caio-10", code: "CAIO10", seller: "caio", discountType: "percentual", discountValue: 10, minimumPurchase: 0, maximumUses: 1000, currentUses: 0, startsAt: "2025-01-01", expiresAt: "2030-12-31", active: true },
  { id: "bruno-10", code: "BRUNO10", seller: "bruno", discountType: "percentual", discountValue: 10, minimumPurchase: 0, maximumUses: 1000, currentUses: 0, startsAt: "2025-01-01", expiresAt: "2030-12-31", active: true },
];

export function normalizeCouponCode(code: string) { return code.trim().toUpperCase(); }
export function loadCoupons(): Coupon[] {
  if (typeof window === "undefined") return initialCoupons;
  try {
    const stored = window.localStorage.getItem(COUPONS_STORAGE_KEY);
    if (!stored) { saveCoupons(initialCoupons); return [...initialCoupons]; }
    const value: unknown = JSON.parse(stored);
    if (!Array.isArray(value)) return [...initialCoupons];
    const storedCoupons = value.filter(isCoupon);
    const missingInitialCoupons = initialCoupons.filter((initial) => !storedCoupons.some((coupon) => normalizeCouponCode(coupon.code) === initial.code));
    const coupons = [...storedCoupons, ...missingInitialCoupons];
    if (missingInitialCoupons.length) saveCoupons(coupons);
    return coupons;
  } catch { return [...initialCoupons]; }
}
export function saveCoupons(coupons: Coupon[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
    window.dispatchEvent(new CustomEvent("eleva:coupons-updated"));
    return true;
  } catch { return false; }
}

export function validateCoupon(coupons: Coupon[], code: string, seller: SellerSlug, subtotal: number, now = new Date()): CouponValidation {
  const coupon = coupons.find((item) => normalizeCouponCode(item.code) === normalizeCouponCode(code));
  if (!coupon) return { valid: false, message: "Não encontramos esse cupom. Confira o código e tente novamente." };
  if (!coupon.active) return { valid: false, message: "Este cupom está inativo no momento." };
  if (coupon.seller !== "todos" && coupon.seller !== seller) return { valid: false, message: `Este cupom é exclusivo para o atendimento de ${coupon.seller === "isabela" ? "Isabela" : coupon.seller === "caio" ? "Caio" : "Bruno"}.` };
  const today = toLocalDate(now);
  if (today < coupon.startsAt) return { valid: false, message: "Este cupom ainda não está disponível." };
  if (today > coupon.expiresAt) return { valid: false, message: "Este cupom expirou. Solicite outro código ao seu vendedor." };
  if (coupon.maximumUses > 0 && coupon.currentUses >= coupon.maximumUses) return { valid: false, message: "Este cupom atingiu o limite máximo de usos." };
  if (subtotal < coupon.minimumPurchase) return { valid: false, message: `Este cupom é válido para compras a partir de ${formatMoney(coupon.minimumPurchase)}.` };
  const rawDiscount = coupon.discountType === "percentual" ? subtotal * coupon.discountValue / 100 : coupon.discountValue;
  const discount = Math.min(subtotal, Math.max(0, rawDiscount));
  return { valid: true, coupon, discount, message: `Cupom aplicado! Você economizou ${formatMoney(discount)}.` };
}
export function couponDiscountLabel(coupon: Coupon) { return coupon.discountType === "percentual" ? `${coupon.discountValue}%` : formatMoney(coupon.discountValue); }
function toLocalDate(date: Date) { const offset = date.getTimezoneOffset() * 60_000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); }
function formatMoney(value: number) { return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
function isCoupon(value: unknown): value is Coupon {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Coupon>;
  return typeof item.id === "string" && typeof item.code === "string" && ["isabela", "caio", "bruno", "todos"].includes(item.seller ?? "") && ["percentual", "fixo"].includes(item.discountType ?? "") && typeof item.discountValue === "number" && typeof item.minimumPurchase === "number" && typeof item.maximumUses === "number" && typeof item.currentUses === "number" && typeof item.startsAt === "string" && typeof item.expiresAt === "string" && typeof item.active === "boolean";
}
