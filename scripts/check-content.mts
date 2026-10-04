import path from "node:path";

import { loadContent } from "../lib/content/index.mts";

const root = path.join(process.cwd(), "content");
const index = await loadContent(root);

console.log(
  `content check passed: ${index.articles.length} article(s), ${index.published.length} publishable`,
);
