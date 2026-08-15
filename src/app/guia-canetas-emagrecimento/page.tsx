import type {Metadata} from "next";
import {DashboardView} from "./DashboardView";
import {getDashboardContent} from "@/lib/admin/dashboard";
import {mapDashboardProducts} from "@/lib/dashboard-product-mapping";
import {listPublicProductsWithFallback} from "@/lib/products";
import {isSellerSlug} from "@/lib/sellers";

export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Dashboard de tratamentos | eLeve Saúde",description:"Conheça e compare opções de tratamentos e produtos por objetivo."};

export default async function DashboardPage({searchParams}:{searchParams:Promise<{seller?:string|string[]}>}){const query=await searchParams;const seller=typeof query.seller==="string"&&isSellerSlug(query.seller)?query.seller:"isabela";const [content,catalog]=await Promise.all([getDashboardContent(),listPublicProductsWithFallback()]);return <DashboardView content={mapDashboardProducts(content,catalog,seller)}/>;}
