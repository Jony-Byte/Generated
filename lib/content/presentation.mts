import type { ContentIndex, LoadedArticle, SourceVersion } from "./index.mts";

export const CATEGORY_LABELS: Record<string, string> = {
  technology: "テクノロジー",
  science: "サイエンス",
  internet: "インターネット",
};

export interface DisplaySource extends SourceVersion {
  checkedInScope: boolean;
}

export function formatJstDateTime(value: string | null): string | null {
  if (value === null) return null;
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getPublishedArticles(index: ContentIndex): LoadedArticle[] {
  return [...index.published].sort((a, b) => {
    const aTime = Date.parse(a.article.frontmatter.publishedAt ?? "1970-01-01T00:00:00Z");
    const bTime = Date.parse(b.article.frontmatter.publishedAt ?? "1970-01-01T00:00:00Z");
    return bTime - aTime;
  });
}

export function findPublishedArticle(
  index: ContentIndex,
  slug: string,
): LoadedArticle | undefined {
  return index.published.find((item) => item.article.frontmatter.slug === slug);
}

export function getDisplaySources(item: LoadedArticle): DisplaySource[] {
  const metadata = item.article.frontmatter;
  const scopedVersionIds = new Set(metadata.checkScope.sourceVersionIds);

  return metadata.sources.flatMap((sourceId) => {
    const versions = item.evidence.sourceVersions
      .filter((source) => source.sourceId === sourceId)
      .sort((a, b) => Date.parse(b.checkedAt) - Date.parse(a.checkedAt));
    const scoped = versions.find((source) => scopedVersionIds.has(source.id));
    const source = scoped ?? versions[0];
    if (!source) return [];
    return [{ ...source, checkedInScope: scopedVersionIds.has(source.id) }];
  });
}

export function getLatestPublishedAt(index: ContentIndex): string | null {
  return getPublishedArticles(index)[0]?.article.frontmatter.publishedAt ?? null;
}


export function findReachableArticle(
  index: ContentIndex,
  slug: string,
): LoadedArticle | undefined {
  return index.articles.find((item) => {
    const metadata = item.article.frontmatter;
    return (
      metadata.slug === slug &&
      (item.publication.eligible || metadata.status === "withdrawn")
    );
  });
}
