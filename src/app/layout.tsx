import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eleva Saúde | Cuidado e bem-estar",
  description: "Saúde, cuidado e bem-estar em uma jornada mais leve.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
