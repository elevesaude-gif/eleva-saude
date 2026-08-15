import { logoutAdmin } from "@/app/admin/actions";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { requireAdminSession } from "@/lib/admin/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminSession();
  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0D1B2A]">
      <header className="border-b border-[#E6E8ED] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/admin" aria-label="Ir para o painel"><BrandLogo size="small" /></Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Administração">
            <Link className="rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#F1F2F5]" href="/admin/overview">Visão geral</Link>
            <Link className="rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#F1F2F5]" href="/admin">Pedidos</Link>
            <Link className="rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#F1F2F5]" href="/admin/content/dashboard">Dashboard</Link>
            <Link className="rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#F1F2F5]" href="/admin/content/guide">Guia legado</Link>
            <Link className="rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#F1F2F5]" href="/admin/products">Produtos</Link>
            <Link className="rounded-lg px-3 py-2 text-xs font-bold hover:bg-[#F1F2F5]" href="/admin/cupons">Cupons</Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-[#344563] sm:inline">Painel operacional</span>
            <form action={logoutAdmin}>
              <button className="rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-3 py-2 text-xs font-bold hover:bg-[#C9C6F0]/40">Sair</button>
            </form>
          </div>
        </div>
      </header>
      <nav className="flex gap-1 overflow-x-auto border-b border-[#E6E8ED] bg-white px-4 py-2 md:hidden" aria-label="Administração">
        <Link className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold" href="/admin/overview">Visão geral</Link><Link className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold" href="/admin">Pedidos</Link><Link className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold" href="/admin/content/dashboard">Dashboard</Link><Link className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold" href="/admin/products">Produtos</Link><Link className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold" href="/admin/cupons">Cupons</Link>
      </nav>
      {children}
    </div>
  );
}
