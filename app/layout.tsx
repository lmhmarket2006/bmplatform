import type { Metadata } from "next";
import { Tajawal, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "بيت المصوّر | أكاديمية تعليم التصوير الفوتوغرافي والفيديو",
    template: "%s | بيت المصوّر",
  },
  description:
    "بيت المصوّر — أكاديمية احترافية لتعليم التصوير الفوتوغرافي والفيديو والإضاءة والمونتاج على يد نخبة من المدربين.",
  keywords: ["تصوير", "فوتوغرافي", "فيديو", "مونتاج", "إضاءة", "دورات تصوير"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${tajawal.variable} ${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
