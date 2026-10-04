import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export const ARTICLE_SCHEMA_VERSION = 1 as const;
export const EVIDENCE_SCHEMA_VERSION = 1 as const;

export type ArticleStatus =
  | "draft"
  | "held"
  | "ready"
  | "published"
  | "withdrawn";

export type CheckStatus = "complete" | "partial" | "failed" | "unchecked";
export type TrackingStatus = "developing" | "stable" | "archived";
export type ClaimStatus =
  | "supported"
  | "attributed"
  | "uncertain"
  | "contradicted";
export type EvidenceRelation = "support" | "contradict" | "context";
export type SourceKind =
  | "web"
  | "spec"
  | "github"
  | "pdf"
  | "video"
  | "image"
  | "social";

export interface ArticleSummaryItem {
  text: string;
  claimIds: string[];
}

export interface ArticleCheckScope {
  sourceVersionIds: string[];
  claimIds: string[];
}

export interface ArticleImage {
  path: string;
  alt: string;
  sourceUrl: string;
  credit: string;
  license: string;
}

export interface ArticleChange {
  type: "update" | "correction" | "withdrawal";
  at: string;
  description: string;
  sourceIds: string[];
}

export interface ArticleFrontmatter {
  schemaVersion: 1;
  id: string;
  slug: string;
  storyKey: string;
  status: ArticleStatus;
  title: string;
  description: string;
  category: string;
  tags: string[];
  createdAt: string;
  publishedAt: string | null;
  updatedAt: string | null;
  lastCheckedAt: string | null;
  checkScope: ArticleCheckScope;
  checkStatus: CheckStatus;
  summary: ArticleSummaryItem[];
  evidenceVersion: string;
  tracking: TrackingStatus;
  author: "generated-jony";
  sources: string[];
  image: ArticleImage | null;
  changes: ArticleChange[];
}

export interface SourceVersion {
  id: string;
  sourceId: string;
  title: string;
  publisher: string;
  url: string;
  publishedAt: string | null;
  retrievedAt: string;
  checkedAt: string;
  kind: SourceKind;
  verificationMethod: string;
  versionIdentifier: string;
  usageNotes: string;
}

export interface EvidenceItem {
  id: string;
  sourceVersionId: string;
  locator: string;
  summary: string;
  scope: string;
}

export interface ClaimEvidenceReference {
  evidenceId: string;
  relation: EvidenceRelation;
}

export interface Claim {
  id: string;
  statement: string;
  appliesAt: string | null;
  region: string | null;
  productVersion: string | null;
  status: ClaimStatus;
  evidence: ClaimEvidenceReference[];
}

export interface EvidenceEvent {
  id: string;
  occurredAt: string | null;
  precision: "exact" | "day" | "month" | "unknown";
  checkedAt: string;
  claimIds: string[];
}

export interface EvidenceVerification {
  articleRevision: string;
  verifiedAt: string;
  verifier: "generated-jony";
  result: "passed" | "failed";
}

export interface EvidencePackage {
  schemaVersion: 1;
  articleId: string;
  version: string;
  sourceVersions: SourceVersion[];
  evidence: EvidenceItem[];
  claims: Claim[];
  events: EvidenceEvent[];
  verification: EvidenceVerification;
}

export interface ArticleDocument {
  frontmatter: ArticleFrontmatter;
  body: string;
  filePath: string;
}

export interface PublicationDecision {
  eligible: boolean;
  reasons: string[];
  revision: string;
}

export interface LoadedArticle {
  article: ArticleDocument;
  evidence: EvidencePackage;
  publication: PublicationDecision;
}

export interface ContentIndex {
  articles: LoadedArticle[];
  published: LoadedArticle[];
}

export class ContentValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentValidationError";
  }
}

const ARTICLE_FIELDS = new Set([
  "schemaVersion",
  "id",
  "slug",
  "storyKey",
  "status",
  "title",
  "description",
  "category",
  "tags",
  "createdAt",
  "publishedAt",
  "updatedAt",
  "lastCheckedAt",
  "checkScope",
  "checkStatus",
  "summary",
  "evidenceVersion",
  "tracking",
  "author",
  "sources",
  "image",
  "changes",
]);

const EVIDENCE_FIELDS = new Set([
  "schemaVersion",
  "articleId",
  "version",
  "sourceVersions",
  "evidence",
  "claims",
  "events",
  "verification",
]);

function fail(context: string, message: string): never {
  throw new ContentValidationError(`${context}: ${message}`);
}

function asObject(value: unknown, context: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    fail(context, "object is required");
  }
  return value as Record<string, unknown>;
}

function rejectUnknownFields(
  object: Record<string, unknown>,
  allowed: Set<string>,
  context: string,
): void {
  for (const key of Object.keys(object)) {
    if (!allowed.has(key)) {
      fail(context, `unknown field "${key}"`);
    }
  }
}

function asString(value: unknown, context: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(context, "non-empty string is required");
  }
  return value;
}

function asNullableString(value: unknown, context: string): string | null {
  if (value === null) return null;
  return asString(value, context);
}

function asArray(value: unknown, context: string): unknown[] {
  if (!Array.isArray(value)) {
    fail(context, "array is required");
  }
  return value;
}

function asStringArray(value: unknown, context: string): string[] {
  const values = asArray(value, context).map((item, index) =>
    asString(item, `${context}[${index}]`),
  );
  assertUnique(values, context);
  return values;
}

function asLiteral<T extends string>(
  value: unknown,
  allowed: readonly T[],
  context: string,
): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    fail(context, `expected one of: ${allowed.join(", ")}`);
  }
  return value as T;
}

function assertUnique(values: string[], context: string): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) fail(context, `duplicate value "${value}"`);
    seen.add(value);
  }
}

function assertUniqueBy<T>(
  values: T[],
  getKey: (value: T) => string,
  context: string,
): void {
  const seen = new Set<string>();
  for (const value of values) {
    const key = getKey(value);
    if (seen.has(key)) fail(context, `duplicate id "${key}"`);
    seen.add(key);
  }
}

function assertIdentifier(value: string, context: string): string {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(value)) {
    fail(
      context,
      "must start with a lowercase letter or number and contain only lowercase letters, numbers, ., _, or -",
    );
  }
  return value;
}

function assertSlug(value: string, context: string): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    fail(context, "must contain lowercase letters, numbers, and single hyphens");
  }
  return value;
}

function assertHttpUrl(value: string, context: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    fail(context, "valid URL is required");
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    fail(context, "only http(s) URLs are allowed");
  }
  return value;
}

function assertIsoTimestamp(value: string, context: string): string {
  if (!/(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    fail(context, "ISO 8601 timestamp with timezone is required");
  }
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) fail(context, "valid timestamp is required");
  return value;
}

function asNullableTimestamp(value: unknown, context: string): string | null {
  if (value === null) return null;
  return assertIsoTimestamp(asString(value, context), context);
}

function parseImage(value: unknown, context: string): ArticleImage | null {
  if (value === null) return null;
  const object = asObject(value, context);
  const allowed = new Set(["path", "alt", "sourceUrl", "credit", "license"]);
  rejectUnknownFields(object, allowed, context);
  return {
    path: asString(object.path, `${context}.path`),
    alt: asString(object.alt, `${context}.alt`),
    sourceUrl: assertHttpUrl(
      asString(object.sourceUrl, `${context}.sourceUrl`),
      `${context}.sourceUrl`,
    ),
    credit: asString(object.credit, `${context}.credit`),
    license: asString(object.license, `${context}.license`),
  };
}

function parseArticleChange(value: unknown, context: string): ArticleChange {
  const object = asObject(value, context);
  const allowed = new Set(["type", "at", "description", "sourceIds"]);
  rejectUnknownFields(object, allowed, context);
  return {
    type: asLiteral(
      object.type,
      ["update", "correction", "withdrawal"] as const,
      `${context}.type`,
    ),
    at: assertIsoTimestamp(
      asString(object.at, `${context}.at`),
      `${context}.at`,
    ),
    description: asString(object.description, `${context}.description`),
    sourceIds: asStringArray(object.sourceIds, `${context}.sourceIds`),
  };
}

function parseSummaryItem(value: unknown, context: string): ArticleSummaryItem {
  const object = asObject(value, context);
  const allowed = new Set(["text", "claimIds"]);
  rejectUnknownFields(object, allowed, context);
  const claimIds = asStringArray(object.claimIds, `${context}.claimIds`);
  if (claimIds.length === 0) fail(context, "at least one claimId is required");
  return {
    text: asString(object.text, `${context}.text`),
    claimIds,
  };
}

export function parseArticleFrontmatter(
  value: unknown,
  context = "article frontmatter",
): ArticleFrontmatter {
  const object = asObject(value, context);
  rejectUnknownFields(object, ARTICLE_FIELDS, context);

  if (object.schemaVersion !== ARTICLE_SCHEMA_VERSION) {
    fail(
      `${context}.schemaVersion`,
      `expected ${ARTICLE_SCHEMA_VERSION}`,
    );
  }

  const checkScopeObject = asObject(
    object.checkScope,
    `${context}.checkScope`,
  );
  rejectUnknownFields(
    checkScopeObject,
    new Set(["sourceVersionIds", "claimIds"]),
    `${context}.checkScope`,
  );

  const summary = asArray(object.summary, `${context}.summary`).map(
    (item, index) => parseSummaryItem(item, `${context}.summary[${index}]`),
  );
  if (summary.length > 3) {
    fail(`${context}.summary`, "must contain at most 3 items");
  }

  const id = assertIdentifier(
    asString(object.id, `${context}.id`),
    `${context}.id`,
  );

  return {
    schemaVersion: ARTICLE_SCHEMA_VERSION,
    id,
    slug: assertSlug(
      asString(object.slug, `${context}.slug`),
      `${context}.slug`,
    ),
    storyKey: assertIdentifier(
      asString(object.storyKey, `${context}.storyKey`),
      `${context}.storyKey`,
    ),
    status: asLiteral(
      object.status,
      ["draft", "held", "ready", "published", "withdrawn"] as const,
      `${context}.status`,
    ),
    title: asString(object.title, `${context}.title`),
    description: asString(object.description, `${context}.description`),
    category: assertIdentifier(
      asString(object.category, `${context}.category`),
      `${context}.category`,
    ),
    tags: asStringArray(object.tags, `${context}.tags`),
    createdAt: assertIsoTimestamp(
      asString(object.createdAt, `${context}.createdAt`),
      `${context}.createdAt`,
    ),
    publishedAt: asNullableTimestamp(
      object.publishedAt,
      `${context}.publishedAt`,
    ),
    updatedAt: asNullableTimestamp(
      object.updatedAt,
      `${context}.updatedAt`,
    ),
    lastCheckedAt: asNullableTimestamp(
      object.lastCheckedAt,
      `${context}.lastCheckedAt`,
    ),
    checkScope: {
      sourceVersionIds: asStringArray(
        checkScopeObject.sourceVersionIds,
        `${context}.checkScope.sourceVersionIds`,
      ),
      claimIds: asStringArray(
        checkScopeObject.claimIds,
        `${context}.checkScope.claimIds`,
      ),
    },
    checkStatus: asLiteral(
      object.checkStatus,
      ["complete", "partial", "failed", "unchecked"] as const,
      `${context}.checkStatus`,
    ),
    summary,
    evidenceVersion: assertIdentifier(
      asString(object.evidenceVersion, `${context}.evidenceVersion`),
      `${context}.evidenceVersion`,
    ),
    tracking: asLiteral(
      object.tracking,
      ["developing", "stable", "archived"] as const,
      `${context}.tracking`,
    ),
    author: asLiteral(
      object.author,
      ["generated-jony"] as const,
      `${context}.author`,
    ),
    sources: asStringArray(object.sources, `${context}.sources`),
    image: parseImage(object.image, `${context}.image`),
    changes: asArray(object.changes, `${context}.changes`).map(
      (item, index) =>
        parseArticleChange(item, `${context}.changes[${index}]`),
    ),
  };
}

function parseSourceVersion(value: unknown, context: string): SourceVersion {
  const object = asObject(value, context);
  const allowed = new Set([
    "id",
    "sourceId",
    "title",
    "publisher",
    "url",
    "publishedAt",
    "retrievedAt",
    "checkedAt",
    "kind",
    "verificationMethod",
    "versionIdentifier",
    "usageNotes",
  ]);
  rejectUnknownFields(object, allowed, context);
  return {
    id: assertIdentifier(
      asString(object.id, `${context}.id`),
      `${context}.id`,
    ),
    sourceId: assertIdentifier(
      asString(object.sourceId, `${context}.sourceId`),
      `${context}.sourceId`,
    ),
    title: asString(object.title, `${context}.title`),
    publisher: asString(object.publisher, `${context}.publisher`),
    url: assertHttpUrl(
      asString(object.url, `${context}.url`),
      `${context}.url`,
    ),
    publishedAt: asNullableTimestamp(
      object.publishedAt,
      `${context}.publishedAt`,
    ),
    retrievedAt: assertIsoTimestamp(
      asString(object.retrievedAt, `${context}.retrievedAt`),
      `${context}.retrievedAt`,
    ),
    checkedAt: assertIsoTimestamp(
      asString(object.checkedAt, `${context}.checkedAt`),
      `${context}.checkedAt`,
    ),
    kind: asLiteral(
      object.kind,
      ["web", "spec", "github", "pdf", "video", "image", "social"] as const,
      `${context}.kind`,
    ),
    verificationMethod: asString(
      object.verificationMethod,
      `${context}.verificationMethod`,
    ),
    versionIdentifier: asString(
      object.versionIdentifier,
      `${context}.versionIdentifier`,
    ),
    usageNotes: asString(object.usageNotes, `${context}.usageNotes`),
  };
}

function parseEvidenceItem(value: unknown, context: string): EvidenceItem {
  const object = asObject(value, context);
  const allowed = new Set([
    "id",
    "sourceVersionId",
    "locator",
    "summary",
    "scope",
  ]);
  rejectUnknownFields(object, allowed, context);
  return {
    id: assertIdentifier(
      asString(object.id, `${context}.id`),
      `${context}.id`,
    ),
    sourceVersionId: assertIdentifier(
      asString(object.sourceVersionId, `${context}.sourceVersionId`),
      `${context}.sourceVersionId`,
    ),
    locator: asString(object.locator, `${context}.locator`),
    summary: asString(object.summary, `${context}.summary`),
    scope: asString(object.scope, `${context}.scope`),
  };
}

function parseClaim(value: unknown, context: string): Claim {
  const object = asObject(value, context);
  const allowed = new Set([
    "id",
    "statement",
    "appliesAt",
    "region",
    "productVersion",
    "status",
    "evidence",
  ]);
  rejectUnknownFields(object, allowed, context);
  const evidence = asArray(object.evidence, `${context}.evidence`).map(
    (item, index) => {
      const reference = asObject(item, `${context}.evidence[${index}]`);
      rejectUnknownFields(
        reference,
        new Set(["evidenceId", "relation"]),
        `${context}.evidence[${index}]`,
      );
      return {
        evidenceId: assertIdentifier(
          asString(
            reference.evidenceId,
            `${context}.evidence[${index}].evidenceId`,
          ),
          `${context}.evidence[${index}].evidenceId`,
        ),
        relation: asLiteral(
          reference.relation,
          ["support", "contradict", "context"] as const,
          `${context}.evidence[${index}].relation`,
        ),
      };
    },
  );
  if (evidence.length === 0) fail(context, "at least one evidence reference is required");

  return {
    id: assertIdentifier(
      asString(object.id, `${context}.id`),
      `${context}.id`,
    ),
    statement: asString(object.statement, `${context}.statement`),
    appliesAt: asNullableTimestamp(object.appliesAt, `${context}.appliesAt`),
    region: asNullableString(object.region, `${context}.region`),
    productVersion: asNullableString(
      object.productVersion,
      `${context}.productVersion`,
    ),
    status: asLiteral(
      object.status,
      ["supported", "attributed", "uncertain", "contradicted"] as const,
      `${context}.status`,
    ),
    evidence,
  };
}

function parseEvent(value: unknown, context: string): EvidenceEvent {
  const object = asObject(value, context);
  const allowed = new Set([
    "id",
    "occurredAt",
    "precision",
    "checkedAt",
    "claimIds",
  ]);
  rejectUnknownFields(object, allowed, context);
  return {
    id: assertIdentifier(
      asString(object.id, `${context}.id`),
      `${context}.id`,
    ),
    occurredAt: asNullableTimestamp(
      object.occurredAt,
      `${context}.occurredAt`,
    ),
    precision: asLiteral(
      object.precision,
      ["exact", "day", "month", "unknown"] as const,
      `${context}.precision`,
    ),
    checkedAt: assertIsoTimestamp(
      asString(object.checkedAt, `${context}.checkedAt`),
      `${context}.checkedAt`,
    ),
    claimIds: asStringArray(object.claimIds, `${context}.claimIds`),
  };
}

function parseVerification(
  value: unknown,
  context: string,
): EvidenceVerification {
  const object = asObject(value, context);
  const allowed = new Set([
    "articleRevision",
    "verifiedAt",
    "verifier",
    "result",
  ]);
  rejectUnknownFields(object, allowed, context);
  const articleRevision = asString(
    object.articleRevision,
    `${context}.articleRevision`,
  );
  if (!/^[a-f0-9]{64}$/.test(articleRevision)) {
    fail(`${context}.articleRevision`, "SHA-256 hex digest is required");
  }
  return {
    articleRevision,
    verifiedAt: assertIsoTimestamp(
      asString(object.verifiedAt, `${context}.verifiedAt`),
      `${context}.verifiedAt`,
    ),
    verifier: asLiteral(
      object.verifier,
      ["generated-jony"] as const,
      `${context}.verifier`,
    ),
    result: asLiteral(
      object.result,
      ["passed", "failed"] as const,
      `${context}.result`,
    ),
  };
}

export function parseEvidencePackage(
  value: unknown,
  context = "evidence package",
): EvidencePackage {
  const object = asObject(value, context);
  rejectUnknownFields(object, EVIDENCE_FIELDS, context);

  if (object.schemaVersion !== EVIDENCE_SCHEMA_VERSION) {
    fail(
      `${context}.schemaVersion`,
      `expected ${EVIDENCE_SCHEMA_VERSION}`,
    );
  }

  const sourceVersions = asArray(
    object.sourceVersions,
    `${context}.sourceVersions`,
  ).map((item, index) =>
    parseSourceVersion(item, `${context}.sourceVersions[${index}]`),
  );
  const evidence = asArray(object.evidence, `${context}.evidence`).map(
    (item, index) =>
      parseEvidenceItem(item, `${context}.evidence[${index}]`),
  );
  const claims = asArray(object.claims, `${context}.claims`).map(
    (item, index) => parseClaim(item, `${context}.claims[${index}]`),
  );
  const events = asArray(object.events, `${context}.events`).map(
    (item, index) => parseEvent(item, `${context}.events[${index}]`),
  );

  assertUniqueBy(sourceVersions, (item) => item.id, `${context}.sourceVersions`);
  assertUniqueBy(evidence, (item) => item.id, `${context}.evidence`);
  assertUniqueBy(claims, (item) => item.id, `${context}.claims`);
  assertUniqueBy(events, (item) => item.id, `${context}.events`);

  const sourceVersionIds = new Set(sourceVersions.map((item) => item.id));
  const evidenceIds = new Set(evidence.map((item) => item.id));
  const claimIds = new Set(claims.map((item) => item.id));

  for (const item of evidence) {
    if (!sourceVersionIds.has(item.sourceVersionId)) {
      fail(
        `${context}.evidence[${item.id}]`,
        `unknown sourceVersionId "${item.sourceVersionId}"`,
      );
    }
  }

  for (const claim of claims) {
    for (const reference of claim.evidence) {
      if (!evidenceIds.has(reference.evidenceId)) {
        fail(
          `${context}.claims[${claim.id}]`,
          `unknown evidenceId "${reference.evidenceId}"`,
        );
      }
    }
  }

  for (const event of events) {
    for (const claimId of event.claimIds) {
      if (!claimIds.has(claimId)) {
        fail(
          `${context}.events[${event.id}]`,
          `unknown claimId "${claimId}"`,
        );
      }
    }
  }

  return {
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    articleId: assertIdentifier(
      asString(object.articleId, `${context}.articleId`),
      `${context}.articleId`,
    ),
    version: assertIdentifier(
      asString(object.version, `${context}.version`),
      `${context}.version`,
    ),
    sourceVersions,
    evidence,
    claims,
    events,
    verification: parseVerification(
      object.verification,
      `${context}.verification`,
    ),
  };
}

export function parseArticleFile(
  input: string,
  filePath = "<article>",
): ArticleDocument {
  const normalized = input.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    fail(filePath, "article must start with a frontmatter delimiter");
  }
  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    fail(filePath, "closing frontmatter delimiter is required");
  }

  const metadataSource = normalized.slice(4, end).trim();
  let metadata: unknown;
  try {
    metadata = JSON.parse(metadataSource);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    fail(filePath, `frontmatter must be valid JSON: ${message}`);
  }

  const body = normalized.slice(end + 5).trim();
  if (body === "") fail(filePath, "article body must not be empty");

  return {
    frontmatter: parseArticleFrontmatter(metadata, `${filePath} frontmatter`),
    body,
    filePath,
  };
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === "object" && value !== null) {
    const object = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(object)
        .sort()
        .map((key) => [key, canonicalize(object[key])]),
    );
  }
  return value;
}

export function computeArticleRevision(article: ArticleDocument): string {
  const { frontmatter } = article;
  const revisionPayload = {
    schemaVersion: frontmatter.schemaVersion,
    id: frontmatter.id,
    slug: frontmatter.slug,
    storyKey: frontmatter.storyKey,
    title: frontmatter.title,
    description: frontmatter.description,
    category: frontmatter.category,
    tags: frontmatter.tags,
    summary: frontmatter.summary,
    evidenceVersion: frontmatter.evidenceVersion,
    tracking: frontmatter.tracking,
    author: frontmatter.author,
    sources: frontmatter.sources,
    image: frontmatter.image,
    changes: frontmatter.changes,
    body: article.body,
  };
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(revisionPayload)))
    .digest("hex");
}

export function getPublicationDecision(
  article: ArticleDocument,
  evidence: EvidencePackage,
  now = new Date(),
): PublicationDecision {
  const reasons: string[] = [];
  const metadata = article.frontmatter;
  const revision = computeArticleRevision(article);

  if (metadata.status !== "published") {
    reasons.push(`status is ${metadata.status}, not published`);
  }
  if (metadata.publishedAt === null) {
    reasons.push("publishedAt is required");
  } else if (Date.parse(metadata.publishedAt) > now.getTime()) {
    reasons.push("publishedAt is in the future");
  }
  if (metadata.checkStatus !== "complete") {
    reasons.push(`checkStatus is ${metadata.checkStatus}, not complete`);
  }
  if (metadata.lastCheckedAt === null) {
    reasons.push("lastCheckedAt is required");
  } else if (Date.parse(metadata.lastCheckedAt) > now.getTime()) {
    reasons.push("lastCheckedAt is in the future");
  }
  if (metadata.summary.length === 0) {
    reasons.push("at least one summary item is required");
  }
  if (metadata.checkScope.sourceVersionIds.length === 0) {
    reasons.push("checkScope.sourceVersionIds must not be empty");
  }
  if (metadata.checkScope.claimIds.length === 0) {
    reasons.push("checkScope.claimIds must not be empty");
  }

  if (evidence.articleId !== metadata.id) {
    reasons.push(
      `evidence articleId "${evidence.articleId}" does not match "${metadata.id}"`,
    );
  }
  if (evidence.version !== metadata.evidenceVersion) {
    reasons.push(
      `evidence version "${evidence.version}" does not match "${metadata.evidenceVersion}"`,
    );
  }
  if (evidence.verification.result !== "passed") {
    reasons.push("evidence verification did not pass");
  }
  if (evidence.verification.articleRevision !== revision) {
    reasons.push("verified article revision does not match current article");
  }

  const sourceVersions = new Map(
    evidence.sourceVersions.map((item) => [item.id, item]),
  );
  const claims = new Map(evidence.claims.map((item) => [item.id, item]));
  const sourceIds = new Set(evidence.sourceVersions.map((item) => item.sourceId));

  for (const sourceVersionId of metadata.checkScope.sourceVersionIds) {
    if (!sourceVersions.has(sourceVersionId)) {
      reasons.push(
        `checkScope references unknown sourceVersionId "${sourceVersionId}"`,
      );
    }
  }

  for (const sourceId of metadata.sources) {
    if (!sourceIds.has(sourceId)) {
      reasons.push(`article references unknown sourceId "${sourceId}"`);
    }
  }

  const scopedClaimIds = new Set(metadata.checkScope.claimIds);
  for (const claimId of metadata.checkScope.claimIds) {
    const claim = claims.get(claimId);
    if (!claim) {
      reasons.push(`checkScope references unknown claimId "${claimId}"`);
      continue;
    }
    if (claim.status === "uncertain" || claim.status === "contradicted") {
      reasons.push(
        `claim "${claimId}" is ${claim.status} and cannot be published as checked`,
      );
    }
  }

  for (const [index, summaryItem] of metadata.summary.entries()) {
    for (const claimId of summaryItem.claimIds) {
      if (!scopedClaimIds.has(claimId)) {
        reasons.push(
          `summary[${index}] references claim "${claimId}" outside checkScope`,
        );
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    revision,
  };
}


export interface ArticleUpdateDecision {
  valid: boolean;
  reasons: string[];
}

export function getArticleUpdateDecision(
  previous: ArticleDocument,
  next: ArticleDocument,
): ArticleUpdateDecision {
  const reasons: string[] = [];
  const before = previous.frontmatter;
  const after = next.frontmatter;

  if (before.id !== after.id) reasons.push("article id must not change");
  if (before.slug !== after.slug) reasons.push("published article slug must not change");
  if (before.storyKey !== after.storyKey) reasons.push("storyKey must not change");

  if (before.publishedAt !== null && after.publishedAt !== before.publishedAt) {
    reasons.push("publishedAt must preserve the first publication timestamp");
  }

  const contentChanged = computeArticleRevision(previous) !== computeArticleRevision(next);
  if (contentChanged) {
    if (after.updatedAt === null) {
      reasons.push("updatedAt is required when published content changes");
    } else if (
      before.updatedAt !== null &&
      Date.parse(after.updatedAt) <= Date.parse(before.updatedAt)
    ) {
      reasons.push("updatedAt must advance when published content changes");
    }

    const historyWasPreserved =
      after.changes.length > before.changes.length &&
      before.changes.every(
        (change, index) =>
          JSON.stringify(change) === JSON.stringify(after.changes[index]),
      );
    if (!historyWasPreserved) {
      reasons.push(
        "published content changes require preserving existing history and appending an update history entry",
      );
    }
  }

  if (after.checkStatus !== "complete" && after.lastCheckedAt !== before.lastCheckedAt) {
    reasons.push("partial or failed checks must not advance lastCheckedAt");
  }

  if (
    after.checkStatus === "complete" &&
    after.lastCheckedAt !== null &&
    before.lastCheckedAt !== null &&
    Date.parse(after.lastCheckedAt) < Date.parse(before.lastCheckedAt)
  ) {
    reasons.push("lastCheckedAt must not move backwards");
  }

  if (after.status === "withdrawn") {
    const withdrawal = after.changes.find((change) => change.type === "withdrawal");
    if (!withdrawal) reasons.push("withdrawn articles require a withdrawal change entry");
  }

  return { valid: reasons.length === 0, reasons };
}

export function assertContentReadyForPublication(
  article: ArticleDocument,
  evidence: EvidencePackage,
  now = new Date(),
): string {
  const decision = getPublicationDecision(article, evidence, now);
  if (!decision.eligible) {
    fail(
      article.filePath,
      `not eligible for publication: ${decision.reasons.join("; ")}`,
    );
  }
  return decision.revision;
}

async function walkMarkdownFiles(directory: string): Promise<string[]> {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return [];
    }
    throw error;
  }

  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkMarkdownFiles(fullPath)));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

export async function loadContent(
  rootDirectory = path.join(process.cwd(), "content"),
  now = new Date(),
): Promise<ContentIndex> {
  const articleDirectory = path.join(rootDirectory, "articles");
  const evidenceDirectory = path.join(rootDirectory, "evidence");
  const files = await walkMarkdownFiles(articleDirectory);

  const loaded: LoadedArticle[] = [];
  const ids = new Map<string, string>();
  const slugs = new Map<string, string>();
  const storyKeys = new Map<string, string>();

  for (const filePath of files) {
    const source = await fs.readFile(filePath, "utf8");
    const article = parseArticleFile(source, filePath);
    const { id, slug, storyKey } = article.frontmatter;

    const duplicateId = ids.get(id);
    if (duplicateId) {
      fail(filePath, `duplicate article id "${id}" also used by ${duplicateId}`);
    }
    ids.set(id, filePath);

    const duplicateSlug = slugs.get(slug);
    if (duplicateSlug) {
      fail(
        filePath,
        `duplicate article slug "${slug}" also used by ${duplicateSlug}`,
      );
    }
    slugs.set(slug, filePath);

    const duplicateStoryKey = storyKeys.get(storyKey);
    if (duplicateStoryKey) {
      fail(
        filePath,
        `duplicate storyKey "${storyKey}" also used by ${duplicateStoryKey}`,
      );
    }
    storyKeys.set(storyKey, filePath);

    const evidencePath = path.join(evidenceDirectory, `${id}.json`);
    let evidenceSource: string;
    try {
      evidenceSource = await fs.readFile(evidencePath, "utf8");
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        fail(filePath, `missing evidence package ${evidencePath}`);
      }
      throw error;
    }

    let evidenceJson: unknown;
    try {
      evidenceJson = JSON.parse(evidenceSource);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      fail(evidencePath, `invalid JSON: ${message}`);
    }

    const evidence = parseEvidencePackage(evidenceJson, evidencePath);
    const publication = getPublicationDecision(article, evidence, now);
    loaded.push({ article, evidence, publication });
  }

  return {
    articles: loaded,
    published: loaded.filter((item) => item.publication.eligible),
  };
}
