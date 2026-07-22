import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Body / UI — чистий сучасний гротеск з кирилицею
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

// Display — характерний акцентний шрифт для заголовків і логотипу
const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
});

// Mono — цифри часу у стрічці дня («альманах»)
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600"],
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
  themeColor: "#eceef1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${manrope.variable} ${unbounded.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
