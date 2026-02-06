import type { Metadata, Viewport } from "next";
import "./globals.css";
import BackgroundImage from "@/components/BackgroundImage";
import ClarityProvider from "@/components/ClarityProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "MiyazakiEventPocket - 宮崎の出来事を記録",
  description: "宮崎県の今、起きている出来事を事実ベースで匿名投稿・閲覧できるアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EventPocket",
  },
  verification: {
    google: "O32SL8ZFj4lGof0W5pwWINwKJJUSV_Wj123_1wRZQA4",
  },
};

export const viewport: Viewport = {
  themeColor: "#9333ea",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className="min-h-screen">
        <ServiceWorkerRegister />
        <GoogleAnalytics />
        <ClarityProvider />
        <BackgroundImage />
        {children}
      </body>
    </html>
  );
}
