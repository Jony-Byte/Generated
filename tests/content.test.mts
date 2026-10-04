import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  ContentValidationError,
  computeArticleRevision,
  getPublicationDecision,
  getArticleUpdateDecision,
  loadContent,
  parseArticleFile,
  type EvidencePackage,
} from "../lib/content/index.mts";

const NOW = new Date("2026-10-04T14:30:00Z");

function articleMetadata(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    schemaVersion: 1,
    id: "article-001",
    slug: "example-news",
    storyKey: "example-2026-10-04",
    status: "published",
    title: "検証用の記事",
    description: "Generatedの記事契約を検証するためのテストデータです。",
    category: "technology",
    tags: ["test"],
    createdAt: "2026-10-04T22:00:00+09:00",
    publishedAt: "2026-10-04T22:10:00+09:00",
    updatedAt: null,
    lastCheckedAt: "2026-10-04T22:05:00+09:00",
    checkScope: {
      sourceVersionIds: ["source-v1"],
      claimIds: ["claim-1"],
    },
    checkStatus: "complete",
    summary: [
      {
        text: "これは検証済みの要点です。",
        claimIds: ["claim-1"],
      },
    ],
    evidenceVersion: "evidence-v1",
    tracking: "stable",
    author: "generated-jony",
    sources: ["source-1"],
    image: null,
    changes: [],
    ...overrides,
  };
}

function articleSource(
  overrides: Record<string, unknown> = {},
  body = "本文です。一次資料に対応する検証用テキストです。",
): string {
  return `---\n${JSON.stringify(articleMetadata(overrides), null, 2)}\n---\n\n${body}\n`;
}

function evidencePackage(
  articleRevision: string,
  overrides: Partial<EvidencePackage> = {},
): EvidencePackage {
  return {
    schemaVersion: 1,
    articleId: "article-001",
    version: "evidence-v1",
    sourceVersions: [
      {
        id: "source-v1",
        sourceId: "source-1",
        title: "Official test source",
        publisher: "Example",
        url: "https://example.com/source",
        publishedAt: "2026-10-04T12:00:00Z",
        retrievedAt: "2026-10-04T13:00:00Z",
        checkedAt: "2026-10-04T13:05:00Z",
        kind: "web",
        verificationMethod: "Page text checked directly",
        versionIdentifier: "content-sha256:test-v1",
        usageNotes: "Test fixture; no source text is reproduced.",
      },
    ],
    evidence: [
      {
        id: "evidence-1",
        sourceVersionId: "source-v1",
        locator: "section: announcement",
        summary: "The source supports the fixture claim.",
        scope: "Only the existence of the test announcement.",
      },
    ],
    claims: [
      {
        id: "claim-1",
        statement: "The fixture announcement exists.",
        appliesAt: "2026-10-04T12:00:00Z",
        region: null,
        productVersion: null,
        status: "supported",
        evidence: [{ evidenceId: "evidence-1", relation: "support" }],
      },
    ],
    events: [
      {
        id: "event-1",
        occurredAt: "2026-10-04T12:00:00Z",
        precision: "exact",
        checkedAt: "2026-10-04T13:05:00Z",
        claimIds: ["claim-1"],
      },
    ],
    verification: {
      articleRevision,
      verifiedAt: "2026-10-04T13:10:00Z",
      verifier: "generated-jony",
      result: "passed",
    },
    ...overrides,
  };
}

async function withContentRoot(
  run: (root: string) => Promise<void>,
): Promise<void> {
  const root = await mkdtemp(path.join(os.tmpdir(), "generated-content-"));
  try {
    await mkdir(path.join(root, "articles", "2026", "10"), {
      recursive: true,
    });
    await mkdir(path.join(root, "evidence"), { recursive: true });
    await run(root);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

async function writeFixture(
  root: string,
  source: string,
  evidenceOverrides: Partial<EvidencePackage> = {},
  filename = "example-news.md",
): Promise<void> {
  const article = parseArticleFile(source, filename);
  const revision = computeArticleRevision(article);
  const evidence = evidencePackage(revision, evidenceOverrides);

  await writeFile(
    path.join(root, "articles", "2026", "10", filename),
    source,
    "utf8",
  );
  await writeFile(
    path.join(root, "evidence", `${article.frontmatter.id}.json`),
    JSON.stringify(evidence, null, 2),
    "utf8",
  );
}

test("a completely checked published revision is eligible", async () => {
  await withContentRoot(async (root) => {
    await writeFixture(root, articleSource());

    const index = await loadContent(root, NOW);

    assert.equal(index.articles.length, 1);
    assert.equal(index.published.length, 1);
    assert.equal(index.published[0]?.publication.eligible, true);
  });
});

test("drafts never enter the published index", async () => {
  await withContentRoot(async (root) => {
    const source = articleSource({
      status: "draft",
      publishedAt: null,
      lastCheckedAt: null,
      checkStatus: "unchecked",
    });
    await writeFixture(root, source);

    const index = await loadContent(root, NOW);

    assert.equal(index.articles.length, 1);
    assert.equal(index.published.length, 0);
    assert.match(
      index.articles[0]?.publication.reasons.join("\n") ?? "",
      /status is draft/,
    );
  });
});

test("an evidence version mismatch blocks publication", () => {
  const article = parseArticleFile(articleSource(), "example-news.md");
  const revision = computeArticleRevision(article);
  const evidence = evidencePackage(revision, { version: "evidence-v2" });

  const decision = getPublicationDecision(article, evidence, NOW);

  assert.equal(decision.eligible, false);
  assert.match(decision.reasons.join("\n"), /does not match/);
});

test("editing the body invalidates a previously verified revision", () => {
  const original = parseArticleFile(articleSource(), "example-news.md");
  const originalRevision = computeArticleRevision(original);
  const evidence = evidencePackage(originalRevision);

  const edited = parseArticleFile(
    articleSource({}, "本文を書き換えました。検証はまだやり直していません。"),
    "example-news.md",
  );
  const decision = getPublicationDecision(edited, evidence, NOW);

  assert.equal(decision.eligible, false);
  assert.match(
    decision.reasons.join("\n"),
    /verified article revision does not match current article/,
  );
});

test("uncertain claims in the checked scope block publication", () => {
  const article = parseArticleFile(articleSource(), "example-news.md");
  const revision = computeArticleRevision(article);
  const evidence = evidencePackage(revision, {
    claims: [
      {
        id: "claim-1",
        statement: "The fixture announcement exists.",
        appliesAt: "2026-10-04T12:00:00Z",
        region: null,
        productVersion: null,
        status: "uncertain",
        evidence: [{ evidenceId: "evidence-1", relation: "support" }],
      },
    ],
  });

  const decision = getPublicationDecision(article, evidence, NOW);

  assert.equal(decision.eligible, false);
  assert.match(decision.reasons.join("\n"), /claim "claim-1" is uncertain/);
});

test("duplicate slugs are rejected across the repository", async () => {
  await withContentRoot(async (root) => {
    await writeFixture(root, articleSource(), {}, "first.md");

    const secondSource = articleSource({
      id: "article-002",
      storyKey: "another-story-2026-10-04",
      sources: ["source-1"],
    });
    const secondArticle = parseArticleFile(secondSource, "second.md");
    const secondEvidence = evidencePackage(computeArticleRevision(secondArticle), {
      articleId: "article-002",
    });

    await writeFile(
      path.join(root, "articles", "2026", "10", "second.md"),
      secondSource,
      "utf8",
    );
    await writeFile(
      path.join(root, "evidence", "article-002.json"),
      JSON.stringify(secondEvidence, null, 2),
      "utf8",
    );

    await assert.rejects(
      () => loadContent(root, NOW),
      (error: unknown) =>
        error instanceof ContentValidationError &&
        /duplicate article slug/.test(error.message),
    );
  });
});

test("timestamps without a timezone are rejected", () => {
  assert.throws(
    () =>
      parseArticleFile(
        articleSource({ createdAt: "2026-10-04T22:00:00" }),
        "bad-date.md",
      ),
    (error: unknown) =>
      error instanceof ContentValidationError &&
      /timestamp with timezone/.test(error.message),
  );
});


test("published updates preserve identity and first publication time", () => {
  const previous = parseArticleFile(articleSource(), "previous.md");
  const next = parseArticleFile(
    articleSource(
      {
        updatedAt: "2026-10-04T22:20:00+09:00",
        changes: [{
          type: "update",
          at: "2026-10-04T22:20:00+09:00",
          description: "続報を反映",
          sourceIds: ["source-1"],
        }],
      },
      "続報を反映した本文です。",
    ),
    "next.md",
  );

  assert.equal(getArticleUpdateDecision(previous, next).valid, true);

  const moved = parseArticleFile(
    articleSource({ slug: "moved-news", updatedAt: "2026-10-04T22:20:00+09:00" }, "更新本文"),
    "moved.md",
  );
  assert.match(getArticleUpdateDecision(previous, moved).reasons.join("\n"), /slug must not change/);

  const republished = parseArticleFile(
    articleSource({ publishedAt: "2026-10-04T22:30:00+09:00", updatedAt: "2026-10-04T22:30:00+09:00" }, "更新本文"),
    "republished.md",
  );
  assert.match(getArticleUpdateDecision(previous, republished).reasons.join("\n"), /first publication timestamp/);
});

test("partial rechecks cannot advance the article-wide lastCheckedAt", () => {
  const previous = parseArticleFile(articleSource(), "previous.md");
  const partial = parseArticleFile(
    articleSource({
      checkStatus: "partial",
      lastCheckedAt: "2026-10-04T22:20:00+09:00",
    }),
    "partial.md",
  );

  const decision = getArticleUpdateDecision(previous, partial);
  assert.equal(decision.valid, false);
  assert.match(decision.reasons.join("\n"), /must not advance lastCheckedAt/);
});

test("withdrawal requires an explicit withdrawal history entry", () => {
  const previous = parseArticleFile(articleSource(), "previous.md");
  const withdrawn = parseArticleFile(
    articleSource({ status: "withdrawn" }),
    "withdrawn.md",
  );

  assert.match(
    getArticleUpdateDecision(previous, withdrawn).reasons.join("\n"),
    /withdrawal change entry/,
  );
});
