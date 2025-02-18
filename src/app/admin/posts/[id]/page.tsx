"use client";
import { useState, useEffect, ChangeEvent, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faFolder,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/app/_hooks/useAuth";
import { supabase } from "@/utils/supabase";
import CryptoJS from "crypto-js";
import Image from "next/image";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageKey: string;
  createdAt: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};

type Folder = {
  id: string;
  name: string;
  categories: Array<{
    id: string;
    name: string;
  }>;
};

const calculateMD5Hash = async (file: File): Promise<string> => {
  const buffer = await file.arrayBuffer();
  const wordArray = CryptoJS.lib.WordArray.create(buffer);
  return CryptoJS.MD5(wordArray).toString();
};

const Page: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const bucketName = "cover_image";
  const [coverImageUrl, setCoverImageUrl] = useState<string | undefined>();
  const [coverImageKey, setCoverImageKey] = useState<string | undefined>();
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);

  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { token, session } = useAuth();

  const [folders, setFolders] = useState<Folder[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // 投稿記事の取得
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const requestUrl = `/api/posts/${id}`;
        const res = await fetch(requestUrl, {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        const apiResBody = (await res.json()) as PostApiResponse;

        setNewTitle(apiResBody.title);
        setNewContent(apiResBody.content);
        setCoverImageKey(apiResBody.coverImageKey);

        if (apiResBody.coverImageKey) {
          const publicUrlResult = supabase.storage
            .from(bucketName)
            .getPublicUrl(apiResBody.coverImageKey);
          setCoverImageUrl(publicUrlResult.data.publicUrl);
        }

        // カテゴリIDを設定
        const categoryIds = apiResBody.categories.map((c) => c.category.id);
        setSelectedCategories(categoryIds);
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? `投稿記事の取得に失敗しました: ${error.message}`
            : `予期せぬエラーが発生しました ${error}`;
        console.error(errorMsg);
        setFetchErrorMsg(errorMsg);
      }
    };

    fetchPost();
  }, [id]);

  // フォルダとカテゴリの取得
  useEffect(() => {
    const fetchFoldersAndCategories = async () => {
      try {
        const res = await fetch("/api/admin/folders", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }

        const foldersData = await res.json();
        setFolders(foldersData);
        setIsInitialized(true);
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
            : `予期せぬエラーが発生しました ${error}`;
        console.error(errorMsg);
        setFetchErrorMsg(errorMsg);
      }
    };

    fetchFoldersAndCategories();
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) =>
      prev.includes(folderId)
        ? prev.filter((id) => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const updateNewTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(e.target.value);
  };

  const updateNewContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewContent(e.target.value);
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setCoverImageKey(undefined);

    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const fileHash = await calculateMD5Hash(file);
    const path = `private/${fileHash}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, file, { upsert: true });

    if (error || !data) {
      window.alert(`アップロードに失敗 ${error.message}`);
      return;
    }

    setCoverImageKey(data.path);
    const publicUrlResult = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    setCoverImageUrl(publicUrlResult.data.publicUrl);
  };

  // 投稿の削除処理
  const handleDelete = async (postId: string) => {
    setIsSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("認証エラー: アクセストークンが見つかりません");
      }

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

      router.push("/admin/posts");
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        window.alert(error.message);
      } else {
        window.alert("予期せぬエラーが発生しました");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      window.alert("予期せぬ動作：トークンが取得できません。");
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        title: newTitle,
        content: newContent,
        coverImageKey: coverImageKey,
        categoryIds: selectedCategories,
      };
      const requestUrl = `/api/admin/posts/${id}`;
      console.log(`${requestUrl} => ${JSON.stringify(requestBody, null, 2)}`);
      const res = await fetch(requestUrl, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      setIsSubmitting(false);
      router.push("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事の更新に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  if (fetchErrorMsg) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  if (!isInitialized) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の編集・削除</div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={twMerge("space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="title" className="block font-bold">
            タイトル
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="w-full rounded-md border-2 px-2 py-1"
            value={newTitle}
            onChange={updateNewTitle}
            placeholder="タイトルを記入してください"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="content" className="block font-bold">
            本文
          </label>
          <textarea
            id="content"
            name="content"
            className="h-48 w-full rounded-md border-2 px-2 py-1"
            value={newContent}
            onChange={updateNewContent}
            placeholder="本文を記入してください"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="coverImageKey" className="block font-bold">
            カバーイメージ
          </label>
          <input
            id="imgSelector"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden={true}
            ref={hiddenFileInputRef}
          />
          <button
            onClick={() => hiddenFileInputRef.current?.click()}
            type="button"
            className="rounded-md bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600"
          >
            ファイルを選択
          </button>
          {coverImageUrl && (
            <div className="mt-2">
              <Image
                className="w-1/2 border-2 border-gray-300"
                src={coverImageUrl}
                alt="プレビュー画像"
                width={1024}
                height={1024}
                priority
              />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <div className="font-bold">カテゴリ</div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <button
                  onClick={() => toggleFolder(folder.id)}
                  className="flex w-full items-center justify-between p-3 hover:bg-gray-50"
                  type="button"
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faFolder}
                      className="mr-2 text-gray-500"
                    />
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={twMerge(
                      "transition-transform duration-200",
                      expandedFolders.includes(folder.id) ? "rotate-180" : ""
                    )}
                  />
                </button>
                {expandedFolders.includes(folder.id) && (
                  <div className="border-t border-gray-200 bg-gray-50 p-3">
                    <div className="flex flex-wrap gap-2">
                      {folder.categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          type="button"
                          className={twMerge(
                            "rounded-full px-3 py-1 text-sm transition-all",
                            selectedCategories.includes(category.id)
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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

          {/* 選択されたカテゴリの表示部分 */}
          {selectedCategories.length > 0 && (
            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2 text-sm text-gray-600">
                選択中のカテゴリ:
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((categoryId) => {
                  const category = folders
                    .flatMap((f) => f.categories)
                    .find((c) => c.id === categoryId);
                  if (!category) return null;
                  return (
                    <span
                      key={categoryId}
                      className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {category.name}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={isSubmitting}
          >
            記事を更新
          </button>

          <button
            type="button"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-red-500 text-white hover:bg-red-600"
            )}
            onClick={() => handleDelete(id)}
          >
            削除
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
