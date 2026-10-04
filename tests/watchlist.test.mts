import assert from "node:assert/strict";
import test from "node:test";

import {
  getDueWatchItems,
  parseWatchlist,
} from "../lib/editorial/watchlist.mts";
import { ContentValidationError } from "../lib/content/index.mts";

test("watchlist returns due and expired watching items", () => {
  const watchlist = parseWatchlist({
    schemaVersion: 1,
    items: [
      {
        articleId: "article-1",
        status: "watching",
        nextCheckAt: "2026-10-05T00:00:00Z",
        lastAttemptedAt: null,
        reason: "続報確認",
      },
      {
        articleId: "article-2",
        status: "paused",
        nextCheckAt: "2026-10-04T00:00:00Z",
        lastAttemptedAt: null,
        reason: "保留",
      },
    ],
  });

  assert.deepEqual(
    getDueWatchItems(watchlist, new Date("2026-10-05T01:00:00Z")).map((item) => item.articleId),
    ["article-1"],
  );
});

test("watchlist rejects duplicate article ids", () => {
  assert.throws(
    () => parseWatchlist({
      schemaVersion: 1,
      items: [
        { articleId: "article-1", status: "due", nextCheckAt: null, lastAttemptedAt: null, reason: "a" },
        { articleId: "article-1", status: "due", nextCheckAt: null, lastAttemptedAt: null, reason: "b" },
      ],
    }),
    (error: unknown) => error instanceof ContentValidationError && /duplicate articleId/.test(error.message),
  );
});
