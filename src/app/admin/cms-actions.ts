"use server";
import { requireAdminSession } from "@/lib/admin/auth";
import { saveGuide } from "@/lib/admin/content";
import { archiveProduct, restoreProduct, saveProduct } from "@/lib/admin/products";
import { isGuideSections } from "@/lib/guide-content";
import { isSafeContentUrl } from "@/lib/guide-content";
import { revalidatePath } from "next/cache";

const text=(data:FormData,key:string)=>{const value=data.get(key);return typeof value==="string"?value.trim():""};
const integer=(data:FormData,key:string)=>{const value=Number(text(data,key));if(!Number.isInteger(value)||value<0)throw new Error(`${key} inválido.`);return value};
const decimal=(data:FormData,key:string)=>{const value=Number(text(data,key));if(!Number.isFinite(value)||value<0)throw new Error(`${key} inválido.`);return value};

export type SaveGuideState={status:"idle"|"success"|"error";message:string};
export async function saveGuideAction(_previousState:SaveGuideState,form:FormData):Promise<SaveGuideState>{
  try{
    await requireAdminSession();
    let sections:unknown;
    try{sections=JSON.parse(text(form,"sections"));}catch{throw new Error("JSON dos blocos inválido.");}
    if(!isGuideSections(sections))throw new Error("Estrutura dos blocos inválida.");
    const result=await saveGuide({title:text(form,"title"),description:text(form,"description"),active:form.get("active")==="on",sections});
    revalidatePath("/guia-canetas-emagrecimento");
    revalidatePath("/admin/content/guide");
    return {status:"success",message:`Salvo. O Supabase confirmou ${result.sectionCount} seção(ões).`};
  }catch(error){
    console.error("[guide-admin] falha ao salvar o guia:",error);
    return {status:"error",message:error instanceof Error?error.message:"Não foi possível salvar o guia."};
  }
}

export type SaveProductState={status:"idle"|"success"|"error";message:string;updatedAt?:string};
export async function saveProductAction(_previousState:SaveProductState,form:FormData):Promise<SaveProductState>{
  try{
    await requireAdminSession();
    const id=text(form,"id"),slug=text(form,"slug"),imageUrl=text(form,"image_url"),name=text(form,"name"),description=text(form,"description"),category=text(form,"category");
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error("ID e slug devem usar letras minúsculas, números e hífens.");
    if(!name||!description||!category)throw new Error("Nome, descrição e categoria são obrigatórios.");
    if(!isSafeContentUrl(imageUrl))throw new Error("URL da imagem inválida.");
    const requiresShipping=form.get("requires_shipping")==="on";
    const weight=integer(form,"weight_grams"),height=decimal(form,"height_cm"),width=decimal(form,"width_cm"),length=decimal(form,"length_cm");
    if(requiresShipping&&(!weight||!height||!width||!length))throw new Error("Produtos físicos precisam de peso e dimensões maiores que zero.");
    const saved=await saveProduct({id,slug,name,description,category,price_cents:integer(form,"price_cents"),image_url:imageUrl||null,image_alt:text(form,"image_alt"),requires_shipping:requiresShipping,weight_grams:weight,height_cm:height,width_cm:width,length_cm:length,insured_value_cents:integer(form,"insured_value_cents"),stock:text(form,"stock")===""?null:integer(form,"stock"),sort_order:integer(form,"sort_order"),featured:form.get("featured")==="on",active:form.get("active")==="on",deleted_at:text(form,"deleted_at")||null});
    revalidateProducts();
    return {status:"success",message:"Produto salvo. O Supabase confirmou a atualização.",updatedAt:saved.updated_at};
  }catch(error){console.error("[product-admin] falha ao salvar produto:",error);return {status:"error",message:error instanceof Error?error.message:"Não foi possível salvar o produto."};}
}
export async function archiveProductAction(form:FormData){await requireAdminSession();const id=text(form,"id");if(!id)throw new Error("Produto inválido.");await archiveProduct(id);revalidateProducts();}
export async function restoreProductAction(form:FormData){await requireAdminSession();const id=text(form,"id");if(!id)throw new Error("Produto inválido.");await restoreProduct(id);revalidateProducts();}
function revalidateProducts(){revalidatePath("/admin/products");revalidatePath("/isabela");revalidatePath("/caio");}
