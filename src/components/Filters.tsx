"use client";

import type { Municipality, SortType } from "@/types";

interface FiltersProps {
  municipalities: Municipality[];
  selectedMunicipality: number | null;
  onMunicipalityChange: (id: number | null) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
}

export default function Filters({
  municipalities,
  selectedMunicipality,
  onMunicipalityChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sort,
  onSortChange,
  keyword,
  onKeywordChange,
}: FiltersProps) {
  return (
    <div className="space-y-3">
      {/* キーワード検索 */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="キーワード検索..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
        />
      </div>

      {/* 地域選択 */}
      <select
        value={selectedMunicipality ?? ""}
        onChange={(e) => onMunicipalityChange(e.target.value ? Number(e.target.value) : null)}
        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
      >
        <option value="">すべての地域</option>
        {municipalities.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      {/* ソート */}
      <select
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortType)}
        className="w-full px-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
      >
        <option value="newest">新着順</option>
        <option value="oldest">古い順</option>
        <option value="likes">いいね順</option>
        <option value="random">ランダム</option>
      </select>

      {/* 期間（横並び） */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
        />
        <span className="text-xs text-gray-500">〜</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="flex-1 px-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
        />
        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              onDateFromChange("");
              onDateToChange("");
            }}
            className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700"
          >
            クリア
          </button>
        )}
      </div>
    </div>
  );
}
