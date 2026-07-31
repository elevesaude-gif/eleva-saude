import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import type { SellerSlug } from "@/types/checkout";

const validSellers: SellerSlug[] = ["isabela", "caio"];

export function generateStaticParams() {
  return validSellers.map((seller) => ({ seller }));
}

export default async function SellerPage({ params }: { params: Promise<{ seller: string }> }) {
  const { seller } = await params;

  if (!validSellers.includes(seller as SellerSlug)) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-5">
        <section className="w-full max-w-md rounded-[30px] border border-[#E6E8ED] bg-white p-8 text-center shadow-[0_20px_60px_rgba(13,27,42,.09)]">
          <BrandLogo className="mx-auto" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-[#344563]">Atendimento personalizado</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#0D1B2A]">Vendedor não encontrado</h1>
          <p className="mt-3 text-sm leading-6 text-[#344563]">Este link de atendimento não está disponível. Você pode continuar com uma de nossas pessoas especialistas.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/isabela" className="rounded-xl bg-[#0D1B2A] px-4 py-3 text-sm font-bold text-white hover:bg-[#344563]">Isabela</Link>
            <Link href="/caio" className="rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-4 py-3 text-sm font-bold text-[#0D1B2A] hover:bg-[#C9C6F0]">Caio</Link>
          </div>
        </section>
      </main>
    );
  }

  return <CheckoutPage seller={seller as SellerSlug} />;
}
