import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "Parishkrit Writes",
    template: "%s | Parishkrit Writes",
  },
  description: "Personal blog of Parishkrit Bastakoti. Thoughts on software, design, and life.",
  openGraph: {
    title: "Parishkrit Writes",
    description: "Personal blog of Parishkrit Bastakoti.",
    url: "https://blog.parishkrit.com.np", // Placeholder
    siteName: "Parishkrit Writes",
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
  twitter: {
    card: 'summary_large_image',
    title: 'Parishkrit Writes',
    description: 'Personal blog of Parishkrit Bastakoti. Thoughts on software, design, and life.',
    images: ['https://blog.parishkrit.com.np/favicon_me.png'],
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
        {children}
      </body>
    </html>
  );
}
