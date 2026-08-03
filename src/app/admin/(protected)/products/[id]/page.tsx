import { ProductForm } from "@/components/admin/ProductForm";
import { getAdminProduct } from "@/lib/admin/products";
import { notFound } from "next/navigation";
export default async function EditProductPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=await getAdminProduct(id);if(!product)notFound();return <main className="mx-auto max-w-4xl px-4 py-8"><h1 className="mb-7 font-serif text-4xl font-semibold">Editar {product.name}</h1><ProductForm product={product}/></main>}
