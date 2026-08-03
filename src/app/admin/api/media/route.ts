import { isAdminAuthenticated } from "@/lib/admin/auth";
import { uploadAdminMedia } from "@/lib/admin/media";
import { NextResponse } from "next/server";
export const runtime="nodejs";
export async function POST(request:Request){
  if(!await isAdminAuthenticated())return NextResponse.json({error:"Não autorizado."},{status:401});
  try{const form=await request.formData();const file=form.get("file");const folder=form.get("folder");if(!(file instanceof File)||(folder!=="guide"&&folder!=="products"))return NextResponse.json({error:"Arquivo ou pasta inválidos."},{status:400});const url=await uploadAdminMedia(file,folder);return NextResponse.json({url});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Falha no upload."},{status:400});}
}
