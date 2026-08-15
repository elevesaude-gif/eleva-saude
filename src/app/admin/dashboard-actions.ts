"use server";
import {revalidatePath} from "next/cache";
import {requireAdminSession} from "@/lib/admin/auth";
import {saveDashboard} from "@/lib/admin/dashboard";
import type {DashboardContent} from "@/lib/dashboard-content";
import {isSafeContentUrl} from "@/lib/guide-content";

export type DashboardActionState={status:"idle"|"success"|"error";message:string};
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export async function saveDashboardAction(_:DashboardActionState,form:FormData):Promise<DashboardActionState>{try{await requireAdminSession();const raw=form.get("content");if(typeof raw!=="string")throw new Error("Conteúdo inválido.");const content=JSON.parse(raw) as DashboardContent;if(!content.settings?.title||!Array.isArray(content.goals)||!Array.isArray(content.products)||!Array.isArray(content.questions)||!Array.isArray(content.sections))throw new Error("Estrutura incompleta.");for(const goal of content.goals)if(!slugPattern.test(goal.slug))throw new Error(`Slug de objetivo inválido: ${goal.slug}`);for(const product of content.products){if(!slugPattern.test(product.slug)||!product.name)throw new Error(`Produto inválido: ${product.name||product.slug}`);if(product.image_url&&!isSafeContentUrl(product.image_url))throw new Error(`Imagem inválida em ${product.name}.`);if(product.buy_url&&!isSafeContentUrl(product.buy_url))throw new Error(`Link de compra inválido em ${product.name}.`);}await saveDashboard(content);revalidatePath("/guia-canetas-emagrecimento");revalidatePath("/admin/content/dashboard");return{status:"success",message:"Dashboard salvo e confirmado no Supabase."};}catch(error){console.error("[dashboard-admin]",error);return{status:"error",message:error instanceof Error?error.message:"Não foi possível salvar."};}}
