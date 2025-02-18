// page.tsx
"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faFolder } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

type Folder = {
  id: string;
  name: string;
  categories: Category[];
};

const INITIAL_FOLDERS = [
  { name: "都道府県" },
  { name: "ラーメンの種類" },
  { name: "年代" },
  { name: "その他" },
];

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [newCategoryNameError, setNewCategoryNameError] = useState("");
  const [folders, setFolders] = useState<Folder[] | null>(null);

  // フォルダとカテゴリの一覧をフェッチする
  const fetchFoldersAndCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/categories", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const foldersData = await res.json();
      setFolders(foldersData);

      // 初回のみ、フォルダが存在しない場合は初期フォルダを作成
      if (foldersData.length === 0) {
        await initializeFolders();
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `データの取得に失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // 初期フォルダの作成
  const initializeFolders = async () => {
    try {
      for (const folder of INITIAL_FOLDERS) {
        await fetch("/api/admin/folders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(folder),
        });
      }
      await fetchFoldersAndCategories();
    } catch (error) {
      console.error("初期フォルダの作成に失敗しました:", error);
    }
  };

  useEffect(() => {
    fetchFoldersAndCategories();
  }, []);

  const isValidCategoryName = (name: string): string => {
    if (name.length < 2 || name.length > 16) {
      return "2文字以上16文字以内で入力してください。";
    }
    if (
      folders &&
      folders.some((folder) => folder.categories.some((c) => c.name === name))
    ) {
      return "同じ名前のカテゴリが既に存在します。";
    }
    return "";
  };

  const updateNewCategoryName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryNameError(isValidCategoryName(e.target.value));
    setNewCategoryName(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFolderId) {
      alert("フォルダを選択してください。");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName,
          folderId: selectedFolderId,
        }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      setNewCategoryName("");
      setSelectedFolderId("");
      await fetchFoldersAndCategories();
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの作成に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!folders) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">カテゴリの新規作成</div>

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
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="folder" className="block font-bold">
            フォルダ
          </label>
          <select
            id="folder"
            className="w-full rounded-md border-2 px-2 py-1"
            value={selectedFolderId}
            onChange={(e) => setSelectedFolderId(e.target.value)}
            required
          >
            <option value="">フォルダを選択してください</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            カテゴリ名
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="新しいカテゴリの名前を記入してください"
            value={newCategoryName}
            onChange={updateNewCategoryName}
            autoComplete="off"
            required
          />
          {newCategoryNameError && (
            <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="mr-0.5"
              />
              <div>{newCategoryNameError}</div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={
              isSubmitting ||
              newCategoryNameError !== "" ||
              newCategoryName === "" ||
              !selectedFolderId
            }
          >
            カテゴリを作成
          </button>
        </div>
      </form>

      <div className="mb-2 text-2xl font-bold">カテゴリ一覧</div>
      {folders.length === 0 ? (
        <div className="text-gray-500">（フォルダが作成されていません）</div>
      ) : (
        <div className="space-y-4">
          {folders.map((folder) => (
            <div key={folder.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center text-lg font-bold">
                <FontAwesomeIcon
                  icon={faFolder}
                  className="mr-2 text-gray-500"
                />
                {folder.name}
              </div>
              {folder.categories.length === 0 ? (
                <div className="text-gray-500">
                  （カテゴリはまだありません）
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {folder.categories.map((category) => (
                    <div
                      key={category.id}
                      className={twMerge(
                        "rounded-md px-2 py-0.5",
                        "border border-slate-400 text-slate-500"
                      )}
                    >
                      <Link href={`/admin/categories/${category.id}`}>
                        {category.name}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
