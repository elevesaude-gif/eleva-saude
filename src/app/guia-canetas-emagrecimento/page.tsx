import type {Metadata} from "next";
import {DashboardView} from "./DashboardView";
import {getDashboardContent} from "@/lib/admin/dashboard";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Dashboard de tratamentos | eLeve Saúde",description:"Conheça e compare opções de tratamentos e produtos por objetivo."};

export default async function DashboardPage(){const content=await getDashboardContent();return <DashboardView content={content}/>;}
