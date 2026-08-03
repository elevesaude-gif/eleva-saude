import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key=process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
assert(url,"NEXT_PUBLIC_SUPABASE_URL não configurada.");
assert(key,"SUPABASE_SERVICE_ROLE_KEY não configurada.");
const supabase=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});

const slug="guia-canetas-emagrecimento";
const {data:page,error:pageError}=await supabase.from("content_pages").select("id,slug,title,description,active,published_at,updated_at").eq("slug",slug).maybeSingle();
if(pageError)throw pageError;
assert(page,`Página ${slug} não encontrada.`);
const {count:sectionCount,error:countError}=await supabase.from("content_sections").select("id",{count:"exact",head:true}).eq("page_id",page.id).eq("active",true);
if(countError)throw countError;
console.log(`Leitura pública: slug=${slug}, active=${page.active}, published=${Boolean(page.published_at)}, secoes=${sectionCount??0}, fonte=${page.active&&page.published_at&&(sectionCount??0)>0?"supabase":"fallback"}.`);
console.log(`Última atualização registrada da página: ${page.updated_at}.`);
const {data:hero,error:heroError}=await supabase.from("content_sections").select("id,content,updated_at").eq("page_id",page.id).eq("section_type","hero").order("sort_order").limit(1).maybeSingle();
if(heroError)throw heroError;
console.log(`Título da página: ${JSON.stringify(page.title)}.`);
console.log(`Título renderizado pelo hero: ${JSON.stringify(hero?.content?.title??null)}.`);
console.log(`Última atualização registrada do hero: ${hero?.updated_at??"não encontrado"}.`);

const requestedId=process.argv[2];
let query=supabase.from("content_sections").select("id,sort_order");
query=requestedId?query.eq("id",requestedId):query.order("sort_order").limit(1);
const {data:rows,error:readError}=await query;
if(readError)throw readError;
assert.equal(rows?.length,1,requestedId?`Seção ${requestedId} não encontrada.`:"Nenhuma seção encontrada.");
const original=rows[0];
const temporarySortOrder=original.sort_order+1000000;
let testCompleted=false;

try{
  const {data:updated,error:updateError}=await supabase.from("content_sections").update({sort_order:temporarySortOrder,updated_at:new Date().toISOString()}).eq("id",original.id).select("id,sort_order").maybeSingle();
  if(updateError)throw updateError;
  assert(updated,"Nenhuma linha foi atualizada.");
  assert.equal(updated.sort_order,temporarySortOrder,"O update não retornou o valor temporário.");
  const {data:confirmed,error:confirmError}=await supabase.from("content_sections").select("id,sort_order").eq("id",original.id).maybeSingle();
  if(confirmError)throw confirmError;
  assert(confirmed,"A seção não foi encontrada após o update.");
  assert.equal(confirmed.sort_order,temporarySortOrder,"O valor temporário não persistiu.");
  testCompleted=true;
}finally{
  const {data:reverted,error:revertError}=await supabase.from("content_sections").update({sort_order:original.sort_order,updated_at:new Date().toISOString()}).eq("id",original.id).select("id,sort_order").maybeSingle();
  if(revertError)throw revertError;
  assert(reverted,"Não foi possível reverter a seção de teste.");
  assert.equal(reverted.sort_order,original.sort_order,"A reversão não restaurou o valor original.");
}

assert(testCompleted,"A verificação de persistência não foi concluída.");
console.log(`Persistência confirmada e valor revertido para a seção ${original.id}.`);
