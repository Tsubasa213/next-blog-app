"use client";

import Image from "next/image";
import ramenImage from "./ramen.png";

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景のアニメーション用コンテナ */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background:
            "linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9))",
        }}
      >
        <div className="absolute inset-0 -right-[200%] -top-[200%] size-[400%]">
          <div className="animate-diagonal-scroll absolute size-full">
            <div
              className="grid size-full"
              style={{
                gridTemplateColumns: "repeat(20, 1fr)",
                gridTemplateRows: "repeat(20, 1fr)",
                transform: "rotate(-45deg)",
              }}
            >
              {[...Array(400)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center opacity-30"
                >
                  <Image
                    src={ramenImage}
                    alt="ramen"
                    width={60}
                    height={60}
                    className="size-16 object-contain"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 p-8">
        <h1 className="text-4xl font-bold">テストです</h1>
      </div>

      <style jsx global>{`
        @keyframes diagonal-scroll {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-50%, 50%);
          }
        }

        .animate-diagonal-scroll {
          animation: diagonal-scroll 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
