"use client";

import { loginAdmin, type LoginState } from "@/app/admin/actions";
import { useActionState } from "react";

const initialState: LoginState = { error: "" };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);
  return (
    <form action={action} className="mt-7 space-y-4">
      <div>
        <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-[#344563]">Senha administrativa</label>
        <input id="password" name="password" type="password" required autoComplete="current-password" className="w-full rounded-2xl border border-[#E6E8ED] bg-[#F7F8FA] px-4 py-3.5 text-sm outline-none transition focus:border-[#0D1B2A] focus:bg-white" />
      </div>
      {state.error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-2xl bg-[#0D1B2A] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#344563] disabled:opacity-60">
        {pending ? "Entrando..." : "Entrar no painel"}
      </button>
    </form>
  );
}
