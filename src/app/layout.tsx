import type { Metadata } from "next";
import { Red_Hat_Display, Red_Hat_Text } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cookies } from "next/headers";
import { Theme } from "@/components/ThemeToggle";
import { UserProvider } from "@/context/UserContext";

// Downloaded at build time and served from this site: readers' browsers never
// contact Google (loading Google Fonts directly sends visitors' IPs to Google).
const redHatText = Red_Hat_Text({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-red-hat-text",
});
const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  weight: ["300", "700"],
  variable: "--font-red-hat-display",
});

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
    <html
      lang="pt-BR"
      className={`${redHatText.variable} ${redHatDisplay.variable} ${theme ?? ""}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="px-4 sm:px-8 md:px-16 lg:px-32">
        {/* One provider for the whole app, so logging in from the header
            updates every component that reads the user (e.g. comments). */}
        <UserProvider>
          <div className="max-w-4xl mx-auto py-4">
            <Header />
            {children}
            <Footer />
          </div>
        </UserProvider>
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
