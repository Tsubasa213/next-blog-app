"use client";
import { useState, useEffect, useCallback } from "react";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import AdminPostSummary from "@/app/_components/AdminPostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";
import { supabase } from "@/utils/supabase";

const Page: React.FC = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPosts = useCallback(async () => {
    try {
      const requestUrl = `/api/posts`;
      const response = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("データの取得に失敗しました");
      }
      const postResponse: PostApiResponse[] = await response.json();
      const postsData = postResponse.map((rawPost) => ({
        id: rawPost.id,
        title: rawPost.title,
        content: rawPost.content,
        coverImage: {
          url: rawPost.coverImageURL,
          width: 1000,
          height: 1000,
        },
        createdAt: rawPost.createdAt,
        categories: rawPost.categories.map((category) => ({
          id: category.category.id,
          name: category.category.name,
        })),
      }));
      setPosts(postsData);
      setFilteredPosts(postsData);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDeletePost = async (postId: string) => {
    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("認証エラー: アクセストークンが見つかりません");
      }

      // APIエンドポイントを修正
      const response = await fetch(`/api/admin/posts?id=${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      let errorMessage = "投稿の削除に失敗しました";

      if (!response.ok) {
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // 削除成功後、投稿一覧を再取得
      await fetchPosts();
    } catch (error) {
      console.error("削除エラー:", error);
      alert(
        error instanceof Error ? error.message : "削除中にエラーが発生しました"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (selectedCategory: string) => {
    setCategories((prevCategories) => {
      const updatedCategories = prevCategories.includes(selectedCategory)
        ? prevCategories.filter((cat) => cat !== selectedCategory)
        : [...prevCategories, selectedCategory];

      if (posts) {
        const filtered = posts.filter((post) =>
          updatedCategories.every((category) =>
            post.categories.some((cat) => cat.name === category)
          )
        );
        setFilteredPosts(filtered);
      }

      return updatedCategories;
    });
  };

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!posts) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  const uniqueCategories = Array.from(
    new Set(posts.flatMap((post) => post.categories.map((cat) => cat.name)))
  );

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の管理</div>

      <div className="mb-4">
        <label className="mb-2 block font-medium">カテゴリで絞り込み:</label>
        <div className="flex flex-wrap gap-2">
          {uniqueCategories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={twMerge(
                "rounded border px-3 py-1",
                categories.includes(category)
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 bg-white text-gray-800"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-end justify-end">
        <Link href="/admin/posts/new">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-blue-500 text-white hover:bg-blue-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            新規作成
          </button>
        </Link>
      </div>

      <div className="space-y-3">
        {filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <AdminPostSummary
              key={post.id}
              post={post}
              reloadAction={fetchPosts}
              setIsSubmitting={setIsSubmitting} // 修正
              onDeletePost={handleDeletePost} // 追加
            />
          ))
        ) : (
          <div className="text-gray-500">該当する投稿がありません。</div>
        )}
      </div>
    </main>
  );
};

export default Page;
