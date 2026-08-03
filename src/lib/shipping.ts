import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { digitalShippingOption, internalTestProduct, internalTestShippingOption } from "@/lib/mock-data";
import { listPublicProductsWithFallback } from "@/lib/products";
import type { Product, ShippingOption } from "@/types/checkout";

export type ShippingItemInput = { id: string; quantity: number };
type QuoteContext = { postalCode: string; items: ShippingItemInput[]; subtotalCents: number };

type MelhorEnvioQuote = {
  id?: number | string;
  name?: string;
  price?: string;
  custom_price?: string;
  delivery_time?: number;
  custom_delivery_time?: number;
  error?: string;
  company?: { name?: string };
};

const supportedServices = [
  { id: "27", provider: "Jadlog", service: "Package Centralizado" },
  { id: "31", provider: "Loggi", service: "Express" },
  { id: "33", provider: "J&T", service: "Standard" },
] as const;

export async function resolveShippingProducts(items: ShippingItemInput[], allowTestProduct = false, authoritativeProducts?: Product[]) {
  const publicProducts = authoritativeProducts ?? await listPublicProductsWithFallback();
  const catalog = allowTestProduct && !authoritativeProducts ? [...publicProducts, internalTestProduct] : publicProducts;
  return items.map((item) => {
    const product = catalog.find((candidate) => candidate.id === item.id);
    if (!product || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      throw new Error("invalid_shipping_items");
    }
    return { product, quantity: item.quantity };
  });
}

export async function getShippingQuotes(input: {
  postalCode: string;
  items: ShippingItemInput[];
  subtotalCents: number;
  allowTestProduct?: boolean;
  authoritativeProducts?: Product[];
}): Promise<ShippingOption[]> {
  const postalCode = input.postalCode.replace(/\D/g, "");
  if (postalCode.length !== 8) throw new Error("invalid_postal_code");
  const lines = await resolveShippingProducts(input.items, input.allowTestProduct, input.authoritativeProducts);
  const canonicalSubtotal = lines.reduce((sum, { product, quantity }) => sum + getProductPriceCents(product) * quantity, 0);
  if (canonicalSubtotal !== input.subtotalCents) throw new Error("invalid_subtotal");

  const shippableLines = lines.filter(({ product }) => product.requiresShipping);
  if (!shippableLines.length) {
    return lines.some(({ product }) => product.id === internalTestProduct.id) ? [internalTestShippingOption] : [digitalShippingOption];
  }

  const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
  const userAgent = process.env.MELHOR_ENVIO_USER_AGENT?.trim();
  const allowedServices = getAllowedServices();
  if (!token || !userAgent) {
    logQuote({ postalCode, itemCount: shippableLines.length, quoteSource: "unavailable", optionCount: 0 });
    return [];
  }

  const endpoint = process.env.MELHOR_ENVIO_ENV === "production"
    ? "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate"
    : "https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": userAgent,
      },
      body: JSON.stringify({
        services: allowedServices.join(","),
        from: { postal_code: (process.env.MELHOR_ENVIO_FROM_POSTAL_CODE || "05388090").replace(/\D/g, "") },
        to: { postal_code: postalCode },
        products: shippableLines.map(({ product, quantity }) => ({
          id: product.id,
          width: product.widthCm,
          height: product.heightCm,
          length: product.lengthCm,
          weight: product.weightGrams / 1000,
          insurance_value: getProductPriceCents(product) / 100,
          quantity,
        })),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    const body: unknown = await response.json().catch(() => undefined);
    const options = response.ok && Array.isArray(body)
      ? body.flatMap(normalizeQuote)
        .filter((option) => allowedServices.includes(option.id))
        .sort((left, right) => allowedServices.indexOf(left.id) - allowedServices.indexOf(right.id))
        .slice(0, 3)
      : [];
    logQuote({ postalCode, itemCount: shippableLines.length, quoteSource: options.length ? "melhor_envio" : "unavailable", optionCount: options.length, httpStatus: response.status });
    return options;
  } catch {
    logQuote({ postalCode, itemCount: shippableLines.length, quoteSource: "unavailable", optionCount: 0 });
    return [];
  }
}

export function sealShippingQuotes(options: ShippingOption[], context: QuoteContext) {
  const secret = process.env.MELHOR_ENVIO_TOKEN?.trim();
  if (!secret) return options;
  return options.map((option) => option.source === "melhor_envio" ? { ...option, quoteToken: signQuote(option, context, secret) } : option);
}

export function verifySealedShippingQuote(token: string | undefined, context: QuoteContext): ShippingOption | undefined {
  const secret = process.env.MELHOR_ENVIO_TOKEN?.trim();
  if (!secret || !token) return undefined;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return undefined;
  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return undefined;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as { option: ShippingOption; context: QuoteContext; expiresAt: number };
    if (payload.expiresAt < Date.now() || JSON.stringify(payload.context) !== JSON.stringify(normalizeContext(context))) return undefined;
    return payload.option?.source === "melhor_envio" ? payload.option : undefined;
  } catch {
    return undefined;
  }
}

function signQuote(option: ShippingOption, context: QuoteContext, secret: string) {
  const encoded = Buffer.from(JSON.stringify({ option, context: normalizeContext(context), expiresAt: Date.now() + 15 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

function normalizeContext(context: QuoteContext): QuoteContext {
  return {
    postalCode: context.postalCode.replace(/\D/g, ""),
    items: context.items.map((item) => ({ id: item.id, quantity: item.quantity })),
    subtotalCents: context.subtotalCents,
  };
}

function normalizeQuote(value: unknown): ShippingOption[] {
  if (!value || typeof value !== "object") return [];
  const quote = value as MelhorEnvioQuote;
  if (quote.error || quote.id === undefined || !quote.name) return [];
  const service = supportedServices.find((candidate) => candidate.id === String(quote.id));
  if (!service) return [];
  const price = Number(quote.custom_price ?? quote.price);
  if (!Number.isFinite(price) || price < 0) return [];
  const days = quote.custom_delivery_time ?? quote.delivery_time;
  return [{
    id: String(quote.id),
    provider: service.provider,
    service: service.service,
    priceCents: Math.round(price * 100),
    deliveryTime: Number.isFinite(days) ? `${days} ${days === 1 ? "dia útil" : "dias úteis"}` : "Prazo a confirmar",
    source: "melhor_envio",
  }];
}

function getAllowedServices(): string[] {
  const configured = (process.env.MELHOR_ENVIO_ALLOWED_SERVICES || "27,31,33")
    .split(",")
    .map((id) => id.trim());
  return supportedServices.map((service) => service.id).filter((id) => configured.includes(id));
}

function getProductPriceCents(product: Product) {
  return product.priceCents ?? Math.round(product.price * 100);
}

function logQuote(input: { postalCode: string; itemCount: number; quoteSource: string; optionCount: number; httpStatus?: number }) {
  console.info("[shipping_quote]", {
    postal_code: `${input.postalCode.slice(0, 5)}***`,
    item_count: input.itemCount,
    quote_source: input.quoteSource,
    option_count: input.optionCount,
    ...(input.httpStatus === undefined ? {} : { melhor_envio_http_status: input.httpStatus }),
  });
}
