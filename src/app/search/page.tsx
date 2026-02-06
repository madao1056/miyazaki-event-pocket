"use client";

import { useState, useEffect, useCallback } from "react";
import PostForm from "@/components/PostForm";
import CommentList from "@/components/CommentList";
import Filters from "@/components/Filters";
import BottomNavigation from "@/components/BottomNavigation";
import type { Municipality, Comment, SortType } from "@/types";

export default function SearchPage() {
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
    fetchComments();
  }, [fetchMunicipalities, fetchComments]);

  const handleSearch = () => {
    setIsLoading(true);
    fetchComments();
  };

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
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold gradient-text">
            イベント検索
          </h1>
        </div>

        {/* フィルター */}
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

        {/* 検索ボタン */}
        <button
          onClick={handleSearch}
          className="w-full py-3 px-4 bg-orange-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-200 hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:shadow-md mb-6"
        >
          検索する
        </button>

        {/* 検索結果 */}
        <div className="text-sm text-gray-500 mb-4">
          {comments.length}件の結果
        </div>
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">検索中...</div>
        ) : (
          <CommentList comments={comments} onLike={handleLike} onEdit={handleEdit} />
        )}
      </main>

      {/* ボトムナビゲーション */}
      <BottomNavigation onPostClick={() => setIsPostModalOpen(true)} />

      {/* 投稿モーダル */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsPostModalOpen(false)}
          />
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
