"use client";

import { useState, useRef } from "react";
import type { Municipality } from "@/types";

interface PostFormProps {
  municipalities: Municipality[];
  onPost: () => void;
}

interface MediaFile {
  file: File;
  preview: string;
  type: "image" | "video";
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 3;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export default function PostForm({ municipalities, onPost }: PostFormProps) {
  const [municipalityId, setMunicipalityId] = useState<number | "">("");
  const [content, setContent] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files) return;

    const newFiles: MediaFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (mediaFiles.length + newFiles.length >= MAX_FILES) {
        setUploadError(`最大${MAX_FILES}ファイルまで添付できます`);
        break;
      }

      const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
      const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

      if (!isImage && !isVideo) {
        setUploadError("対応していないファイル形式です");
        continue;
      }

      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        const maxSizeMB = maxSize / (1024 * 1024);
        setUploadError(`ファイルサイズは${maxSizeMB}MB以下にしてください`);
        continue;
      }

      newFiles.push({
        file,
        preview: URL.createObjectURL(file),
        type: isVideo ? "video" : "image",
      });
    }

    setMediaFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!municipalityId || !content.trim()) return;

    setIsSubmitting(true);
    setUploadError(null);

    try {
      let mediaUrls: string[] = [];

      // メディアファイルがある場合はアップロード
      if (mediaFiles.length > 0) {
        const formData = new FormData();
        mediaFiles.forEach((mf) => formData.append("files", mf.file));

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          setUploadError(data.error || "アップロードに失敗しました");
          return;
        }

        const uploadData = await uploadRes.json();
        mediaUrls = uploadData.urls;
      }

      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          municipality_id: municipalityId,
          content: content.trim(),
          event_date: eventDate || undefined,
          media_urls: mediaUrls.length > 0 ? mediaUrls : undefined,
        }),
      });

      if (res.ok) {
        // プレビューURLをクリーンアップ
        mediaFiles.forEach((mf) => URL.revokeObjectURL(mf.preview));
        setMunicipalityId("");
        setContent("");
        setEventDate("");
        setMediaFiles([]);
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

      {/* メディアファイル入力 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 mb-1">
          画像・動画（任意、最大3ファイル）
          <span className="text-xs text-gray-400 ml-2">画像10MB / 動画50MBまで</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="media-input"
        />
        <label
          htmlFor="media-input"
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-orange-300 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-500 text-sm">クリックして画像・動画を追加</span>
        </label>

        {/* プレビュー表示 */}
        {mediaFiles.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {mediaFiles.map((mf, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {mf.type === "image" ? (
                  <img
                    src={mf.preview}
                    alt={`プレビュー ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={mf.preview}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {mf.type === "video" && (
                  <div className="absolute bottom-1 left-1 bg-black/50 px-1.5 py-0.5 rounded text-white text-xs">
                    動画
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* エラー表示 */}
        {uploadError && (
          <p className="mt-2 text-sm text-red-500">{uploadError}</p>
        )}
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
