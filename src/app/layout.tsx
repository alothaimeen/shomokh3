import type { Metadata } from "next";
import { Cairo } from 'next/font/google';
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";

const cairo = Cairo({ 
  subsets: ['arabic'],
  weight: ['400', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "منصة شموخ التعليمية v3",
  description: "منصة بسيطة لتعليم القرآن الكريم",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased`}>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}