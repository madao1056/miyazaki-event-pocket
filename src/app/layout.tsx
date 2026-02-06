import type { Metadata, Viewport } from "next";
import "./globals.css";
import BackgroundImage from "@/components/BackgroundImage";
import ClarityProvider from "@/components/ClarityProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
  title: "宮崎のイベント情報 | MiyazakiEventPocket",
  description: "宮崎県のイベント情報を掲載。地域のお祭り、マルシェ、ライブなど宮崎の今起きている出来事を匿名で投稿・閲覧できるアプリ",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EventPocket",
  },
  verification: {
    google: "O32SL8ZFj4lGof0W5pwWINwKJJUSV_Wj123_1wRZQA4",
  },
  openGraph: {
    title: "宮崎のイベント情報 | MiyazakiEventPocket",
    description: "宮崎県のイベント情報を掲載。地域のお祭り、マルシェ、ライブなど宮崎の今起きている出来事を匿名で投稿・閲覧できるアプリ",
    url: "https://eventpocket.vercel.app",
    siteName: "MiyazakiEventPocket",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MiyazakiEventPocket OGP Image",
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "宮崎のイベント情報 | MiyazakiEventPocket",
    description: "宮崎県のイベント情報を掲載。地域のお祭り、マルシェ、ライブなど宮崎の今起きている出来事を匿名で投稿・閲覧できるアプリ",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#4a88bb",
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
