import type { Metadata } from "next";
import "./globals.css";
import BackgroundImage from "@/components/BackgroundImage";
import ClarityProvider from "@/components/ClarityProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "MiyazakiEventPocket - 宮崎の出来事を記録",
  description: "宮崎県の今、起きている出来事を事実ベースで匿名投稿・閲覧できるアプリ",
  verification: {
    google: "O32SL8ZFj4lGof0W5pwWINwKJJUSV_Wj123_1wRZQA4",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <GoogleAnalytics />
        <ClarityProvider />
        <BackgroundImage />
        {children}
      </body>
    </html>
  );
}
