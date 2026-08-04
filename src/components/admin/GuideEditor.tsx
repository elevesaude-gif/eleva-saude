"use client";

import { saveGuideAction, type SaveGuideState } from "@/app/admin/cms-actions";
import { MediaUpload } from "@/components/admin/MediaUpload";
import type { GuideContent, GuideSection, JsonValue } from "@/lib/guide-content";
import { useActionState, useMemo, useState } from "react";

const initialState:SaveGuideState={status:"idle",message:""};
const inputClass="mt-1 w-full rounded-xl border border-[#D1D5DB] p-3";
const emptyItem={title:"",description:"",imageUrl:"",imageAlt:""};
const asString=(value:JsonValue|undefined)=>typeof value==="string"?value:"";
const asArray=<T,>(value:JsonValue|undefined)=>Array.isArray(value)?value as T[]:[];
const asObject=(value:JsonValue|undefined)=>value&&typeof value==="object"&&!Array.isArray(value)?value as GuideContent:{};

function move<T>(items:T[],index:number,direction:-1|1){const target=index+direction;if(target<0||target>=items.length)return items;const next=[...items];[next[index],next[target]]=[next[target],next[index]];return next;}
function Field({label,value,onChange,multiline=false}:{label:string;value:string;onChange:(value:string)=>void;multiline?:boolean}){return <label className="block text-sm font-semibold">{label}{multiline?<textarea className={`${inputClass} min-h-24 font-normal`} value={value} onChange={event=>onChange(event.target.value)}/>:<input className={`${inputClass} font-normal`} value={value} onChange={event=>onChange(event.target.value)}/>}</label>}
function ItemControls({index,count,onMove,onRemove}:{index:number;count:number;onMove:(direction:-1|1)=>void;onRemove:()=>void}){return <div className="flex gap-2"><button type="button" disabled={index===0} onClick={()=>onMove(-1)} className="rounded-lg border px-3 py-1 disabled:opacity-30" aria-label="Mover para cima">↑</button><button type="button" disabled={index===count-1} onClick={()=>onMove(1)} className="rounded-lg border px-3 py-1 disabled:opacity-30" aria-label="Mover para baixo">↓</button><button type="button" onClick={()=>window.confirm("Remover este item?")&&onRemove()} className="rounded-lg border border-red-200 px-3 py-1 text-red-700">Remover</button></div>}

function StringList({title,items,onChange}:{title:string;items:string[];onChange:(items:string[])=>void}){return <fieldset className="space-y-3 rounded-xl border p-4"><legend className="px-2 font-bold">{title}</legend>{items.map((item,index)=><div className="flex flex-col gap-2 rounded-xl bg-[#F8FAFC] p-3 sm:flex-row" key={index}><input className="min-w-0 flex-1 rounded-lg border p-2" value={item} onChange={event=>onChange(items.map((value,i)=>i===index?event.target.value:value))}/><ItemControls index={index} count={items.length} onMove={direction=>onChange(move(items,index,direction))} onRemove={()=>onChange(items.filter((_,i)=>i!==index))}/></div>)}<button type="button" onClick={()=>onChange([...items,""])} className="rounded-lg border border-[#047857] px-3 py-2 font-semibold text-[#047857]">Adicionar item</button></fieldset>}

function ObjectList({title,items,onChange,kind}:{title:string;items:GuideContent[];onChange:(items:GuideContent[])=>void;kind:"cards"|"faq"|"ctas"|"comparison"}){
  const update=(index:number,key:string,value:JsonValue)=>onChange(items.map((item,i)=>i===index?{...item,[key]:value}:item));
  return <fieldset className="space-y-4 rounded-xl border p-4"><legend className="px-2 font-bold">{title}</legend>{items.map((item,index)=><div className="space-y-3 rounded-xl bg-[#F8FAFC] p-4" key={index}>
    {kind==="faq"?<><Field label="Pergunta" value={asString(item.question)} onChange={value=>update(index,"question",value)}/><Field label="Resposta" value={asString(item.answer)} multiline onChange={value=>update(index,"answer",value)}/></>:null}
    {kind==="ctas"?<><Field label="Texto do botão" value={asString(item.text)} onChange={value=>update(index,"text",value)}/><Field label="URL" value={asString(item.url)} onChange={value=>update(index,"url",value)}/></>:null}
    {kind==="cards"||kind==="comparison"?<><Field label="Título" value={asString(item.title)} onChange={value=>update(index,"title",value)}/><Field label="Eyebrow" value={asString(item.eyebrow)} onChange={value=>update(index,"eyebrow",value)}/><Field label="Descrição" value={asString(item.description)} multiline onChange={value=>update(index,"description",value)}/><div className="grid gap-3 sm:grid-cols-2"><Field label="Imagem" value={asString(item.imageUrl)} onChange={value=>update(index,"imageUrl",value)}/><Field label="Texto alternativo" value={asString(item.imageAlt)} onChange={value=>update(index,"imageAlt",value)}/></div></>:null}
    <ItemControls index={index} count={items.length} onMove={direction=>onChange(move(items,index,direction))} onRemove={()=>onChange(items.filter((_,i)=>i!==index))}/>
  </div>)}<button type="button" onClick={()=>onChange([...items,kind==="faq"?{question:"",answer:""}:kind==="ctas"?{text:"",url:"",style:"primary"}:{...emptyItem}])} className="rounded-lg border border-[#047857] px-3 py-2 font-semibold text-[#047857]">Adicionar item</button></fieldset>;
}

function SectionCard({section,index,count,onChange,onMove,onRemove}:{section:GuideSection;index:number;count:number;onChange:(section:GuideSection)=>void;onMove:(direction:-1|1)=>void;onRemove:()=>void}){
  const content=section.content;
  const set=(key:string,value:JsonValue)=>onChange({...section,content:{...content,[key]:value}});
  const image=asObject(content.image);
  const lists=asArray<GuideContent>(content.lists);
  const comparison=asObject(content.comparison);
  return <article className="space-y-5 rounded-[20px] border border-[#DDE5E1] bg-white p-5 shadow-sm">
    <div className="flex flex-col justify-between gap-3 sm:flex-row"><div><p className="text-xs font-bold uppercase tracking-widest text-[#047857]">Seção {index+1} · {section.section_type}</p><p className="mt-1 font-bold">{asString(content.title)||"Sem título"}</p></div><ItemControls index={index} count={count} onMove={onMove} onRemove={onRemove}/></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Eyebrow" value={asString(content.eyebrow)} onChange={value=>set("eyebrow",value)}/><Field label="Título" value={asString(content.title)} onChange={value=>set("title",value)}/><Field label="Subtítulo" value={asString(content.subtitle)} onChange={value=>set("subtitle",value)}/><Field label="Texto em destaque" value={asString(content.highlight)} onChange={value=>set("highlight",value)}/></div>
    <Field label="Corpo" value={asString(content.body)} multiline onChange={value=>set("body",value)}/>
    <StringList title="Parágrafos" items={asArray<string>(content.paragraphs)} onChange={items=>set("paragraphs",items)}/>
    {content.cards!==undefined?<ObjectList title="Cards" kind="cards" items={asArray<GuideContent>(content.cards)} onChange={items=>set("cards",items)}/>:null}
    {content.checklist!==undefined?<StringList title="Checklist" items={asArray<string>(content.checklist)} onChange={items=>set("checklist",items)}/>:null}
    {lists.map((list,listIndex)=><StringList key={listIndex} title={asString(list.title)||`Lista ${listIndex+1}`} items={asArray<string>(list.items)} onChange={items=>set("lists",lists.map((value,i)=>i===listIndex?{...value,items}:value))}/>) }
    {content.faq!==undefined?<ObjectList title="FAQ" kind="faq" items={asArray<GuideContent>(content.faq)} onChange={items=>set("faq",items)}/>:null}
    {content.comparison!==undefined?<div className="space-y-4"><StringList title="Títulos das colunas" items={asArray<string>(comparison.columnTitles)} onChange={items=>set("comparison",{...comparison,columnTitles:items})}/><ObjectList title="Comparações" kind="comparison" items={asArray<GuideContent>(comparison.items)} onChange={items=>set("comparison",{...comparison,items})}/></div>:null}
    {content.ctas!==undefined?<ObjectList title="CTAs" kind="ctas" items={asArray<GuideContent>(content.ctas)} onChange={items=>set("ctas",items)}/>:null}
    <fieldset className="space-y-4 rounded-xl border p-4"><legend className="px-2 font-bold">Imagem da seção</legend><div className="grid gap-3 sm:grid-cols-2"><Field label="Imagem" value={asString(image.url)} onChange={value=>set("image",{...image,url:value})}/><Field label="Texto alternativo" value={asString(image.alt)} onChange={value=>set("image",{...image,alt:value})}/></div><MediaUpload folder="guide" currentUrl={asString(image.url)} currentAlt={asString(image.alt)} onUploaded={url=>set("image",{...image,url})}/></fieldset>
    <div className="flex flex-wrap items-center gap-5"><label className="text-sm font-semibold">Ordem <input className="ml-2 w-24 rounded-lg border p-2" type="number" min="0" value={section.sort_order} onChange={event=>onChange({...section,sort_order:Number(event.target.value)})}/></label><label className="text-sm font-semibold"><input type="checkbox" checked={section.active} onChange={event=>onChange({...section,active:event.target.checked})}/> Ativa</label></div>
  </article>;
}

export function GuideEditor({guide,disabled}:{guide:{title:string;description:string|null;active:boolean;sections:GuideSection[]};disabled:boolean}){
  const [state,formAction,pending]=useActionState(saveGuideAction,initialState);
  const [pageTitle,setPageTitle]=useState(guide.title);
  const [sections,setSections]=useState(guide.sections);
  const serialized=useMemo(()=>JSON.stringify(sections,null,2),[sections]);
  const update=(index:number,section:GuideSection)=>setSections(current=>current.map((value,i)=>i===index?section:value));
  return <form action={formAction} className="mt-7 space-y-5">
    <section className="space-y-4 rounded-[20px] border bg-white p-5"><Field label="Título da página" value={pageTitle} onChange={setPageTitle}/><label className="block text-sm font-semibold">Descrição<input className={inputClass} name="description" defaultValue={guide.description??""}/></label><input type="hidden" name="title" value={pageTitle}/><label className="text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={guide.active}/> Página publicada/ativa</label></section>
    <input type="hidden" name="sections" value={serialized}/>
    {sections.map((section,index)=><SectionCard key={section.id??(asString(section.content.sectionKey)||index)} section={section} index={index} count={sections.length} onChange={value=>update(index,value)} onMove={direction=>setSections(current=>move(current,index,direction).map((value,i)=>({...value,sort_order:i*10})))} onRemove={()=>window.confirm("Excluir esta seção do editor? O registro existente será preservado no banco e não será apagado automaticamente.")&&setSections(current=>current.filter((_,i)=>i!==index).map((value,i)=>({...value,sort_order:i*10})))}/>) }
    <details className="rounded-[20px] border bg-white p-5"><summary className="cursor-pointer font-bold">Visualização avançada do JSON (somente leitura)</summary><pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl bg-[#0D1B2A] p-4 text-xs text-white">{serialized}</pre></details>
    {state.message&&<p aria-live="polite" className={`rounded-xl p-3 text-sm ${state.status==="success"?"bg-emerald-50 text-emerald-900":"bg-red-50 text-red-900"}`}>{state.message}</p>}
    <button disabled={disabled||pending} className="block w-full rounded-xl bg-[#047857] px-5 py-3 font-bold text-white disabled:opacity-50">{pending?"Salvando...":"Salvar no Supabase"}</button>
  </form>;
}
