"use client";

import { useState, useEffect, useCallback } from "react";
import PostForm from "@/components/PostForm";
import CommentList from "@/components/CommentList";
import Filters from "@/components/Filters";
import type { Municipality, Comment, SortType, PeriodFilter } from "@/types";

export default function Home() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null);
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [sort, setSort] = useState<SortType>("newest");
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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
    params.set("period", period);
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
  }, [selectedMunicipality, period, sort, keyword]);

  useEffect(() => {
    fetchMunicipalities();
  }, [fetchMunicipalities]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePost = () => {
    fetchComments();
  };

  const handleLike = () => {
    fetchComments();
  };

  const handleEdit = () => {
    fetchComments();
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl gradient-bg mb-3 shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">
          MiyazakiEventPocket
        </h1>
        <p className="text-sm text-gray-500">
          宮崎の<span className="font-semibold text-purple-600">今</span>を記録する場所
        </p>
      </div>

      <div className="mb-8">
        <PostForm municipalities={municipalities} onPost={handlePost} />
      </div>

      <div className="mb-6">
        <Filters
          municipalities={municipalities}
          selectedMunicipality={selectedMunicipality}
          onMunicipalityChange={setSelectedMunicipality}
          period={period}
          onPeriodChange={setPeriod}
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
  );
}
