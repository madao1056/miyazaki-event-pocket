"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/types";

interface CommentCardProps {
  comment: Comment;
  onLikeToggle: (commentId: string, isLiked: boolean) => void;
  isLiked: boolean;
  isEditable?: boolean;
  onEdit?: () => void;
  index?: number;
}

const LocationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

/**
 * イベント日付をフォーマット（YYYY-MM-DD形式をM/D形式に変換）
 */
const formatEventDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

const urlRegex = /(https?:\/\/[^\s]+)/g;

const renderContentWithLinks = (content: string) => {
  const parts = content.split(urlRegex);
  return parts.map((part, i) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0;
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:text-sky-800 underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

export default function CommentCard({ comment, onLikeToggle, isLiked, isEditable = false, onEdit, index = 0 }: CommentCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [liked, setLiked] = useState(isLiked);
  const [animating, setAnimating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

  const handleSaveEdit = async () => {
    if (isSaving || !editContent.trim()) return;
    setIsSaving(true);

    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: comment.id, content: editContent.trim() }),
      });

      if (res.ok) {
        setIsEditing(false);
        onEdit?.();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return "たった今";
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;

    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  const handleLike = async () => {
    if (isLiking) return;

    setIsLiking(true);
    setAnimating(true);

    const wasLiked = liked;
    // Optimistic update
    setLiked(!wasLiked);
    setLikeCount((prev) => wasLiked ? prev - 1 : prev + 1);

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: comment.id }),
      });

      if (res.ok) {
        const data = await res.json();
        onLikeToggle(comment.id, data.action === "liked");
      } else {
        // Revert on error
        setLiked(wasLiked);
        setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
      }
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((prev) => wasLiked ? prev + 1 : prev - 1);
    } finally {
      setIsLiking(false);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const municipalityName = comment.municipality?.name || "";

  return (
    <div
      className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-white/50 card-hover animate-fade-in-up"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* 地域バッジとイベント日付 */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-sky-500">
            <LocationIcon />
          </span>
          <span className="text-xs font-medium text-sky-600">
            {municipalityName}
          </span>
        </div>
        {comment.event_date && (
          <div className="flex items-center gap-1.5">
            <span className="text-orange-500">
              <CalendarIcon />
            </span>
            <span className="text-xs font-medium text-orange-600">
              {formatEventDate(comment.event_date)}
            </span>
          </div>
        )}
      </div>

      {/* 本文 */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value.slice(0, 500))}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-gray-700"
            rows={4}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{editContent.length}/500</span>
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving || !editContent.trim()}
                className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                {isSaving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-800 whitespace-pre-wrap mb-4 text-base leading-relaxed">
          {renderContentWithLinks(comment.content)}
        </p>
      )}

      {/* フッター */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{formatDate(comment.created_at)}</span>
        <div className="flex items-center gap-2">
          {isEditable && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all ${
            liked
              ? "bg-red-50 text-red-500"
              : "bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500"
          } disabled:opacity-50`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${animating ? "animate-heart" : ""} ${liked ? "fill-current" : ""}`}
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="font-medium">{likeCount}</span>
        </button>
        </div>
      </div>
    </div>
  );
}
