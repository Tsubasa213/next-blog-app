"use client";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/app/_hooks/useAuth";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Header: React.FC = () => {
  const router = useRouter();
  const { isLoading, session } = useAuth();
  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/");
  };

  return (
    <>
      {/* 背景アニメーション層 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 size-[200%]"
          style={{ transform: "translate(-25%, -25%)" }}
        >
          <div className="absolute size-full animate-[diagonal-scroll_40s_linear_infinite]">
            <div
              className="grid size-full"
              style={{
                gridTemplateColumns: "repeat(12, 1fr)",
                gridTemplateRows: "repeat(12, 1fr)",
                transform: "rotate(-45deg)",
                gap: "1rem",
              }}
            >
              {[...Array(144)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center opacity-50"
                  style={{
                    padding: "1.5rem",
                  }}
                >
                  <Image
                    src="/images/ramen.png"
                    alt="ramen"
                    width={60}
                    height={60}
                    className="size-20 object-contain"
                    priority
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* オーバーレイ層（背景を少し薄暗くする） */}
      <div className="fixed inset-0 -z-10 bg-white/80" />

      <header>
        <div className="bg-slate-800 py-2">
          <div
            className={twMerge(
              "mx-4 max-w-2xl md:mx-auto",
              "flex items-center justify-between",
              "text-lg font-bold text-white"
            )}
          >
            <div>
              <Link href="/">
                <FontAwesomeIcon icon={faStar} className="mr-1" />
                RAMEN-Blog
              </Link>
            </div>
            <div className="flex gap-x-6">
              <Link href="/about">About</Link>
            </div>
          </div>
        </div>
      </header>

      <style jsx global>{`
        @keyframes diagonal-scroll {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(-25%, 25%);
          }
        }
      `}</style>
    </>
  );
};

export default Header;
