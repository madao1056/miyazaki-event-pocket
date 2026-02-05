"use client";

import { useState, useEffect } from "react";
import type { Comment } from "@/types";
import CommentCard from "./CommentCard";

interface CommentListProps {
  comments: Comment[];
  onLike: () => void;
  onEdit: () => void;
}

export default function CommentList({ comments, onLike, onEdit }: CommentListProps) {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [editableIds, setEditableIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (comments.length === 0) return;

    const ids = comments.map((c) => c.id).join(",");

    const fetchLikedStatus = async () => {
      const res = await fetch(`/api/likes?comment_ids=${ids}`);
      if (res.ok) {
        const data = await res.json();
        setLikedIds(new Set(data.liked_ids));
      }
    };

    const fetchEditableStatus = async () => {
      const res = await fetch(`/api/comments/editable?ids=${ids}`);
      if (res.ok) {
        const data = await res.json();
        setEditableIds(new Set(data.editable_ids));
      }
    };

    fetchLikedStatus();
    fetchEditableStatus();
  }, [comments]);

  const handleLikeToggle = (commentId: string, isLiked: boolean) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) {
        next.add(commentId);
      } else {
        next.delete(commentId);
      }
      return next;
    });
    onLike();
  };

  const handleEdit = () => {
    onEdit();
  };

  if (comments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-400">まだ投稿がありません</p>
        <p className="text-sm text-gray-300 mt-1">最初の投稿者になろう</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment, index) => (
        <CommentCard
          key={comment.id}
          comment={comment}
          onLikeToggle={handleLikeToggle}
          isLiked={likedIds.has(comment.id)}
          isEditable={editableIds.has(comment.id)}
          onEdit={handleEdit}
          index={index}
        />
      ))}
    </div>
  );
}
