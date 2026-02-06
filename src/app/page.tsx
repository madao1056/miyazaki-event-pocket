"use client";

import { useState, useEffect, useCallback } from "react";
import PostForm from "@/components/PostForm";
import CommentList from "@/components/CommentList";
import Filters from "@/components/Filters";
import type { Municipality, Comment, SortType } from "@/types";

export default function Home() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState<SortType>("newest");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const fetchMunicipalities = useCallback(async () => {
    const res = await fetch("/api/municipalities");
    if (res.ok) {
      const data = await res.json();
      setMunicipalities(data);
    }
  }, []);

  const fetchComments = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedMunicipality) {
      params.set("municipality_id", String(selectedMunicipality));
    }
    if (dateFrom) {
      params.set("date_from", dateFrom);
    }
    if (dateTo) {
      params.set("date_to", dateTo);
    }
    params.set("sort", sort);
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    const res = await fetch(`/api/comments?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setComments(data);
    }
    setIsLoading(false);
  }, [selectedMunicipality, dateFrom, dateTo, sort, keyword]);

  useEffect(() => {
    fetchMunicipalities();
  }, [fetchMunicipalities]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePost = () => {
    fetchComments();
    setIsPostModalOpen(false);
  };

  const handleLike = () => {
    fetchComments();
  };

  const handleEdit = () => {
    fetchComments();
  };

  return (
    <>
      <main className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            MiyazakiEventPocket
          </h1>
          <p className="text-sm text-gray-500">
            宮崎のイベント情報を掲載
          </p>
        </div>

        <div className="mb-6">
          <Filters
            municipalities={municipalities}
            selectedMunicipality={selectedMunicipality}
            onMunicipalityChange={setSelectedMunicipality}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            sort={sort}
            onSortChange={setSort}
            keyword={keyword}
            onKeywordChange={setKeyword}
          />
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-8">読み込み中...</div>
        ) : (
          <CommentList comments={comments} onLike={handleLike} onEdit={handleEdit} />
        )}
      </main>

      {/* FABボタン */}
      <button
        onClick={() => setIsPostModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 gradient-bg rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all transform hover:scale-110 active:scale-95 z-40"
        aria-label="投稿する"
      >
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 投稿モーダル */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsPostModalOpen(false)}
          />
          {/* モーダルコンテンツ */}
          <div className="relative w-full max-w-lg mx-4 animate-fade-in-up">
            <button
              onClick={() => setIsPostModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-200 transition-colors"
              aria-label="閉じる"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <PostForm municipalities={municipalities} onPost={handlePost} />
          </div>
        </div>
      )}
    </>
  );
}
