import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim(),key=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
assert(url,"NEXT_PUBLIC_SUPABASE_URL não configurada.");assert(key,"SUPABASE_SERVICE_ROLE_KEY não configurada.");
const supabase=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
const suffix=`${Date.now()}-${randomUUID().slice(0,8)}`,id=`cms-test-${suffix}`,now=new Date().toISOString();
let productCreated=false;
try{
  const original={id,slug:id,name:"Produto teste CMS",description:"Produto temporário e inativo.",category:"Shopping",price_cents:100,image_url:null,image_alt:"",requires_shipping:false,weight_grams:0,height_cm:0,width_cm:0,length_cm:0,insured_value_cents:100,stock:0,sort_order:999999,featured:false,active:false,deleted_at:null,updated_at:now};
  const {data:created,error:createError}=await supabase.from("products").insert(original).select("*").maybeSingle();if(createError)throw createError;assert(created);productCreated=true;
  const {data:read,error:readError}=await supabase.from("products").select("*").eq("id",id).maybeSingle();if(readError)throw readError;assert.equal(read?.name,original.name);
  const changed={name:"Produto teste CMS alterado",description:"Persistência confirmada.",price_cents:200,updated_at:new Date().toISOString()};
  const {data:updated,error:updateError}=await supabase.from("products").update(changed).eq("id",id).select("*").maybeSingle();if(updateError)throw updateError;assert(updated);assert.equal(updated.price_cents,200);
  const archivedAt=new Date().toISOString();const {data:archived,error:archiveError}=await supabase.from("products").update({active:false,deleted_at:archivedAt,updated_at:archivedAt}).eq("id",id).select("active,deleted_at").maybeSingle();if(archiveError)throw archiveError;assert.equal(archived?.active,false);assert(archived?.deleted_at);
  console.log(`Produto temporário: criar/ler/editar/arquivar aprovado (${id}).`);

  const {data:section,error:sectionError}=await supabase.from("content_sections").select("id,content,updated_at").order("sort_order").limit(1).maybeSingle();if(sectionError)throw sectionError;assert(section,"Nenhuma seção do guia encontrada.");
  const originalContent=section.content,marker=`cms-roundtrip-${suffix}`,temporary={...originalContent,__cms_roundtrip_test:marker};let restored=false;
  try{const {data:changedSection,error}=await supabase.from("content_sections").update({content:temporary,updated_at:new Date().toISOString()}).eq("id",section.id).select("content").maybeSingle();if(error)throw error;assert.equal(changedSection?.content?.__cms_roundtrip_test,marker);const {data:confirmed,error:confirmError}=await supabase.from("content_sections").select("content").eq("id",section.id).maybeSingle();if(confirmError)throw confirmError;assert.equal(confirmed?.content?.__cms_roundtrip_test,marker);}
  finally{const {data:reverted,error}=await supabase.from("content_sections").update({content:originalContent,updated_at:section.updated_at}).eq("id",section.id).select("content").maybeSingle();if(error)throw error;assert.deepEqual(reverted?.content,originalContent);restored=true;}
  assert(restored);console.log(`Guia: atualizar/ler/restaurar aprovado (seção ${section.id}).`);
}finally{
  if(productCreated){const {count,error:referenceError}=await supabase.from("order_items").select("id",{count:"exact",head:true}).eq("product_id",id);if(referenceError)throw referenceError;if(count===0){const {error}=await supabase.from("products").delete().eq("id",id).eq("active",false);if(error)throw error;console.log("Produto temporário sem pedidos removido.");}else console.log("Produto temporário preservado arquivado porque possui order_items.");}
}
