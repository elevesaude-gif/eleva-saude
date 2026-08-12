import { NextResponse } from "next/server";

const WHATSAPP_GROUP_URL =
  "https://chat.whatsapp.com/DaX6oULMMbd1nkrwudmpMj?s=cl&p=i&ilr=2&amv=2";

export function GET() {
  return NextResponse.redirect(WHATSAPP_GROUP_URL, 302);
}
