import { BrandLogo } from "@/components/brand/BrandLogo";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-[#F7F8FA] px-4 py-10 text-[#0D1B2A]">
      <section className="w-full max-w-md rounded-[30px] border border-[#E6E8ED] bg-white p-7 shadow-[0_22px_70px_rgba(13,27,42,.1)] sm:p-9">
        <BrandLogo className="mx-auto" />
        <div className="mt-6 text-center">
          <p className="text-[10px] font-extrabold uppercase tracking-[.18em] text-[#344563]">Acesso restrito</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold tracking-[-.03em]">Painel operacional</h1>
          <p className="mt-2 text-sm leading-6 text-[#344563]">Entre para acompanhar pedidos e atualizar o andamento das entregas.</p>
        </div>
        <LoginForm />
      </section>
    </main>
  );
}
