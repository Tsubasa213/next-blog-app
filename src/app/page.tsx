"use client";
import { useState, useEffect } from "react";
import type { Post } from "@/app/_types/Post";
import type { PostApiResponse } from "@/app/_types/PostApiResponse";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faFolder,
  faFilter,
  faTimes,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { twMerge } from "tailwind-merge";

type Folder = {
  id: string;
  name: string;
  categories: Array<{
    id: string;
    name: string;
  }>;
};

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [filteredPosts, setFilteredPosts] = useState<Post[] | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFoldersAndPosts = async () => {
      try {
        const foldersResponse = await fetch("/api/admin/folders", {
          method: "GET",
          cache: "no-store",
        });
        if (!foldersResponse.ok) {
          throw new Error("フォルダーの取得に失敗しました");
        }
        const foldersData = await foldersResponse.json();
        setFolders(foldersData);

        const postsResponse = await fetch("/api/posts", {
          method: "GET",
          cache: "no-store",
        });
        if (!postsResponse.ok) {
          throw new Error("投稿の取得に失敗しました");
        }
        const postResponse: PostApiResponse[] = await postsResponse.json();
        const postsData = postResponse.map((rawPost) => ({
          id: rawPost.id,
          title: rawPost.title,
          content: rawPost.content,
          coverImage: {
            url: rawPost.coverImageKey,
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
    };
    fetchFoldersAndPosts();
  }, []);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName];

      if (posts) {
        const filtered = posts.filter(
          (post) =>
            updated.length === 0 ||
            updated.every((category) =>
              post.categories.some((cat) => cat.name === category)
            )
        );
        setFilteredPosts(filtered);
      }

      return updated;
    });

    // フォルダを閉じる
    setActiveFolderId(null);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setFilteredPosts(posts);
  };

  const toggleFolder = (folderId: string) => {
    setActiveFolderId(activeFolderId === folderId ? null : folderId);
  };

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  if (!posts || folders.length === 0) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main className="relative z-[9999] min-h-screen p-4 md:p-6">
      {" "}
      {/* ヘッダー部分 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">投稿記事</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 md:hidden"
          >
            <FontAwesomeIcon icon={faFilter} className="mr-2" />
            フィルター
            {selectedCategories.length > 0 && (
              <span className="ml-2 rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white">
                {selectedCategories.length}
              </span>
            )}
          </button>

          <Link href="/admin" className="text-blue-500 underline">
            管理者はこちら
          </Link>
        </div>
      </div>
      {/* カテゴリフィルター（デスクトップ用） */}
      <div className="relative z-[9999] mb-6 hidden md:block">
        <div className="rounded-lg bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">カテゴリ:</span>
            <div className="flex flex-wrap items-center gap-2">
              {folders.map((folder) => (
                <div key={folder.id} className="relative">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className={twMerge(
                      "flex items-center rounded-lg border bg-white px-3 py-2 hover:bg-gray-50",
                      activeFolderId === folder.id
                        ? "border-blue-500"
                        : "border-gray-300"
                    )}
                  >
                    <FontAwesomeIcon
                      icon={faFolder}
                      className="mr-2 text-gray-500"
                    />
                    <span>{folder.name}</span>
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={twMerge(
                        "ml-2 transition-transform",
                        activeFolderId === folder.id ? "rotate-180" : ""
                      )}
                    />
                  </button>
                  {activeFolderId === folder.id && (
                    <div
                      className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
                      // クリック時にドロップダウンが閉じないようにする
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
                        {folder.categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => handleCategoryChange(category.name)}
                            className={twMerge(
                              "rounded-full px-3 py-1 text-sm transition-colors",
                              selectedCategories.includes(category.name)
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                            )}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {selectedCategories.length > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                クリア
              </button>
            )}
          </div>
        </div>
      </div>
      {/* 選択中のカテゴリ表示 */}
      {selectedCategories.length > 0 && (
        <div className="mb-4 rounded-lg bg-white/80 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <span
                key={category}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
      {/* 投稿一覧 */}
      <div className="space-y-3">
        {filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div
              key={post.id}
              className="rounded-lg bg-white/80 backdrop-blur-sm"
            >
              <PostSummary post={post} />
            </div>
          ))
        ) : (
          <div className="rounded-lg bg-white/80 p-4 text-gray-500 backdrop-blur-sm">
            該当する投稿がありません。
          </div>
        )}
      </div>
      <br />
      <br />
      {/* モバイルフィルターモーダル */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 md:hidden">
          <div className="absolute inset-x-0 bottom-0 rounded-t-xl bg-white p-4">
            {/* モーダルの内容は変更なし */}
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;
