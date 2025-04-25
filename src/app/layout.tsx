import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Modal from "@/components/Modal";

export const metadata: Metadata = {
  title: "vida",
  description: "Pensamentos e histórias tirados de um bloco de notas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className=" px-4 sm:px-8 md:px-16 lg:px-32">
        <div className="max-w-4xl mx-auto py-4">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
