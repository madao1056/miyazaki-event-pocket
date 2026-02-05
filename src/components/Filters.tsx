"use client";

import type { Municipality, SortType, PeriodFilter } from "@/types";

interface FiltersProps {
  municipalities: Municipality[];
  selectedMunicipality: number | null;
  onMunicipalityChange: (id: number | null) => void;
  period: PeriodFilter;
  onPeriodChange: (period: PeriodFilter) => void;
  sort: SortType;
  onSortChange: (sort: SortType) => void;
}

export default function Filters({
  municipalities,
  selectedMunicipality,
  onMunicipalityChange,
  period,
  onPeriodChange,
  sort,
  onSortChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <select
        id="filter-municipality"
        value={selectedMunicipality ?? ""}
        onChange={(e) => onMunicipalityChange(e.target.value ? Number(e.target.value) : null)}
        className="px-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
      >
        <option value="">すべての地域</option>
        {municipalities.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <select
        id="filter-period"
        value={period}
        onChange={(e) => onPeriodChange(e.target.value as PeriodFilter)}
        className="px-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
      >
        <option value="all">すべての期間</option>
        <option value="today">今日</option>
        <option value="week">今週</option>
        <option value="month">今月</option>
      </select>

      <select
        id="sort"
        value={sort}
        onChange={(e) => onSortChange(e.target.value as SortType)}
        className="px-3 py-2 bg-white/80 backdrop-blur-sm border-0 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-sm"
      >
        <option value="newest">新着順</option>
        <option value="likes">いいね順</option>
        <option value="random">ランダム</option>
      </select>
    </div>
  );
}
