import {DashboardEditor} from "@/components/admin/DashboardEditor";
import {getDashboardContent} from "@/lib/admin/dashboard";

export default async function GuideEditorPage(){
 const content=await getDashboardContent(true);
 return <main className="mx-auto max-w-6xl px-4 py-8"><p className="text-xs font-bold uppercase tracking-widest text-[#047857]">Conteúdo estruturado</p><h1 className="font-serif text-4xl font-semibold">Guia de tratamentos</h1><p className="mt-3 text-sm text-[#344563]">Edite o mesmo dashboard exibido em /guia-canetas-emagrecimento: introdução, objetivos, produtos, imagens, vínculos, perguntas e seções adicionais.</p><DashboardEditor initial={content}/></main>;
}
