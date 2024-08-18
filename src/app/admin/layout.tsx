import type { Metadata } from "next";
import Navbar from "@/components/admin/Navbar";
import Providers from "@/components/admin/Providers";

export const metadata: Metadata = {
  title: "DeCredit Score",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={"en"} className="dark">
      <body>
        <Providers>
          <div className="flex min-h-screen w-full flex-col">
            <Navbar />
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}