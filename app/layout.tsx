import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PlanPulse - Transportation Planning Platform",
  description: "AI-powered platform for transportation and urban planners. Manage projects, track grants, engage communities, and analyze data. By Nat Ford Planning.",
  keywords: ["transportation planning", "urban planning", "grant tracking", "community engagement", "transit planning", "Nat Ford Planning"],
  authors: [{ name: "Nat Ford Planning", url: "https://natfordplanning.com" }],
  creator: "Nat Ford Planning",
  publisher: "Nat Ford Planning",
  icons: {
    icon: [
      { url: "/planpulselogo.png", type: "image/png" },
    ],
    apple: "/planpulselogo.png",
    shortcut: "/planpulselogo.png",
  },
  openGraph: {
    title: "PlanPulse - Transportation Planning Platform",
    description: "AI-powered platform for transportation and urban planners. By Nat Ford Planning.",
    type: "website",
    images: ["/planpulselogo.png"],
    siteName: "PlanPulse by Nat Ford Planning",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-950 text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
