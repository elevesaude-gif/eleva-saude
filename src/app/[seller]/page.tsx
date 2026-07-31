import Link from "next/link";
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
      <main className="grid min-h-screen place-items-center bg-[#F7FAF8] px-5">
        <section className="w-full max-w-md rounded-[28px] border border-[#dfe8e3] bg-white p-8 text-center shadow-[0_20px_60px_rgba(31,41,51,.08)]">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#EAF5EF] font-serif text-3xl font-bold text-[#2F7D5C]">E</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-[#D19A35]">Eleva Saúde</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-[#1F2933]">Vendedor não encontrado</h1>
          <p className="mt-3 text-sm leading-6 text-[#69756f]">Este link de atendimento não está disponível. Você pode continuar com uma de nossas pessoas especialistas.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/isabela" className="rounded-xl bg-[#2F7D5C] px-4 py-3 text-sm font-bold text-white">Isabela</Link>
            <Link href="/caio" className="rounded-xl border border-[#2F7D5C] px-4 py-3 text-sm font-bold text-[#2F7D5C]">Caio</Link>
          </div>
        </section>
      </main>
    );
  }

  return <CheckoutPage seller={seller as SellerSlug} />;
}
