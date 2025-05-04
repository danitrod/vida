import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { cookies, headers } from "next/headers";
import { Theme } from "@/components/ThemeToggle";
import { UserProvider } from "@/context/UserContext";
import mongo from "@/lib/mongodb";

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
  const headersList = await headers();

  const ref = headersList.get("x-referrer");
  const utm = headersList.get("x-utm-source");
  const fbclid = headersList.get("x-has-fbclid") === "true";
  const pathname = headersList.get("x-path");

  if (pathname) {
    const incFields: Record<string, number> = {
      views: 1,
    };

    if (utm) {
      incFields[`utm.${utm}`] = 1;
    }

    if (ref) {
      incFields[`referrer.${ref}`] = 1;
    }

    if (fbclid) {
      incFields["fbclid"] = 1;
    }

    try {
      await mongo.connect();
      const db = mongo.db();
      const analytics = db.collection("analytics");
      await analytics.updateOne(
        { path: pathname },
        {
          $inc: incFields,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true }
      );
    } catch (err) {
      console.error("Middleware error:", err);
    }
  }

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
