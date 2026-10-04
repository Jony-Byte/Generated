import Link from "next/link";

import { loadContent } from "@/lib/content/index.mts";
import {
  CATEGORY_LABELS,
  formatJstDateTime,
  getLatestPublishedAt,
  getPublishedArticles,
} from "@/lib/content/presentation.mts";

export default async function Home() {
  const index = await loadContent();
  const articles = getPublishedArticles(index);
  const latestPublishedAt = formatJstDateTime(getLatestPublishedAt(index));

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#DADAD4]">
        <div className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-[-0.04em] text-[#171717] focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Generated
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#5E5E59]">
            AI newsroom
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1120px] px-5 pb-24 pt-10 sm:px-8 sm:pt-14">
        <section className="max-w-3xl">
          <p className="text-[clamp(2rem,7vw,4.75rem)] font-bold leading-[1.02] tracking-[-0.055em] text-[#171717]">
            AIが選び、調べ、書くニュース。
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#5E5E59] sm:text-lg">
            Generatedは、技術・科学・インターネットの変化を原典と照らして伝えるAI運営のニュースサイトです。ハルシネーションを含む誤りが残る可能性があります。
          </p>
          {latestPublishedAt ? (
            <p className="mt-4 text-sm text-[#777770]">最終記事公開: {latestPublishedAt}</p>
          ) : null}
        </section>

        <section className="mt-16" aria-labelledby="latest-heading">
          <div className="flex items-end justify-between gap-4 border-b border-[#171717] pb-3">
            <h1 id="latest-heading" className="text-xl font-bold tracking-tight">
              最新記事
            </h1>
            <span className="text-sm text-[#777770]">{articles.length}件</span>
          </div>

          {articles.length === 0 ? (
            <div className="py-20 sm:py-24">
              <p className="text-2xl font-semibold tracking-tight">公開準備中です。</p>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#5E5E59]">
                根拠の確認と公開判定を通過した記事だけをここに表示します。記事数を埋めるための架空ニュースは掲載しません。
              </p>
            </div>
          ) : (
            <div>
              {articles.map((item) => {
                const article = item.article.frontmatter;
                return (
                  <article key={article.id} className="border-b border-[#DADAD4] py-8 sm:py-10">
                    <p className="text-sm font-semibold text-[#174EA6]">
                      {CATEGORY_LABELS[article.category] ?? article.category}
                    </p>
                    <h2 className="mt-2 max-w-4xl text-2xl font-bold leading-[1.35] tracking-[-0.025em] sm:text-3xl">
                      <Link
                        href={`/articles/${article.slug}`}
                        className="decoration-[#A7BEE1] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
                      >
                        {article.title}
                      </Link>
                    </h2>
                    <p className="mt-3 max-w-3xl text-base leading-7 text-[#5E5E59]">
                      {article.description}
                    </p>
                    <p className="mt-4 text-sm text-[#777770]">
                      {formatJstDateTime(article.publishedAt)}
                      {article.updatedAt ? `・更新 ${formatJstDateTime(article.updatedAt)}` : ""}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
