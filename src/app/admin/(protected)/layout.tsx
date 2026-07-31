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
          <Link href="/admin" aria-label="Ir para pedidos"><BrandLogo size="small" /></Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-[#344563] sm:inline">Painel operacional</span>
            <form action={logoutAdmin}>
              <button className="rounded-xl border border-[#E6E8ED] bg-[#F7F8FA] px-3 py-2 text-xs font-bold hover:bg-[#C9C6F0]/40">Sair</button>
            </form>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
