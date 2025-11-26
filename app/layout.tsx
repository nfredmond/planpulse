import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
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
  description: "AI-powered platform for transportation and urban planners. Manage projects, track grants, engage communities, and analyze data.",
  keywords: ["transportation planning", "urban planning", "grant tracking", "community engagement", "transit planning"],
  authors: [{ name: "PlanPulse" }],
  icons: {
    icon: [
      { url: "/planpulselogo.png", type: "image/png" },
    ],
    apple: "/planpulselogo.png",
    shortcut: "/planpulselogo.png",
  },
  openGraph: {
    title: "PlanPulse - Transportation Planning Platform",
    description: "AI-powered platform for transportation and urban planners",
    type: "website",
    images: ["/planpulselogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased bg-slate-950 text-white`}
      >
        {children}
      </body>
    </html>
  );
}
