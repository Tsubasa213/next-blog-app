// app/api/admin/folders/route.tsroute.ts
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Category } from "@prisma/client";

type RequestBody = {
  name: string;
  folderId: string;
};

export const revalidate = 0;

export const POST = async (req: NextRequest) => {
  try {
    const { name, folderId }: RequestBody = await req.json();
    const category: Category = await prisma.category.create({
      data: {
        name,
        folderId,
      },
      include: {
        folder: true,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの作成に失敗しました" },
      { status: 500 }
    );
  }
};

// フォルダ一覧を取得するエンドポイントを追加
export const GET = async () => {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        categories: true,
      },
    });
    return NextResponse.json(folders);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "フォルダの取得に失敗しました" },
      { status: 500 }
    );
  }
};
