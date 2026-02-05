import type { Metadata } from "next";
import "./globals.css";
import BackgroundImage from "@/components/BackgroundImage";

export const metadata: Metadata = {
  title: "MiyazakiEventPocket - 宮崎の出来事を記録",
  description: "宮崎県の今、起きている出来事を事実ベースで匿名投稿・閲覧できるアプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen">
        <BackgroundImage />
        {children}
      </body>
    </html>
  );
}
