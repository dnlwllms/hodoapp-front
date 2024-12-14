import type { Metadata } from "next";

import localFont from "next/font/local";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import AlertProvider from "@/app/clients/AlertProvider";
import ConfirmProvider from "@/app/clients/ConfirmProvider";
import ReactQueryProvider from "@/app/clients/ReactQueryProvider";

import "./globals.css";
import UserProvider from "@/app/clients/UserProvider";

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

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
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
          className={`${geistSans.variable} ${geistMono.variable} ${pretendard.variable} antialiased`}
        >
          <UserProvider>
            <AlertProvider>
              <ConfirmProvider>{children}</ConfirmProvider>
            </AlertProvider>
          </UserProvider>
        </body>
      </html>
      <Analytics />
      <SpeedInsights />
    </ReactQueryProvider>
  );
}
