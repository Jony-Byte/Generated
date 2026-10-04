import { promises as fs } from "node:fs";
import path from "node:path";

import { ContentValidationError } from "../content/index.mts";

export type WatchStatus = "due" | "watching" | "paused" | "archived";

export interface WatchItem {
  articleId: string;
  status: WatchStatus;
  nextCheckAt: string | null;
  lastAttemptedAt: string | null;
  reason: string;
}

export interface Watchlist {
  schemaVersion: 1;
  items: WatchItem[];
}

function fail(context: string, message: string): never {
  throw new ContentValidationError(`${context}: ${message}`);
}

function timestamp(value: unknown, context: string): string | null {
  if (value === null) return null;
  if (typeof value !== "string" || !/(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) {
    fail(context, "ISO 8601 timestamp with timezone or null is required");
  }
  return value;
}

export function parseWatchlist(value: unknown, context = "watchlist"): Watchlist {
  if (typeof value !== "object" || value === null || Array.isArray(value)) fail(context, "object is required");
  const object = value as Record<string, unknown>;
  for (const key of Object.keys(object)) {
    if (key !== "schemaVersion" && key !== "items") fail(context, `unknown field "${key}"`);
  }
  if (object.schemaVersion !== 1) fail(`${context}.schemaVersion`, "expected 1");
  if (!Array.isArray(object.items)) fail(`${context}.items`, "array is required");

  const seen = new Set<string>();
  const items = object.items.map((value, index) => {
    const itemContext = `${context}.items[${index}]`;
    if (typeof value !== "object" || value === null || Array.isArray(value)) fail(itemContext, "object is required");
    const item = value as Record<string, unknown>;
    for (const key of Object.keys(item)) {
      if (!["articleId", "status", "nextCheckAt", "lastAttemptedAt", "reason"].includes(key)) fail(itemContext, `unknown field "${key}"`);
    }
    if (typeof item.articleId !== "string" || !/^[a-z0-9][a-z0-9._-]*$/.test(item.articleId)) fail(`${itemContext}.articleId`, "valid article id is required");
    if (seen.has(item.articleId)) fail(itemContext, `duplicate articleId "${item.articleId}"`);
    seen.add(item.articleId);
    if (!["due", "watching", "paused", "archived"].includes(String(item.status))) fail(`${itemContext}.status`, "invalid watch status");
    if (typeof item.reason !== "string" || item.reason.trim() === "") fail(`${itemContext}.reason`, "non-empty string is required");

    return {
      articleId: item.articleId,
      status: item.status as WatchStatus,
      nextCheckAt: timestamp(item.nextCheckAt, `${itemContext}.nextCheckAt`),
      lastAttemptedAt: timestamp(item.lastAttemptedAt, `${itemContext}.lastAttemptedAt`),
      reason: item.reason,
    };
  });

  return { schemaVersion: 1, items };
}

export async function loadWatchlist(
  filePath = path.join(process.cwd(), "editorial", "watchlist.json"),
): Promise<Watchlist> {
  const source = await fs.readFile(filePath, "utf8");
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(filePath, `invalid JSON: ${message}`);
  }
  return parseWatchlist(value, filePath);
}

export function getDueWatchItems(watchlist: Watchlist, now = new Date()): WatchItem[] {
  return watchlist.items.filter((item) =>
    item.status === "due" ||
    (item.status === "watching" && item.nextCheckAt !== null && Date.parse(item.nextCheckAt) <= now.getTime())
  );
}
