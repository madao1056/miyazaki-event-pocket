"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface BottomNavigationProps {
  onPostClick: () => void;
}

export default function BottomNavigation({ onPostClick }: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 z-40 safe-area-bottom">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {/* ホームボタン */}
          <Link
            href="/"
            className={`flex items-center justify-center w-16 h-full transition-colors ${
              pathname === "/" ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="ホーム"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </Link>

          {/* 投稿ボタン（中央） */}
          <button
            onClick={onPostClick}
            className="flex items-center justify-center w-14 h-14 -mt-5 gradient-bg rounded-full shadow-lg hover:opacity-90 transition-all transform hover:scale-105 active:scale-95"
            aria-label="投稿する"
          >
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 検索ボタン */}
          <Link
            href="/search"
            className={`flex items-center justify-center w-16 h-full transition-colors ${
              pathname === "/search" ? "text-orange-500" : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label="検索"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
