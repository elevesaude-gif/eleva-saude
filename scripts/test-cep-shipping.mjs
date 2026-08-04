const baseUrl = (process.env.TEST_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const postalCode = "01001000";
const product = { id: "tirzec-4-ampolas", quantity: 1, subtotalCents: 85000 };

const addressResponse = await fetch(`${baseUrl}/api/address/lookup?postalCode=${postalCode}`, { signal: AbortSignal.timeout(15000) });
const addressBody = await addressResponse.json().catch(() => ({}));
console.log("CEP", {
  status: addressResponse.status,
  ok: addressResponse.ok,
  address: addressResponse.ok ? {
    street: addressBody.street,
    neighborhood: addressBody.neighborhood,
    city: addressBody.city,
    state: addressBody.state,
  } : undefined,
  error: addressResponse.ok ? undefined : addressBody.message,
});

const shippingResponse = await fetch(`${baseUrl}/api/shipping/quote`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  signal: AbortSignal.timeout(15000),
  body: JSON.stringify({
    postalCode,
    items: [{ id: product.id, quantity: product.quantity }],
    subtotalCents: product.subtotalCents,
  }),
});
const shippingBody = await shippingResponse.json().catch(() => ({}));
const options = Array.isArray(shippingBody.options) ? shippingBody.options : [];
console.log("Frete", {
  status: shippingResponse.status,
  ok: shippingResponse.ok,
  optionCount: options.length,
  options: options.map((option) => ({
    provider: option.provider,
    service: option.service,
    priceCents: option.priceCents,
    deliveryTime: option.deliveryTime,
  })),
  error: shippingResponse.ok ? undefined : shippingBody.message,
});

if (!addressResponse.ok || !shippingResponse.ok || options.length === 0) process.exitCode = 1;
