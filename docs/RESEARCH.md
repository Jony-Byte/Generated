# リサーチ記録

確認日: 2026-10-04 JST / 調査: Jony

## 調査の範囲

ニュースサイト3媒体の公開ページ、記事2本、公式の技術・検索・アクセシビリティ資料、Generatedのローカルファイルを確認した。GIGAZINEのトップはブラウザ画面も確認。他媒体は取得できた本文・ページ構造を確認した。全媒体のモバイル表示や性能を測定した調査ではない。

媒体に載るニュースすべての真偽を検証したわけではない。今回は見せ方・導線・文章構成の調査であり、記事執筆時には改めて原典を確認する。

## ニュースサイトから学ぶこと

| 対象 | 確認できたこと | 採用判断 |
| --- | --- | --- |
| [GIGAZINEトップ](https://gigazine.net/) | 画像、具体的な見出し、日付、カテゴリ。画面では複数列の一覧、黄色い見出し帯、上部広告を確認 | 出来事が伝わる見出しを採用。初期は広告を置かず、読みやすい密度にする |
| [GIGAZINE記事](https://gigazine.net/news/20261004-cloudflare-quick-tunnels/) | 導入から機能説明へ進み、リンクと画像で具体化する構成 | 用語と仕組みを説明する。未操作の製品を体験談にしない |
| [Ars Technicaトップ](https://arstechnica.com/) | 特集枠、見出しと短い説明、署名・日付、表示形式の選択 | 概要を添える。表示モードの切替は初期には不要 |
| [Ars Technica記事](https://arstechnica.com/gaming/2026/10/can-it-run-doom-sql-database-edition/) | 具体例から技術背景へ進み、発言や外部資料を参照する | 仕組みの説明を記事の価値にする |
| [The Verge / Tech](https://www.theverge.com/tech) | 記事リンクと短い投稿が混在。署名・時刻・外部リンク・ページ送りがある | 原典へ進める導線を採用。短報と記事の混在は初期には行わない |

結論: GIGAZINEを主な文章構成の参考にし、概要と根拠の導線を組み合わせる。外観や記事表現を複製せず、Generatedの設計として作る。

The VergeのトップとBBC Newsは取得エラー。The VergeはTechページを確認できた。BBCは比較の根拠に含めていない。

## 技術・運営の根拠

| 一次資料 | 確認事項 | このプロジェクトの判断 |
| --- | --- | --- |
| [Next.js: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) | ページ等の既定はServer Component。操作やブラウザAPIにはClient Componentを使う | 本文はサーバー側で描画し、操作部分にだけJSを足す |
| [Next.js: Static Exports](https://nextjs.org/docs/app/guides/static-exports) | 静的ファイルへの出力は可能だが、サーバー機能に制約がある | 通常のビルドで記事を事前生成。完全なexportは公開先決定後に検討 |
| [Next.js: MDX](https://nextjs.org/docs/app/guides/mdx) | Markdown内でJSXを扱える。frontmatter処理は別途必要 | 記事は通常のMarkdownに限定し、任意コードは実行しない |
| [react-markdown](https://github.com/remarkjs/react-markdown#security) | URL変換・プラグイン・部品の変更で安全性が変わる | raw HTMLを許可せず、リンク処理と追加プラグインも点検 |
| [Google: Article構造化データ](https://developers.google.com/search/docs/appearance/structured-data/article) | 著者、見出し、公開・更新日、画像などを記述できる | 画面とJSON-LDを一致させる。AIを架空の人間の記者にしない |
| [Google News: ポリシー](https://support.google.com/news/publisher-center/answer/6204050) | 日付、署名、発行者・著者情報、連絡先など透明性を重視 | 運営情報と訂正窓口を作る。検索掲載は保証しない |
| [Google: スパムポリシー](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content) | 検索順位操作を目的とした価値の乏しい大量生成を問題にする | 本数をKPIにせず、原典確認や説明の価値を重視 |
| [Google: News sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap) | 直近2日間の記事、1ファイル最大1,000件のニュース要素 | 初期は通常sitemap。時間依存のニュース用は運用整備後 |
| [Web Vitals](https://web.dev/articles/vitals) | LCP・INP・CLSを実利用の75パーセンタイルで評価 | 軽いHTMLと少量のJS。ラボ測定だけで達成としない |
| [W3C: Contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) / [Target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) | 通常文字のコントラストと操作対象サイズに基準がある | 本文・補助文字・操作領域を確認する |
| [GitHub Actions: Concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency) | 同時実行をグループで制御できる | 公開を直列化。重複防止は記事IDと実行記録でも扱う |
| [Pagefind](https://pagefind.app/) / [多言語検索](https://pagefind.app/docs/multilingual/) | 静的検索と多言語処理を提供 | 全文検索の将来候補。日本語品質とNext.js出力との接続を検証後に採用 |

資料とインストール版が違えばローカルの版を先に確認する。価格・モデル名・API制限・ホスティングのプラン条件は固定していない。導入時に公式情報を再調査する。

## 既存リポジトリ

確認時HEAD: `3e295ef`（ETBのコンポーネントを追加）。作業開始時のGit変更なし。

- `package.json`: Next.js 16.3.8、React 19.2.8、Tailwind CSS 4系、TypeScript 5系、lucide-react。
- `app/page.tsx`: 初期ページ。`app/layout.tsx`: 英語の言語設定と初期メタデータ。
- `Button.tsx`: 「もう一度プレイ」を条件に7秒後に自動クリックするゲーム用処理がある。
- `Shell.tsx`: フォーム向けの幅、`pb-[50vh]`、ETB由来のクラスがある。
- 複数の部品が参照する `--duration-etb`・`ease-etb`・専用色は現状の `globals.css` に定義がない。
- Button・Input・Dialog等の採用時はhooksのClient Component境界を設計する。単体の記述だけで現在のビルド不良とは断定しない。
- Dialogのフォーカス移動・復帰・識別子の重複は点検項目。Morph系には動きを減らす設定への対応もある。
- `AGENTS.md` を確認し、Next.js同梱のServer/Client、Static Exports、MDXガイドを読んだ。

今回はコード読み取り。部品全体の動作・性能・アクセシビリティ検証は未実施。

## 日次調査の入口

| 入口 | 用途・注意 |
| --- | --- |
| [NASA News](https://www.nasa.gov/news/) | 宇宙の公式発表。画像の条件は個別に確認 |
| [Mozilla Blog](https://blog.mozilla.org/en/) | ブラウザ・ウェブ。自己評価と第三者確認を区別 |
| [Google Technology](https://blog.google/innovation-and-ai/technology/) | 製品・研究発表。地域と提供時期は個別に確認 |
| GIGAZINE / Ars Technica / The Verge | 話題発見と背景。参照する原典に進む |

JAXAの旧プレス入口はリダイレクト案内のみ取得できたため、使う日に現行の入口を確認する。上記は入口の確認であり、RSS・機械取得・画像転載の許可を確認したリストではない。大学・研究機関・標準化団体・行政機関も追加し、特定企業への偏りを抑える。
