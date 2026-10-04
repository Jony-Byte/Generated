import assert from "node:assert/strict";
import test from "node:test";

import type { ContentIndex, LoadedArticle } from "../lib/content/index.mts";
import {
  findPublishedArticle,
  findReachableArticle,
  getDisplaySources,
  getLatestPublishedAt,
  getPublishedArticles,
} from "../lib/content/presentation.mts";

function loadedArticle(
  slug: string,
  publishedAt: string,
  eligible: boolean,
): LoadedArticle {
  return {
    article: {
      filePath: `${slug}.md`,
      body: "本文",
      frontmatter: {
        schemaVersion: 1,
        id: `id-${slug}`,
        slug,
        storyKey: `story-${slug}`,
        status: eligible ? "published" : "draft",
        title: slug,
        description: "description",
        category: "technology",
        tags: [],
        createdAt: publishedAt,
        publishedAt: eligible ? publishedAt : null,
        updatedAt: null,
        lastCheckedAt: eligible ? publishedAt : null,
        checkScope: { sourceVersionIds: ["sv-checked"], claimIds: ["claim-1"] },
        checkStatus: eligible ? "complete" : "unchecked",
        summary: [{ text: "要点", claimIds: ["claim-1"] }],
        evidenceVersion: "ev1",
        tracking: "stable",
        author: "generated-jony",
        sources: ["source-1"],
        image: null,
        changes: [],
      },
    },
    evidence: {
      schemaVersion: 1,
      articleId: `id-${slug}`,
      version: "ev1",
      sourceVersions: [
        {
          id: "sv-old",
          sourceId: "source-1",
          title: "old",
          publisher: "Example",
          url: "https://example.com/old",
          publishedAt: null,
          retrievedAt: "2026-10-01T00:00:00Z",
          checkedAt: "2026-10-01T00:00:00Z",
          kind: "web",
          verificationMethod: "old",
          versionIdentifier: "old",
          usageNotes: "",
        },
        {
          id: "sv-checked",
          sourceId: "source-1",
          title: "checked",
          publisher: "Example",
          url: "https://example.com/checked",
          publishedAt: null,
          retrievedAt: "2026-10-02T00:00:00Z",
          checkedAt: "2026-10-02T00:00:00Z",
          kind: "web",
          verificationMethod: "checked",
          versionIdentifier: "checked",
          usageNotes: "",
        },
      ],
      evidence: [],
      claims: [],
      events: [],
      verification: {
        articleRevision: "0".repeat(64),
        verifiedAt: "2026-10-02T00:00:00Z",
        verifier: "generated-jony",
        result: "passed",
      },
    },
    publication: {
      eligible,
      reasons: eligible ? [] : ["not published"],
      revision: "0".repeat(64),
    },
  };
}

test("presentation only exposes the published index and sorts newest first", () => {
  const older = loadedArticle("older", "2026-10-01T00:00:00Z", true);
  const newer = loadedArticle("newer", "2026-10-03T00:00:00Z", true);
  const draft = loadedArticle("draft", "2026-10-04T00:00:00Z", false);
  const index: ContentIndex = {
    articles: [older, newer, draft],
    published: [older, newer],
  };

  assert.deepEqual(
    getPublishedArticles(index).map((item) => item.article.frontmatter.slug),
    ["newer", "older"],
  );
  assert.equal(findPublishedArticle(index, "draft"), undefined);
  assert.equal(findPublishedArticle(index, "newer"), newer);
  assert.equal(getLatestPublishedAt(index), "2026-10-03T00:00:00Z");
});

test("source display prefers the exact source version in the checked scope", () => {
  const item = loadedArticle("article", "2026-10-03T00:00:00Z", true);
  const sources = getDisplaySources(item);

  assert.equal(sources.length, 1);
  assert.equal(sources[0]?.id, "sv-checked");
  assert.equal(sources[0]?.checkedInScope, true);
});


test("withdrawn articles remain reachable by slug but stay out of published lists", () => {
  const withdrawn = {
    article: {
      frontmatter: {
        slug: "withdrawn-news",
        status: "withdrawn",
        publishedAt: "2026-10-04T12:00:00Z",
      },
    },
    publication: { eligible: false },
  } as unknown as ContentIndex["articles"][number];

  const index = {
    articles: [withdrawn],
    published: [],
  } as ContentIndex;

  assert.equal(findPublishedArticle(index, "withdrawn-news"), undefined);
  assert.equal(findReachableArticle(index, "withdrawn-news"), withdrawn);
  assert.deepEqual(getPublishedArticles(index), []);
});
