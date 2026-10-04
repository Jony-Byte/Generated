import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/news/ArticleBody";
import { loadContent } from "@/lib/content/index.mts";
import {
  CATEGORY_LABELS,
  findPublishedArticle,
  formatJstDateTime,
  getDisplaySources,
  getPublishedArticles,
} from "@/lib/content/presentation.mts";

export const dynamicParams = false;

export async function generateStaticParams() {
  const index = await loadContent();
  return getPublishedArticles(index).map((item) => ({
    slug: item.article.frontmatter.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const index = await loadContent();
  const item = findPublishedArticle(index, slug);
  if (!item) return { title: "記事が見つかりません" };
  return {
    title: item.article.frontmatter.title,
    description: item.article.frontmatter.description,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const index = await loadContent();
  const item = findPublishedArticle(index, slug);
  if (!item) notFound();

  const metadata = item.article.frontmatter;
  const sources = getDisplaySources(item);
  const publishedAt = formatJstDateTime(metadata.publishedAt);
  const updatedAt = formatJstDateTime(metadata.updatedAt);
  const checkedAt = formatJstDateTime(metadata.lastCheckedAt);

  return (
    <main className="mx-auto w-full max-w-[760px] px-5 pb-24 pt-8 sm:px-8 sm:pt-12">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-[#174EA6] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        ← Generated
      </Link>

      <article className="mt-8">
        <header>
          <p className="text-sm font-semibold text-[#174EA6]">
            {CATEGORY_LABELS[metadata.category] ?? metadata.category}
          </p>
          <h1 className="mt-3 text-[clamp(2rem,7vw,3rem)] font-bold leading-[1.2] tracking-[-0.035em] text-[#171717]">
            {metadata.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#4A4A46]">{metadata.description}</p>

          <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-[#5E5E59]">
            <div className="flex gap-2">
              <dt>公開</dt>
              <dd>{publishedAt}</dd>
            </div>
            {updatedAt ? (
              <div className="flex gap-2">
                <dt>更新</dt>
                <dd>{updatedAt}</dd>
              </div>
            ) : null}
            <div className="flex gap-2">
              <dt>最終確認</dt>
              <dd>{checkedAt}</dd>
            </div>
          </dl>
        </header>

        <aside className="mt-8 border-y border-[#DADAD4] py-5 text-sm leading-7 text-[#4A4A46]">
          <p className="font-semibold text-[#171717]">Generated編集部 / Jony（AI）</p>
          <p className="mt-1">
            この記事はAIが情報を収集・確認し、作成しています。人間による事前確認は行っていません。ハルシネーションを含む誤りが残る可能性があります。重要な情報はリンク先の原典もご確認ください。
          </p>
        </aside>

        <section className="mt-10 rounded-2xl bg-[#F1F1EC] p-5 sm:p-6" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="text-sm font-bold tracking-wide text-[#171717]">
            3行で分かること
          </h2>
          <ul className="mt-3 space-y-2 text-base leading-7 text-[#272724]">
            {metadata.summary.map((summary) => (
              <li key={summary.text} className="flex gap-3">
                <span aria-hidden="true">•</span>
                <span>{summary.text}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12" aria-label="記事本文">
          <ArticleBody markdown={item.article.body} />
        </section>

        {metadata.changes.length > 0 ? (
          <section className="mt-16 border-t border-[#DADAD4] pt-8" aria-labelledby="history-heading">
            <h2 id="history-heading" className="text-2xl font-bold tracking-tight text-[#171717]">
              更新履歴
            </h2>
            <ol className="mt-5 space-y-4">
              {metadata.changes
                .slice()
                .reverse()
                .map((change) => (
                  <li key={`${change.at}-${change.type}`} className="text-base leading-7">
                    <p className="font-semibold text-[#171717]">
                      {change.type === "correction"
                        ? "訂正"
                        : change.type === "withdrawal"
                          ? "撤回"
                          : "更新"}
                      <span className="ml-2 font-normal text-[#5E5E59]">
                        {formatJstDateTime(change.at)}
                      </span>
                    </p>
                    <p className="mt-1 text-[#4A4A46]">{change.description}</p>
                  </li>
                ))}
            </ol>
          </section>
        ) : null}

        <section className="mt-16 border-t border-[#DADAD4] pt-8" aria-labelledby="sources-heading">
          <h2 id="sources-heading" className="text-2xl font-bold tracking-tight text-[#171717]">
            原典
          </h2>
          <ol className="mt-5 space-y-6">
            {sources.map((source) => (
              <li key={source.id} className="text-base leading-7">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#174EA6] underline decoration-[#A7BEE1] underline-offset-4 hover:decoration-[#174EA6] focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  {source.title}
                </a>
                <p className="mt-1 text-sm text-[#5E5E59]">
                  {source.publisher}
                  {source.publishedAt ? `・公表 ${formatJstDateTime(source.publishedAt)}` : ""}
                  {`・確認 ${formatJstDateTime(source.checkedAt)}`}
                </p>
                <p className="mt-1 text-sm leading-6 text-[#5E5E59]">
                  {source.verificationMethod}
                  {source.checkedInScope ? "。この記事の最終確認範囲に含まれます。" : "。"}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </main>
  );
}
