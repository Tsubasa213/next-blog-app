"use client";
import { useState } from "react";
import type { Post } from "@/app/_types/Post";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import DOMPurify from "isomorphic-dompurify";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

type Props = {
  post: Post;
  reloadAction: () => Promise<void>;
  setIsSubmitting: (isSubmitting: boolean) => void;
  onDeletePost?: (postId: string) => Promise<void>;
};

const AdminPostSummary: React.FC<Props> = ({
  post,
  reloadAction,
  setIsSubmitting,
  onDeletePost,
}) => {
  const dtFmt = "YYYY-MM-DD";
  const safeHTML = DOMPurify.sanitize(post.content, {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "br"],
  });

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`投稿記事「${post.title}」を本当に削除しますか？`)) {
      return;
    }

    try {
      setIsSubmitting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("認証エラー: アクセストークンが見つかりません");
      }

      const requestUrl = `/api/admin/posts?id=${post.id}`;
      const res = await fetch(requestUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || `${res.status}: ${res.statusText}`);
      }

      await reloadAction();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の削除に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-slate-400 p-3">
      <div className="flex items-center justify-between">
        <div>{dayjs(post.createdAt).format(dtFmt)}</div>
        <div className="flex space-x-1.5">
          {post.categories.map((category) => (
            <div
              key={category.id}
              className={twMerge(
                "rounded-md px-2 py-0.5",
                "text-xs font-bold",
                "border border-slate-400 text-slate-500"
              )}
            >
              <Link href={`/admin/categories/${category.id}`}>
                {category.name}
              </Link>
            </div>
          ))}
        </div>
      </div>
      <Link href={`/posts/${post.id}`}>
        <div className="mb-1 text-lg font-bold">{post.title}</div>
        <div
          className="line-clamp-3"
          dangerouslySetInnerHTML={{ __html: safeHTML }}
        />
      </Link>
      <div className="flex justify-end space-x-2">
        <Link href={`/admin/posts/${post.id}`}>
          <button
            type="button"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600"
            )}
          >
            編集
          </button>
        </Link>

        <button
          type="button"
          className={twMerge(
            "rounded-md px-5 py-1 font-bold",
            "bg-red-500 text-white hover:bg-red-600"
          )}
          onClick={() => {
            handleDelete(post);
          }}
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default AdminPostSummary;
