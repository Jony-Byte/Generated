import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-sm font-semibold text-[#174EA6]">404</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">記事が見つかりません</h1>
      <p className="mt-4 max-w-xl text-lg leading-8 text-[#5E5E59]">
        公開されていない記事、削除されたURL、または存在しないページです。下書きはURLを直接入力しても表示しません。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 w-fit items-center font-semibold text-[#174EA6] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Generatedのトップへ
      </Link>
    </main>
  );
}
