import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { SitePopup } from "@/components/layout/SitePopup";
import { VisitorTracker } from "@/components/layout/VisitorTracker";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')),
  title: {
    default: "Parishkrit Bastakoti | Blog",
    template: "%s | Parishkrit Bastakoti",
  },
  description: "Personal blog of Parishkrit Bastakoti. Thoughts on software, design, and life.",
  openGraph: {
    title: "Parishkrit Bastakoti",
    description: "Personal blog of Parishkrit Bastakoti.",
    url: "https://parishkrit.com", // Placeholder
    siteName: "Parishkrit Bastakoti",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon_me.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <VisitorTracker />
        <SitePopup />
        <AnnouncementBar />
        <Header />
        <main className="flex-1 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
