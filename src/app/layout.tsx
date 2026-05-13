import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";

export const metadata: Metadata = {
  title: "KanjiMon — Learn Japanese with Battle Cards",
  description: "Belajar Bahasa Jepang Sambil Bertarung! Platform pembelajaran interaktif JLPT N5 dengan mekanisme Trading Card Game ala Pokémon.",
  keywords: ["Japanese", "JLPT N5", "Learn Japanese", "Kanji", "Hiragana", "Katakana", "Battle Card Game"],
  authors: [{ name: "KanjiMon Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KanjiMon",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F0F1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
