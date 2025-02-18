import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Post } from "@prisma/client";
import { supabase } from "@/utils/supabase";

interface RequestBody {
  title: string;
  content: string;
  coverImageKey: string;
  categoryIds: string[];
}

export const revalidate = 0;

export async function DELETE(req: NextRequest) {
  try {
    // Authorization ヘッダーから Bearer トークンを取得
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "認証トークンが必要です" },
        { status: 401 }
      );
    }

    // "Bearer "の部分を除いてトークンを取得
    const token = authHeader.substring(7);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json(
        { error: "認証に失敗しました" },
        { status: 401 }
      );
    }

    // URLからpostIdを取得
    const url = new URL(req.url);
    const postId = url.searchParams.get("id");

    if (!postId) {
      return NextResponse.json(
        { error: "投稿IDが指定されていません" },
        { status: 400 }
      );
    }

    // まず投稿が存在するか確認
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { error: "指定された投稿が見つかりません" },
        { status: 404 }
      );
    }

    // トランザクションを使用して、関連するカテゴリーの関連付けも削除
    await prisma.$transaction(async (tx) => {
      // まず、PostCategoryの関連付けを削除
      await tx.postCategory.deleteMany({
        where: { postId },
      });

      // 次に、投稿自体を削除
      await tx.post.delete({
        where: { id: postId },
      });
    });

    return NextResponse.json({ message: "投稿を削除しました" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿の削除に失敗しました" },
      { status: 500 }
    );
  }
}

export const POST = async (req: NextRequest) => {
  const token = req.headers.get("Authorization") ?? "";
  const { data, error } = await supabase.auth.getUser(token);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 401 });

  try {
    const requestBody: RequestBody = await req.json();

    // 分割代入
    const { title, content, coverImageKey, categoryIds } = requestBody;

    // categoryIds で指定されるカテゴリがDB上に存在するか確認
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    });
    if (categories.length !== categoryIds.length) {
      return NextResponse.json(
        { error: "指定されたカテゴリのいくつかが存在しません" },
        { status: 400 } // 400: Bad Request
      );
    }

    // 投稿記事テーブルにレコードを追加
    const post: Post = await prisma.post.create({
      data: {
        title, // title: title の省略形であることに注意。以下も同様
        content,
        coverImageKey,
      },
    });

    // 中間テーブルにレコードを追加
    for (const categoryId of categoryIds) {
      await prisma.postCategory.create({
        data: {
          postId: post.id,
          categoryId: categoryId,
        },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の作成に失敗しました" },
      { status: 500 }
    );
  }
};
