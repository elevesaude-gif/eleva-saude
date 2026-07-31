import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "eLeve Saúde | Um caminho mais leve",
  description: "Um caminho mais leve para a sua saúde.",
  icons: { icon: "/brand/eleve-favicon.png" },
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
