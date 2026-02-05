"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/types";

interface CommentCardProps {
  comment: Comment;
  onLikeToggle: (commentId: string, isLiked: boolean) => void;
  isLiked: boolean;
  index?: number;
}

const LocationIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function CommentCard({ comment, onLikeToggle, isLiked, index = 0 }: CommentCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.like_count);
  const [liked, setLiked] = useState(isLiked);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setLiked(isLiked);
  }, [isLiked]);

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
      {/* 地域バッジ */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-purple-500">
          <LocationIcon />
        </span>
        <span className="text-xs font-medium text-purple-600">
          {municipalityName}
        </span>
      </div>

      {/* 本文 */}
      <p className="text-gray-800 whitespace-pre-wrap mb-4 text-base leading-relaxed">
        {comment.content}
      </p>

      {/* フッター */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">{formatDate(comment.created_at)}</span>
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
  );
}
