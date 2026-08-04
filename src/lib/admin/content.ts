import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { GuideSection } from "@/lib/guide-content";
import preparedGuide from "@/content/guide-cms.json";

const preparedSections=preparedGuide.sections as unknown as GuideSection[];
const stringValue=(value:unknown)=>typeof value==="string"?value:"";

function mergeWithPreparedSections(stored:GuideSection[]){
  const used=new Set<string>();
  return preparedSections.map(prepared=>{
    const key=stringValue(prepared.content.sectionKey);
    const title=stringValue(prepared.content.title);
    const match=stored.find(section=>!used.has(section.id??"")&&(
      (key&&stringValue(section.content.sectionKey)===key)||
      (title&&stringValue(section.content.title)===title)||
      (section.section_type===prepared.section_type&&section.sort_order===prepared.sort_order)
    ));
    if(match?.id)used.add(match.id);
    const alreadyCanonical=Boolean(key&&stringValue(match?.content.sectionKey)===key);
    const content=alreadyCanonical?{...prepared.content,...match?.content}:{...match?.content,...prepared.content};
    return {...prepared,id:match?.id,active:match?.active??prepared.active,content};
  }).sort((a,b)=>a.sort_order-b.sort_order);
}

export async function getGuideForAdmin(){
  const supabase=getSupabaseServerClient();
  const {data:page,error}=await supabase.from("content_pages").select("*").eq("slug","guia-canetas-emagrecimento").maybeSingle();
  if(error) throw new Error(error.message);
  if(!page) return null;
  const {data:sections,error:sectionError}=await supabase.from("content_sections").select("id,section_type,sort_order,active,content").eq("page_id",page.id).order("sort_order");
  if(sectionError) throw new Error(sectionError.message);
  return {...page,sections:mergeWithPreparedSections((sections??[]) as GuideSection[])};
}

export async function saveGuide(input:{title:string;description:string;active:boolean;sections:GuideSection[]}){
  const supabase=getSupabaseServerClient();
  const now=new Date().toISOString();
  const {data:page,error}=await supabase.from("content_pages").upsert({slug:"guia-canetas-emagrecimento",title:input.title,description:input.description,active:input.active,published_at:input.active?now:null,updated_at:now},{onConflict:"slug"}).select("id,updated_at").single();
  if(error) throw new Error(`Falha ao atualizar a página do guia: ${error.message}`);
  if(!page) throw new Error("O Supabase não confirmou a atualização da página do guia.");

  const persistedIds:string[]=[];
  for(const [index,section] of input.sections.entries()){
    const sortOrder=index*10;
    if(section.id){
      const {data:existing,error:readError}=await supabase.from("content_sections").select("content").eq("id",section.id).eq("page_id",page.id).maybeSingle();
      if(readError)throw new Error(`Falha ao ler a seção ${section.id}: ${readError.message}`);
      if(!existing)throw new Error(`A seção ${section.id} não existe nesta página; recarregue o editor.`);
      const values={page_id:page.id,section_type:section.section_type,sort_order:sortOrder,active:section.active,content:{...(existing.content??{}),...section.content},updated_at:now};
      const {data,error:sectionError}=await supabase.from("content_sections").update(values).eq("id",section.id).eq("page_id",page.id).select("id").maybeSingle();
      if(sectionError) throw new Error(`Falha ao atualizar a seção ${section.id}: ${sectionError.message}`);
      if(!data) throw new Error(`Nenhuma linha foi atualizada para a seção ${section.id}.`);
      persistedIds.push(data.id);
    }else{
      const values={page_id:page.id,section_type:section.section_type,sort_order:sortOrder,active:section.active,content:section.content,updated_at:now};
      const {data,error:sectionError}=await supabase.from("content_sections").insert(values).select("id").single();
      if(sectionError) throw new Error(`Falha ao inserir uma seção do guia: ${sectionError.message}`);
      if(!data) throw new Error("O Supabase não confirmou a inserção de uma seção do guia.");
      persistedIds.push(data.id);
    }
  }

  const {data:confirmed,error:confirmError}=await supabase.from("content_sections").select("id").eq("page_id",page.id).in("id",persistedIds);
  if(confirmError) throw new Error(`Falha ao confirmar as seções salvas: ${confirmError.message}`);
  if((confirmed??[]).length!==persistedIds.length) throw new Error("O Supabase não confirmou todas as seções do guia.");
  return {pageId:page.id,updatedAt:page.updated_at,sectionCount:persistedIds.length};
}
