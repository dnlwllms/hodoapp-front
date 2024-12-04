import type { Metadata } from "next";

import localFont from "next/font/local";

import AlertProvider from "@/components/AlertProvider";
import BottomNavigation from "@/components/BottomNavigation";
import ConfirmProvider from "@/components/ConfirmProvider";
import ReactQueryProvider from "@/components/ReactQueryProvider";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HAB App",
  description: "Share with your partner",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryProvider>
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <AlertProvider>
            <ConfirmProvider>
              {children}
              <BottomNavigation />
            </ConfirmProvider>
          </AlertProvider>
        </body>
      </html>
    </ReactQueryProvider>
  );
}
