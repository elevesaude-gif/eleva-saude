import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductRecord } from "@/lib/products";

export async function listAdminProducts(){const {data,error}=await getSupabaseServerClient().from("products").select("*").order("sort_order");if(error)throw new Error(error.message);return data as ProductRecord[];}
export async function getAdminProduct(id:string){const {data,error}=await getSupabaseServerClient().from("products").select("*").eq("id",id).maybeSingle();if(error)throw new Error(error.message);return data as ProductRecord|null;}
export async function saveProduct(product:Omit<ProductRecord,"deleted_at"> & {deleted_at?:string|null}){
  const {data,error}=await getSupabaseServerClient().from("products").upsert({...product,updated_at:new Date().toISOString()},{onConflict:"id"}).select("*").maybeSingle();
  if(error)throw new Error(`Falha ao salvar o produto: ${error.message}`);
  if(!data)throw new Error("O Supabase não confirmou nenhuma linha salva.");
  return data as ProductRecord;
}
export async function archiveProduct(id:string){const supabase=getSupabaseServerClient();const {count,error:referenceError}=await supabase.from("order_items").select("id",{count:"exact",head:true}).eq("product_id",id);if(referenceError)throw new Error(referenceError.message);const {data,error}=await supabase.from("products").update({active:false,deleted_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",id).select("id,active,deleted_at").maybeSingle();if(error)throw new Error(`Falha ao arquivar o produto: ${error.message}`);if(!data)throw new Error("Nenhum produto foi arquivado; confira o ID.");return {referenced:(count??0)>0,product:data};}
export async function restoreProduct(id:string){const {data,error}=await getSupabaseServerClient().from("products").update({active:false,deleted_at:null,updated_at:new Date().toISOString()}).eq("id",id).select("id,active,deleted_at").maybeSingle();if(error)throw new Error(`Falha ao restaurar o produto: ${error.message}`);if(!data)throw new Error("Nenhum produto foi restaurado; confira o ID.");return data;}
