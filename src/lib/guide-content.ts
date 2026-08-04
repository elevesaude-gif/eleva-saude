import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSafeContentUrl } from "@/lib/content-validation";
import { connection } from "next/server";
export { isSafeContentUrl } from "@/lib/content-validation";

export const sectionTypes = ["hero","section","highlight","image","list","comparison","faq","cta"] as const;
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key:string]:JsonValue };
export type GuideContent = { [key:string]:JsonValue };
export type GuideSection = { id?:string; section_type:typeof sectionTypes[number]; sort_order:number; active:boolean; content:GuideContent };
export type GuidePage = { id:string; slug:string; title:string; description:string|null; active:boolean; published_at:string|null; sections:GuideSection[] };

const guideSlug="guia-canetas-emagrecimento";
const isDevelopment=process.env.NODE_ENV==="development";
function logGuideSource(source:"supabase"|"fallback",sectionCount:number,error?:unknown){
  if(!isDevelopment)return;
  console.info(`[guide-content] fonte=${source} slug=${guideSlug} secoes=${sectionCount}`);
  if(error)console.error("[guide-content] erro completo da consulta:",error);
}

export async function getPublishedGuide(): Promise<GuidePage|null> {
  await connection();
  try {
    const supabase=getSupabaseServerClient();
    const {data:page,error}=await supabase.from("content_pages").select("id,slug,title,description,active,published_at").eq("slug",guideSlug).eq("active",true).not("published_at","is",null).lte("published_at",new Date().toISOString()).maybeSingle();
    if(error){logGuideSource("fallback",0,error);return null;}
    if(!page){logGuideSource("fallback",0,new Error("Página publicada não encontrada."));return null;}
    const {data:sections,error:sectionsError}=await supabase.from("content_sections").select("id,section_type,sort_order,active,content").eq("page_id",page.id).eq("active",true).order("sort_order");
    if(sectionsError){logGuideSource("fallback",0,sectionsError);return null;}
    if(!sections?.length){logGuideSource("fallback",0,new Error("Nenhuma seção ativa encontrada."));return null;}
    logGuideSource("supabase",sections.length);
    return {...page,sections} as GuidePage;
  } catch(error){logGuideSource("fallback",0,error);return null;}
}

export function isGuideSections(value:unknown): value is GuideSection[] {
  return Array.isArray(value)&&value.length>0&&value.length<=60&&value.every(isGuideSection);
}

const maxText=12000,maxItems=100,maxDepth=8;
function isSafeJson(value:unknown,key="",depth=0):value is JsonValue{
  if(depth>maxDepth)return false;
  if(value===null||typeof value==="boolean"||(typeof value==="number"&&Number.isFinite(value)))return true;
  if(typeof value==="string"){
    if(value.length>maxText||/[<>]/.test(value))return false;
    return !/(?:url|href|src)$/i.test(key)||isSafeContentUrl(value);
  }
  if(Array.isArray(value))return value.length<=maxItems&&value.every(item=>isSafeJson(item,key,depth+1));
  if(typeof value!=="object"||!value)return false;
  const entries=Object.entries(value as Record<string,unknown>);
  return entries.length<=100&&entries.every(([childKey,child])=>childKey.length<=100&&isSafeJson(child,childKey,depth+1));
}
function isGuideSection(value:unknown):value is GuideSection{
  if(!value||typeof value!=="object"||Array.isArray(value))return false;const section=value as GuideSection;
  if(!sectionTypes.includes(section.section_type)||!Number.isInteger(section.sort_order)||section.sort_order<0||typeof section.active!=="boolean"||!section.content||typeof section.content!=="object"||Array.isArray(section.content))return false;
  return (!section.id||/^[0-9a-f-]{36}$/i.test(section.id))&&isSafeJson(section.content);
}
