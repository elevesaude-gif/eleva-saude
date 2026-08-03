import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSafeContentUrl } from "@/lib/content-validation";
import { connection } from "next/server";
export { isSafeContentUrl } from "@/lib/content-validation";

export const sectionTypes = ["hero","section","highlight","image","list","comparison","faq","cta"] as const;
export type GuideSection = { id?:string; section_type:typeof sectionTypes[number]; sort_order:number; active:boolean; content:Record<string,unknown> };
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
  return Array.isArray(value)&&value.length<=60&&value.every(isGuideSection);
}

const maxText=4000,maxItems=30;
function isText(value:unknown,max=maxText){return value===undefined||(typeof value==="string"&&value.length<=max&&!/[<>]/.test(value));}
function isStringList(value:unknown){return value===undefined||(Array.isArray(value)&&value.length<=maxItems&&value.every(item=>isText(item,500)));}
function isObjectItems(value:unknown){return value===undefined||(Array.isArray(value)&&value.length<=maxItems&&value.every(raw=>{if(!raw||typeof raw!=="object"||Array.isArray(raw))return false;const item=raw as Record<string,unknown>;return Object.keys(item).every(key=>["title","text","description","left","right"].includes(key))&&Object.values(item).every(itemValue=>isText(itemValue,1000));}));}
function isGuideSection(value:unknown):value is GuideSection{
  if(!value||typeof value!=="object"||Array.isArray(value))return false;const section=value as GuideSection;
  if(!sectionTypes.includes(section.section_type)||!Number.isInteger(section.sort_order)||section.sort_order<0||typeof section.active!=="boolean"||!section.content||typeof section.content!=="object"||Array.isArray(section.content))return false;
  const c=section.content;const allowed=new Set(["eyebrow","title","subtitle","body","caption","imageUrl","imageAlt","ctaText","ctaUrl","paragraphs","items"]);
  if(!Object.keys(c).every(key=>allowed.has(key)))return false;
  if(!["eyebrow","title","subtitle","body","caption","imageAlt","ctaText"].every(key=>isText(c[key])))return false;
  if(!isSafeContentUrl(c.imageUrl)||!isSafeContentUrl(c.ctaUrl)||!isStringList(c.paragraphs))return false;
  if(section.section_type==="faq"||section.section_type==="comparison")return isObjectItems(c.items);
  return isStringList(c.items);
}
