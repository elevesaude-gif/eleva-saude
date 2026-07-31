"use server";

import { clearAdminSession, requireAdminSession, setAdminSession, verifyAdminPassword } from "@/lib/admin/auth";
import { fulfillmentStatuses, updateOrderFulfillmentStatus } from "@/lib/admin/orders";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type LoginState = { error: string };

export async function loginAdmin(_: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get("password");
  if (typeof password !== "string" || !verifyAdminPassword(password)) {
    return { error: "Senha inválida." };
  }
  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function updateFulfillmentStatus(formData: FormData) {
  await requireAdminSession();
  const id = formData.get("orderId");
  const status = formData.get("status");
  if (typeof id !== "string" || !id || typeof status !== "string" || !fulfillmentStatuses.includes(status as typeof fulfillmentStatuses[number])) {
    throw new Error("Status operacional inválido.");
  }
  await updateOrderFulfillmentStatus(id, status as typeof fulfillmentStatuses[number]);
  revalidatePath("/admin");
  revalidatePath(`/admin/orders/${id}`);
}
