import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GuideSection } from "@/lib/guide-content";

export async function getGuideForAdmin(){
  const supabase=getSupabaseServerClient();
  const {data:page,error}=await supabase.from("content_pages").select("*").eq("slug","guia-canetas-emagrecimento").maybeSingle();
  if(error) throw new Error(error.message);
  if(!page) return null;
  const {data:sections,error:sectionError}=await supabase.from("content_sections").select("id,section_type,sort_order,active,content").eq("page_id",page.id).order("sort_order");
  if(sectionError) throw new Error(sectionError.message);
  return {...page,sections:(sections??[]) as GuideSection[]};
}

export async function saveGuide(input:{title:string;description:string;active:boolean;sections:GuideSection[]}){
  const supabase=getSupabaseServerClient();
  const now=new Date().toISOString();
  const {data:page,error}=await supabase.from("content_pages").upsert({slug:"guia-canetas-emagrecimento",title:input.title,description:input.description,active:input.active,published_at:input.active?now:null,updated_at:now},{onConflict:"slug"}).select("id,updated_at").single();
  if(error) throw new Error(`Falha ao atualizar a página do guia: ${error.message}`);
  if(!page) throw new Error("O Supabase não confirmou a atualização da página do guia.");

  const persistedIds:string[]=[];
  for(const [index,section] of input.sections.entries()){
    const values={page_id:page.id,section_type:section.section_type,sort_order:index,active:section.active,content:section.content,updated_at:now};
    if(section.id){
      const {data,error:sectionError}=await supabase.from("content_sections").update(values).eq("id",section.id).eq("page_id",page.id).select("id").maybeSingle();
      if(sectionError) throw new Error(`Falha ao atualizar a seção ${section.id}: ${sectionError.message}`);
      if(!data) throw new Error(`Nenhuma linha foi atualizada para a seção ${section.id}.`);
      persistedIds.push(data.id);
    }else{
      const {data,error:sectionError}=await supabase.from("content_sections").insert(values).select("id").single();
      if(sectionError) throw new Error(`Falha ao inserir uma seção do guia: ${sectionError.message}`);
      if(!data) throw new Error("O Supabase não confirmou a inserção de uma seção do guia.");
      persistedIds.push(data.id);
    }
  }

  let staleQuery=supabase.from("content_sections").delete().eq("page_id",page.id);
  if(persistedIds.length) staleQuery=staleQuery.not("id","in",`(${persistedIds.join(",")})`);
  const {error:deleteError}=await staleQuery;
  if(deleteError) throw new Error(`Falha ao remover seções antigas do guia: ${deleteError.message}`);

  const {data:confirmed,error:confirmError}=await supabase.from("content_sections").select("id").eq("page_id",page.id);
  if(confirmError) throw new Error(`Falha ao confirmar as seções salvas: ${confirmError.message}`);
  if((confirmed??[]).length!==input.sections.length) throw new Error("O Supabase não confirmou todas as seções do guia.");
  return {pageId:page.id,updatedAt:page.updated_at,sectionCount:confirmed?.length??0};
}
