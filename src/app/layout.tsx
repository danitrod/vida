import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { Theme } from "@/components/ThemeToggle";
import { UserProvider } from "@/context/UserContext";

export const metadata: Metadata = {
  title: "vida",
  description: "Pensamentos e histórias tirados de um bloco de notas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getTheme();

  return (
    <html lang="pt-BR" className={theme === "dark" ? "dark" : ""}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="px-4 sm:px-8 md:px-16 lg:px-32">
        <div className="max-w-4xl mx-auto py-4">
          <UserProvider>
            <Header initialTheme={theme} />
          </UserProvider>
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}

async function getTheme(): Promise<Theme | undefined> {
  let theme = (await cookies()).get("theme")?.value;
  if (theme !== "dark" && theme !== "light") {
    theme = undefined;
  }

  return theme;
}
