import "server-only";
import {getSupabaseServerClient} from "@/lib/supabase/server";
import {defaultDashboard,type DashboardContent} from "@/lib/dashboard-content";

export async function getDashboardContent(includeInactive=false):Promise<DashboardContent>{
 try{
  const db=getSupabaseServerClient();
  const [settings,goals,products,links,questions,sections]=await Promise.all([
   db.from("dashboard_settings").select("*").eq("key","main").maybeSingle(),db.from("dashboard_goals").select("*").order("sort_order"),db.from("dashboard_products").select("*").order("sort_order"),db.from("dashboard_product_goals").select("product_id,goal_id"),db.from("dashboard_questions").select("*").order("sort_order"),db.from("dashboard_sections").select("*").order("sort_order")]);
  const error=[settings,goals,products,links,questions,sections].find(result=>result.error)?.error;if(error)throw error;
  if(!settings.data)return defaultDashboard;
  const goalRows=(goals.data??[]);const goalById=new Map(goalRows.map(goal=>[goal.id,goal.slug]));
  const goalsByProduct=new Map<string,string[]>();for(const link of links.data??[]){const slug=goalById.get(link.goal_id);if(slug)goalsByProduct.set(link.product_id,[...(goalsByProduct.get(link.product_id)??[]),slug]);}
  const visible=<T extends {active:boolean}>(rows:T[])=>includeInactive?rows:rows.filter(row=>row.active);
  return {settings:settings.data,goals:visible(goalRows),products:visible((products.data??[]).map(product=>({...product,goal_slugs:goalsByProduct.get(product.id)??[]}))),questions:visible(questions.data??[]),sections:visible(sections.data??[])} as DashboardContent;
 }catch(error){console.warn("[dashboard] usando conteúdo preparado:",error);return defaultDashboard;}
}

export async function saveDashboard(content:DashboardContent){
 const db=getSupabaseServerClient();const now=new Date().toISOString();
 const {error:settingsError}=await db.from("dashboard_settings").upsert({key:"main",...content.settings,updated_at:now},{onConflict:"key"});if(settingsError)throw settingsError;
 const sync=async(table:string,rows:Record<string,unknown>[])=>{const {error:deleteError}=await db.from(table).delete().neq("id","00000000-0000-0000-0000-000000000000");if(deleteError)throw deleteError;if(rows.length){const {error}=await db.from(table).insert(rows);if(error)throw error;}};
 await sync("dashboard_goals",content.goals.map(goal=>({slug:goal.slug,icon:goal.icon,title:goal.title,description:goal.description,active:goal.active,sort_order:goal.sort_order})));
 const {data:goalRows,error:goalError}=await db.from("dashboard_goals").select("id,slug");if(goalError)throw goalError;const goalIds=new Map((goalRows??[]).map(goal=>[goal.slug,goal.id]));
 await sync("dashboard_products",content.products.map(product=>({slug:product.slug,name:product.name,scientific_family:product.scientific_family,category:product.category,level:product.level,level_class:product.level_class,presentation:product.presentation,short_summary:product.short_summary,pitch:product.pitch,studied_for:product.studied_for,research_shows:product.research_shows,important_note:product.important_note,image_url:product.image_url,buy_url:product.buy_url,active:product.active,sort_order:product.sort_order})));
 const {data:productRows,error:productError}=await db.from("dashboard_products").select("id,slug");if(productError)throw productError;const productIds=new Map((productRows??[]).map(product=>[product.slug,product.id]));
 const links=content.products.flatMap(product=>product.goal_slugs.map(slug=>({product_id:productIds.get(product.slug),goal_id:goalIds.get(slug)})).filter(link=>link.product_id&&link.goal_id));if(links.length){const {error}=await db.from("dashboard_product_goals").insert(links);if(error)throw error;}
 await sync("dashboard_questions",content.questions.map(question=>({question:question.question,answer:question.answer,category:question.category,active:question.active,sort_order:question.sort_order})));await sync("dashboard_sections",content.sections.map(section=>({title:section.title,body:section.body,section_type:section.section_type,active:section.active,sort_order:section.sort_order})));
}
