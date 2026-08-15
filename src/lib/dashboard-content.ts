import {fullDashboardGoals,fullDashboardProducts} from "@/lib/dashboard-catalog";

export type DashboardGoal={id?:string;slug:string;icon:string;title:string;description:string;active:boolean;sort_order:number};
export type DashboardProduct={id?:string;slug:string;name:string;scientific_family:string;category:string;level:string;level_class:string;presentation:string;short_summary:string;pitch:string;studied_for:string;research_shows:string;important_note:string;image_url:string;buy_url:string;active:boolean;sort_order:number;goal_slugs:string[]};
export type DashboardQuestion={id?:string;question:string;answer:string;category:string;active:boolean;sort_order:number};
export type DashboardSection={id?:string;title:string;body:string;section_type:string;active:boolean;sort_order:number};
export type DashboardSettings={title:string;subtitle:string;hero_text:string;support_text:string;audit_text:string;active:boolean};
export type DashboardContent={settings:DashboardSettings;goals:DashboardGoal[];products:DashboardProduct[];questions:DashboardQuestion[];sections:DashboardSection[]};

export const defaultDashboard:DashboardContent={
 settings:{title:"Encontre opções para o seu objetivo",subtitle:"Dashboard de tratamentos e produtos",hero_text:"Explore as alternativas de forma simples, compare linhas de pesquisa e entenda cada opção antes de decidir.",support_text:"Conteúdo educativo. A indicação e o acompanhamento devem ser feitos por profissional habilitado.",audit_text:"Catálogo revisado pela equipe eLeve Saúde",active:true},
 goals:fullDashboardGoals.map(goal=>({...goal})),
 products:fullDashboardProducts.map(product=>({...product,goal_slugs:[...product.goal_slugs]})),
 questions:[
  {question:"Como escolher uma opção?",answer:"Comece pelo objetivo e leve seu histórico a um profissional habilitado. Procedência, indicação, conservação e acompanhamento importam.",category:"Escolha",active:true,sort_order:0},
  {question:"Todos os produtos estão disponíveis para compra?",answer:"Não. Quando não houver um link configurado, o card será sinalizado como Em breve.",category:"Compra",active:true,sort_order:10},
  {question:"Este dashboard substitui uma consulta?",answer:"Não. Ele organiza informação educativa e não oferece diagnóstico, prescrição ou recomendação individual.",category:"Segurança",active:true,sort_order:20}
 ],sections:[]};
