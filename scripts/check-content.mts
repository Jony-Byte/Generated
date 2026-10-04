import path from "node:path";

import { ContentValidationError, loadContent } from "../lib/content/index.mts";
import { loadWatchlist } from "../lib/editorial/watchlist.mts";

const root = path.join(process.cwd(), "content");
const index = await loadContent(root);
const watchlist = await loadWatchlist();
const articleIds = new Set(index.articles.map((item) => item.article.frontmatter.id));

for (const item of watchlist.items) {
  if (!articleIds.has(item.articleId)) {
    throw new ContentValidationError(
      `editorial/watchlist.json: unknown articleId "${item.articleId}"`,
    );
  }
}

console.log(
  `content check passed: ${index.articles.length} article(s), ${index.published.length} publishable, ${watchlist.items.length} watched`,
);
