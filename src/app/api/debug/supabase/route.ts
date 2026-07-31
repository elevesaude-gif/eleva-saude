import { getSupabaseServerClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({
      ok: false,
      error: "not_found",
      message: "Rota disponível apenas em desenvolvimento.",
    }, { status: 404 });
  }

  const supabaseUrlConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  const serviceRoleConfigured = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

  try {
    const { error } = await getSupabaseServerClient().from("orders").select("id").limit(1);
    if (error) {
      return NextResponse.json({
        ok: false,
        error: "supabase_error",
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        supabaseUrlConfigured,
        serviceRoleConfigured,
        ordersAccessible: false,
      }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      supabaseUrlConfigured,
      serviceRoleConfigured,
      ordersAccessible: true,
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: "supabase_error",
      message: error instanceof Error ? error.message : String(error),
      code: undefined,
      details: undefined,
      hint: undefined,
      supabaseUrlConfigured,
      serviceRoleConfigured,
      ordersAccessible: false,
    }, { status: 500 });
  }
}
