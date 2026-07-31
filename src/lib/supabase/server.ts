import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let serverClient: SupabaseClient | undefined;

export function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  console.info(`Supabase URL configurada: ${url ? "sim" : "não"}`);
  console.info(`Service role configurada: ${serviceRoleKey ? "sim" : "não"}`);

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL não está configurada.");
  }
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não está configurada no servidor.");
  }

  serverClient ??= createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  return serverClient;
}
