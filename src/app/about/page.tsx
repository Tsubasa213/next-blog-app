"use client";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

const Page: React.FC = () => {
  return (
    <main>
      <div className="mb-5 text-2xl font-bold">About</div>

      <div
        className={twMerge(
          "mx-auto mb-5 w-full md:w-2/3",
          "flex justify-center"
        )}
      >
        <Image
          src="/images/avatar.png"
          alt="Example Image"
          width={350}
          height={350}
          priority
          className="rounded-full border-4 border-slate-500 p-1.5"
        />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 text-gray-700">
        <div className="flex items-center space-x-2">
          <Image
            src="/images/ramen2.png"
            alt="経歴"
            width={24}
            height={24}
            className="inline-block"
          />
          <h2 className="text-lg font-semibold">経歴</h2>
        </div>
        <p>
          私は情報工学を学ぶ学生で、web開発とラーメンを愛する者です。現在、Next.jsやReactを中心としたフルスタック開発に挑戦しています。常に新しい技術を学び、面白いプロジェクトを創り出すことに情熱を注いでいます。
        </p>

        <div className="flex items-center space-x-2">
          <Image
            src="/images/ramen2.png"
            alt="興味"
            width={24}
            height={24}
            className="inline-block"
          />
          <h2 className="text-lg font-semibold">興味・関心</h2>
        </div>
        <p>
          Web開発、UI/UXデザイン、フロントエンド技術に特に興味があります。ラーメン文化の探求も私の大切な趣味の一つで、様々な地域の個性豊かなラーメンを味わうことを楽しんでいます。
        </p>

        <div className="flex items-center space-x-2">
          <Image
            src="/images/ramen2.png"
            alt="スキル"
            width={24}
            height={24}
            className="inline-block"
          />
          <h2 className="text-lg font-semibold">スキル</h2>
        </div>
        <ul className="list-inside list-disc space-y-1 pl-4">
          <li>プログラミング言語: TypeScript, JavaScript, Python</li>
          <li>フレームワーク: Next.js, React, Tailwind CSS</li>
          <li>開発ツール: Git, VS Code, Docker</li>
        </ul>

        <div className="flex items-center space-x-2">
          <Image
            src="/images/ramen2.png"
            alt="目標"
            width={24}
            height={24}
            className="inline-block"
          />
          <h2 className="text-lg font-semibold">将来の目標</h2>
        </div>
        <p>
          技術の進化に常に適応しながら、ユーザーに価値を提供できる革新的なウェブアプリケーションを開発することを目指しています。また、技術コミュニティに貢献し、知識を共有していきたいと考えています。
        </p>

        <div className="mt-6 flex justify-end">
          <Link
            href="https://tsubasa213.github.io/portfolio/"
            className="flex items-center text-blue-600 transition-colors hover:text-blue-800"
          >
            portfolioへ
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="ml-2 size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <br />
        <br />
      </div>
    </main>
  );
};

export default Page;
