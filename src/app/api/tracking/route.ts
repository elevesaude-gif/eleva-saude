type UnknownRecord = Record<string, unknown>;

type Movement = {
  status: string;
  description?: string;
  location?: string;
  updatedAt?: string;
};

const CARRIER_LABELS: Record<string, string> = {
  jadlog: "Jadlog · Package Centralizado",
  loggi: "Loggi · Express",
  jt: "J&T · Standard",
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const accessToken = process.env.MELHOR_ENVIO_ACCESS_TOKEN?.trim();

  if (!accessToken) {
    return Response.json({ configured: false });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { configured: true, error: "Informe um código de rastreio válido." },
      { status: 400 },
    );
  }

  const body = isRecord(payload) ? payload : {};
  const trackingCode = typeof body.trackingCode === "string" ? body.trackingCode.trim() : "";
  const carrier = typeof body.carrier === "string" ? body.carrier.trim() : "";

  if (trackingCode.length < 2 || trackingCode.length > 120) {
    return Response.json(
      { configured: true, error: "Informe um código de rastreio válido." },
      { status: 400 },
    );
  }

  const baseUrl = (process.env.MELHOR_ENVIO_BASE_URL || "https://melhorenvio.com.br").replace(/\/$/, "");
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "User-Agent": process.env.MELHOR_ENVIO_USER_AGENT || "eLeve Saúde (contato@elevesaude.site)",
  };

  try {
    const searchResponse = await fetch(
      `${baseUrl}/api/v2/me/orders/search?q=${encodeURIComponent(trackingCode)}`,
      { method: "GET", headers, cache: "no-store" },
    );

    if (!searchResponse.ok) {
      return melhorEnvioError(searchResponse.status);
    }

    const searchPayload: unknown = await searchResponse.json();
    const order = findFirstOrder(searchPayload);

    if (!order) {
      return Response.json({ configured: true, found: false, trackingCode });
    }

    const orderReference = firstText(order, ["id", "protocol"]);
    if (!orderReference) {
      return Response.json({ configured: true, found: false, trackingCode });
    }

    const trackingResponse = await fetch(`${baseUrl}/api/v2/me/shipment/tracking`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({ orders: [orderReference] }),
    });

    if (!trackingResponse.ok) {
      return melhorEnvioError(trackingResponse.status);
    }

    const trackingPayload: unknown = await trackingResponse.json();
    const tracking = findTrackingResult(trackingPayload, orderReference);
    const movements = normalizeMovements(tracking);
    const status = firstText(tracking, ["status", "description", "message"])
      || movements[0]?.status
      || firstText(order, ["status"])
      || "Envio localizado";
    const carrierName = detectCarrier(tracking, order, carrier);
    const updatedAt = firstText(tracking, ["updated_at", "updatedAt", "date"])
      || movements[0]?.updatedAt;

    return Response.json({
      configured: true,
      found: true,
      trackingCode: firstText(tracking, ["tracking", "tracking_code", "trackingCode"])
        || firstText(order, ["tracking", "tracking_code", "protocol"])
        || trackingCode,
      carrier: carrierName,
      status,
      updatedAt,
      movements,
      message: friendlyMessage(status, movements.length),
    });
  } catch (error) {
    console.error("Melhor Envio tracking request failed", error instanceof Error ? error.message : error);
    return Response.json(
      {
        configured: true,
        error: "Não foi possível consultar o rastreio agora. Tente novamente em alguns instantes.",
      },
      { status: 502 },
    );
  }
}

function melhorEnvioError(status: number) {
  console.error(`Melhor Envio tracking returned HTTP ${status}`);
  return Response.json(
    {
      configured: true,
      error: "Não foi possível consultar o rastreio agora. Tente novamente em alguns instantes.",
    },
    { status: 502 },
  );
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstText(record: unknown, keys: string[]): string | undefined {
  if (!isRecord(record)) return undefined;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return undefined;
}

function asRecords(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value)) return [];
  for (const key of ["data", "orders", "results", "items"]) {
    const nested = value[key];
    if (Array.isArray(nested)) return nested.filter(isRecord);
  }
  return [];
}

function findFirstOrder(payload: unknown): UnknownRecord | undefined {
  const records = asRecords(payload);
  if (records.length) return records[0];
  if (isRecord(payload) && firstText(payload, ["id", "protocol"])) return payload;
  return undefined;
}

function findTrackingResult(payload: unknown, orderReference: string): UnknownRecord {
  if (!isRecord(payload)) return {};
  const direct = payload[orderReference];
  if (isRecord(direct)) return direct;
  const records = asRecords(payload);
  if (records.length) return records[0];
  const values = Object.values(payload).filter(isRecord);
  return values[0] || payload;
}

function normalizeMovements(tracking: UnknownRecord): Movement[] {
  const possibleLists = [tracking.tracking, tracking.movements, tracking.events, tracking.history];
  const list = possibleLists.find(Array.isArray);
  if (!Array.isArray(list)) return [];

  return list
    .filter(isRecord)
    .map((item) => {
      const description = firstText(item, ["description", "message", "details"]);
      return {
        status: firstText(item, ["status", "title", "event", "occurrence"]) || description || "Atualização do envio",
        description: description && description !== firstText(item, ["status", "title", "event", "occurrence"])
          ? description
          : undefined,
        location: firstText(item, ["location", "city", "locale", "place"]),
        updatedAt: firstText(item, ["date", "datetime", "created_at", "updated_at", "timestamp"]),
      };
    })
    .reverse();
}

function detectCarrier(tracking: UnknownRecord, order: UnknownRecord, selected: string) {
  const explicit = firstText(tracking, ["carrier", "company", "transport_company"])
    || firstText(order, ["carrier", "company", "transport_company"]);
  if (explicit) return explicit;

  const service = isRecord(order.service) ? order.service : undefined;
  const company = service && isRecord(service.company) ? service.company : undefined;
  const serviceName = firstText(service, ["name"]);
  const companyName = firstText(company, ["name"]);
  if (companyName && serviceName) return `${companyName} · ${serviceName}`;
  if (companyName || serviceName) return companyName || serviceName;
  return CARRIER_LABELS[selected];
}

function friendlyMessage(status: string, movementCount: number) {
  const normalized = status.toLocaleLowerCase("pt-BR");
  if (normalized.includes("entreg")) return "Seu pedido foi entregue. Esperamos que tenha chegado tudo certinho.";
  if (normalized.includes("rota") || normalized.includes("saiu")) return "Seu pedido está a caminho do endereço de entrega.";
  if (normalized.includes("post") || normalized.includes("colet")) return "Seu pedido já está com a transportadora e seguirá pelas próximas etapas.";
  if (movementCount > 0) return "Seu envio está em movimentação. Acompanhe aqui as próximas atualizações.";
  return "Localizamos seu envio. Novas movimentações podem levar algum tempo para aparecer.";
}
