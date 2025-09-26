import type { Metadata } from "next";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";

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
      <body className="antialiased">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}