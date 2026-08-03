import "server-only";
import { randomUUID } from "node:crypto";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { validateMediaBytes } from "@/lib/media-validation";

const allowed=new Map([["image/jpeg","jpg"],["image/png","png"],["image/webp","webp"]]);
export async function uploadAdminMedia(file:File,folder:"guide"|"products"){
  if(folder!=="guide"&&folder!=="products")throw new Error("Pasta inválida.");
  const extension=allowed.get(file.type);if(!extension)throw new Error("Formato inválido. Use JPG, PNG ou WebP.");
  const bytes=new Uint8Array(await file.arrayBuffer());
  validateMediaBytes(bytes,file.type,file.size);
  const path=`${folder}/${randomUUID()}.${extension}`;
  const supabase=getSupabaseServerClient();
  const {error}=await supabase.storage.from("eleve-media").upload(path,bytes,{contentType:file.type,upsert:false});
  if(error)throw new Error(error.message);
  return supabase.storage.from("eleve-media").getPublicUrl(path).data.publicUrl;
}
