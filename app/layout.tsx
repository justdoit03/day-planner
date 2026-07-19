import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://day-planner-henna-three.vercel.app"),
  title: "Ясно — AI-планер дня",
  description:
    "Скажи, що в голові — AI розкладе все по поличках і збере план на сьогодні",
  openGraph: {
    title: "Ясно — AI-планер дня",
    description:
      "Скажи, що в голові — AI розкладе все по поличках і збере план на сьогодні",
    url: "/",
    siteName: "Ясно",
    locale: "uk_UA",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Ясно" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ясно — AI-планер дня",
    description:
      "Скажи, що в голові — стане ясно, що робити",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0c10",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
