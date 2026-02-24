import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marimecs Dart Club - Trainen, Competities en Matches",
  description: "Marimecs Dart Club: Volg je scores, daag vrienden uit, en verbeter je darts spel met dagelijkse challenges, training games en head-to-head matches.",
  keywords: ["Marimecs", "Darts", "Training", "Challenges", "Matches", "Leaderboard", "501", "Cricket"],
  authors: [{ name: "Marimecs" }],
  icons: {
    icon: "/marimecs-logo.png",
  },
  openGraph: {
    title: "Marimecs Dart Club",
    description: "Trainen, Competities en Matches - Verbeter je darts spel!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marimecs Dart Club",
    description: "Volg je scores, daag vrienden uit en verbeter je spel!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
