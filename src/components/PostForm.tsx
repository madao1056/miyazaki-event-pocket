"use client";

import { useState } from "react";
import type { Municipality } from "@/types";

interface PostFormProps {
  municipalities: Municipality[];
  onPost: () => void;
}

export default function PostForm({ municipalities, onPost }: PostFormProps) {
  const [municipalityId, setMunicipalityId] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!municipalityId || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          municipality_id: municipalityId,
          content: content.trim(),
          event_date: eventDate || undefined,
        }),
      });

      if (res.ok) {
        setMunicipalityId("");
        setContent("");
        setEventDate("");
        onPost();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <span className="font-semibold text-gray-700">今、何が起きてる？</span>
      </div>

      <div className="mb-4">
        <select
          id="municipality"
          value={municipalityId}
          onChange={(e) => setMunicipalityId(e.target.value ? Number(e.target.value) : "")}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
          required
        >
          <option value="">地域を選択</option>
          {municipalities.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 500))}
          placeholder="例: 駅前で突然のストリートライブが始まった！&#10;例: 商店街でセールやってる"
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-gray-700 placeholder-gray-400"
          rows={4}
          maxLength={500}
          required
        />
        <div className="text-xs text-gray-400 text-right mt-1">{content.length}/500</div>
      </div>

      {/* イベント日付入力 */}
      <div className="mb-4">
        <label htmlFor="event_date" className="block text-sm font-medium text-gray-600 mb-1">
          イベント開催日（任意）
        </label>
        <input
          type="date"
          id="event_date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full px-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-700"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !municipalityId || !content.trim()}
        className="w-full py-3 px-4 bg-[#f67a05] text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            投稿中...
          </span>
        ) : (
          "投稿する"
        )}
      </button>
    </form>
  );
}
