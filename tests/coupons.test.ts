import assert from "node:assert/strict";
import test from "node:test";

import { validateCoupon, type Coupon } from "../src/lib/coupons.ts";

const commonCoupon: Coupon = { id: "cupom13", code: "CUPOM13", seller: "todos", discountType: "fixo", discountValue: 13, minimumPurchase: 0, maximumUses: 10, currentUses: 0, startsAt: "2025-01-01", expiresAt: "2030-12-31", active: true };
const freeShippingCoupon: Coupon = { id: "teste-frete-5", code: "TESTEFRETE5", seller: "todos", discountType: "frete_gratis", discountValue: 0, minimumPurchase: 0, maximumUses: 1, currentUses: 0, startsAt: "2026-08-22", expiresAt: "2026-08-24", active: true };
const testDate = new Date("2026-08-22T12:00:00-03:00");

test("cupom fixo continua descontando somente os produtos", () => {
  const result = validateCoupon([commonCoupon], commonCoupon.code, "caio", 50, 13.38, testDate);
  assert.equal(result.valid, true);
  if (!result.valid) return;
  assert.equal(result.productDiscount, 13);
  assert.equal(result.shippingDiscount, 0);
  assert.equal(50 - result.productDiscount + 13.38 - result.shippingDiscount, 50.38);
});

test("TESTEFRETE5 zera apenas o frete e mantém produto de R$ 5,00", () => {
  const result = validateCoupon([freeShippingCoupon], freeShippingCoupon.code, "bruno", 5, 13.38, testDate);
  assert.equal(result.valid, true);
  if (!result.valid) return;
  assert.equal(result.productDiscount, 0);
  assert.equal(result.shippingDiscount, 13.38);
  assert.equal(Math.round((5 - result.productDiscount + 13.38 - result.shippingDiscount) * 100), 500);
});

test("TESTEFRETE5 recusa o segundo uso", () => {
  const exhausted = { ...freeShippingCoupon, currentUses: 1 };
  const result = validateCoupon([exhausted], exhausted.code, "isabela", 5, 13.38, testDate);
  assert.equal(result.valid, false);
  if (result.valid) return;
  assert.match(result.message, /limite máximo de usos/i);
});
