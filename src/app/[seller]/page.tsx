import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { listPublicProductsWithFallback } from "@/lib/products";
import { isSellerSlug, sellerSlugs } from "@/lib/sellers";

export function generateStaticParams() {
  return sellerSlugs.map((seller) => ({ seller }));
}

export default async function SellerPage({
  params,
  searchParams,
}: {
  params: Promise<{ seller: string }>;
  searchParams: Promise<{ teste?: string | string[]; token?: string | string[] }>;
}) {
  const { seller } = await params;
  const query = await searchParams;
  const testProductToken = process.env.TEST_PRODUCT_TOKEN;
  const testMode = Boolean(testProductToken) && query.teste === "1" && query.token === testProductToken;

  if (!isSellerSlug(seller)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5">
        <section className="w-full max-w-md rounded-[30px] border border-[#E6E8ED] bg-white p-8 text-center shadow-[0_20px_60px_rgba(13,27,42,.09)]">
          <BrandLogo className="mx-auto" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-[#344563]">Atendimento personalizado</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#0D1B2A]">Vendedor não encontrado</h1>
          <p className="mt-3 text-sm leading-6 text-[#344563]">Este link de atendimento não está disponível. Você pode continuar com uma de nossas pessoas especialistas.</p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <Link href="/isabela" className="rounded-xl bg-[#0D1B2A] px-4 py-3 text-sm font-bold text-white hover:bg-[#344563]">Isabela</Link>
            <Link href="/caio" className="rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#0D1B2A] hover:bg-[#C9C6F0]">Caio</Link>
            <Link href="/bruno" className="rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#0D1B2A] hover:bg-[#C9C6F0]">Bruno</Link>
          </div>
        </section>
      </main>
    );
  }

  const catalog = await listPublicProductsWithFallback();
  return <CheckoutPage key={testMode ? "test" : "normal"} products={catalog} seller={seller} testMode={testMode} testToken={testMode && typeof query.token === "string" ? query.token : undefined} />;
}
