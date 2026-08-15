import "server-only";
import { products as fallbackProducts } from "@/lib/mock-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types/checkout";
import { InvalidProductSelectionError,validateAuthoritativeSelection } from "@/lib/product-validation";
import { connection } from "next/server";

export type ProductRecord = { id:string; slug:string; name:string; description:string; category:string; price_cents:number; image_url:string|null; image_alt:string; requires_shipping:boolean; weight_grams:number; height_cm:number; width_cm:number; length_cm:number; insured_value_cents:number; stock:number|null; sort_order:number; featured:boolean; active:boolean; deleted_at:string|null; created_at?:string; updated_at?:string };

export function toCheckoutProduct(row: ProductRecord): Product {
  return { id:row.id, slug:row.slug, name:row.name, description:row.description, category:row.category as Product["category"], price:row.price_cents/100, priceCents:row.price_cents, image:row.image_url ?? undefined, imageAlt:row.image_alt, icon:row.name.slice(0,2).toUpperCase(), accent:"#F7F8FA", requiresShipping:row.requires_shipping, weightGrams:row.weight_grams, heightCm:Number(row.height_cm), widthCm:Number(row.width_cm), lengthCm:Number(row.length_cm), insuredValueCents:row.insured_value_cents };
}

export async function listPublicProductsWithFallback(): Promise<Product[]> {
  await connection();
  try {
    const { data,error }=await getSupabaseServerClient().from("products").select("*").eq("active",true).is("deleted_at",null).order("sort_order");
    if(error) {
      if(isMissingProductsTable(error)){logCatalog("fallback",fallbackProducts.length,error);return fallbackProducts;}
      throw error;
    }
    const products=(data as ProductRecord[]).map(toCheckoutProduct);
    logCatalog("supabase",products.length);
    return products;
  } catch(error) {
    console.error("[products] falha na consulta pública ao Supabase:",safeError(error));
    throw new Error("Não foi possível carregar o catálogo oficial.",{cause:error});
  }
}

function isMissingProductsTable(error:unknown){if(!error||typeof error!=="object")return false;const value=error as {code?:unknown;message?:unknown};return value.code==="42P01"||value.code==="PGRST205"||(typeof value.message==="string"&&/relation .*products.* does not exist/i.test(value.message));}
function safeError(error:unknown){if(error instanceof Error)return {name:error.name,message:error.message,cause:error.cause};if(error&&typeof error==="object"){const value=error as Record<string,unknown>;return {code:value.code,message:value.message,details:value.details,hint:value.hint};}return error;}
function logCatalog(source:"supabase"|"fallback",count:number,error?:unknown){if(process.env.NODE_ENV!=="development")return;console.info(`[products] fonte=${source} quantidade=${count}`);if(error)console.error("[products] fallback usado porque a tabela não existe:",safeError(error));}

export class ProductValidationUnavailableError extends Error {}
export { InvalidProductSelectionError as InvalidAuthoritativeProductError };

export async function getAuthoritativeProductsByIds(items:Array<{productId:string;quantity:number}>):Promise<Product[]> {
  const ids=items.map(item=>item.productId);
  let data:unknown,error:unknown;
  try{const result=await getSupabaseServerClient().from("products").select("*").in("id",ids);data=result.data;error=result.error;}catch(cause){throw new ProductValidationUnavailableError("Falha ao consultar produtos.",{cause});}
  if(error) throw new ProductValidationUnavailableError("Falha ao consultar produtos.",{cause:error});
  const rows=(data??[]) as ProductRecord[];
  return validateAuthoritativeSelection(items,rows).map(toCheckoutProduct);
}
