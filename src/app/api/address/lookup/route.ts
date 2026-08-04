export const dynamic = "force-dynamic";

type ViaCepResponse = {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
};

export async function GET(request: Request) {
  const postalCode = new URL(request.url).searchParams.get("postalCode")?.replace(/\D/g, "") ?? "";
  if (postalCode.length !== 8) {
    return Response.json({ ok: false, error: "invalid_postal_code", message: "Informe um CEP com 8 dígitos." }, { status: 400 });
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${postalCode}/json/`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    const address: ViaCepResponse | undefined = await response.json().catch(() => undefined);
    if (address?.erro) {
      return Response.json({ ok: false, error: "address_not_found", message: "CEP não encontrado. Preencha o endereço manualmente." }, { status: 404 });
    }
    if (!response.ok || !address?.localidade || !address.uf) throw new Error("invalid_address_response");

    if (process.env.NODE_ENV === "development") console.info("[address_lookup]", { postal_code: `${postalCode.slice(0, 5)}***`, status: response.status });
    return Response.json({
      ok: true,
      street: address.logradouro?.trim() ?? "",
      neighborhood: address.bairro?.trim() ?? "",
      city: address.localidade.trim(),
      state: address.uf.trim().toUpperCase(),
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") console.error("[address_lookup] falha", { name: error instanceof Error ? error.name : "unknown" });
    return Response.json({ ok: false, error: "address_service_unavailable", message: "Não foi possível consultar o CEP. Preencha o endereço manualmente." }, { status: 503 });
  }
}
