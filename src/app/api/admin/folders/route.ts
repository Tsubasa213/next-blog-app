// app/api/admin/folders/route.ts
import prisma from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Folder } from "@prisma/client";

type RequestBody = {
  name: string;
};

export const POST = async (req: NextRequest) => {
  try {
    const { name }: RequestBody = await req.json();

    console.log("Creating folder with name:", name); // デバッグログを追加

    // 同じ名前のフォルダが存在するかチェック
    const existingFolder = await prisma.folder.findUnique({
      where: { name },
    });

    if (existingFolder) {
      console.log("Found existing folder:", existingFolder); // デバッグログを追加
      return NextResponse.json(existingFolder);
    }

    const folder: Folder = await prisma.folder.create({
      data: { name },
    });

    console.log("Created new folder:", folder); // デバッグログを追加
    return NextResponse.json(folder);
  } catch (error: any) {
    // エラーの詳細をコンソールに出力
    const err = error as any;
    console.error("Detailed error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      { error: `フォルダの作成に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const folders = await prisma.folder.findMany({
      include: {
        categories: true,
      },
    });
    return NextResponse.json(folders);
  } catch (error: any) {
    // エラーの詳細をコンソールに出力
    const err = error as any;
    console.error("Detailed error:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      { error: `フォルダの取得に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
};
