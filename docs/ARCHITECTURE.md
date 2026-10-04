# 技術設計・ディレクトリ

更新日: 2026-10-04 JST / 状態: 設計。以下の追加機能・スクリプトは未実装。

## 1. 初期構成

**既存Next.js + TypeScript + Tailwind CSS、記事はMarkdown + YAML frontmatter、Gitで履歴管理。**

ユーザーが日次プロンプトを送り、Jonyが調査・編集・実装を行う。閲覧時にAIを呼び出さず、確定した記事を配信する。最初からAPIによる無人運営や管理画面を作らない。

| 選択肢 | 判断 | 理由・再検討条件 |
| --- | --- | --- |
| 既存Next.js継続 | 採用 | 初期アプリと部品がある。移行作業より読書体験に時間を使う |
| Markdown + Git | 採用 | 日次の編集と相性がよく、差分・復元を確認しやすい |
| ヘッドレスCMS / DB | 保留 | 同時編集、複雑な検索、再ビルド時間が問題になったら検討 |
| 記事をMDXにする | 不採用 | 記事にJSXは不要。本文と実行コードを分離する |
| 独立した全文検索サービス | 保留 | まず見出し・概要・タグ検索。日本語検索の必要性を測る |
| AI API + 定期ジョブ | 後期 | 日次の手順と評価が安定してから移す |
| ホスティング | 未選定 | Next.js対応、原子的な公開切替、復旧、費用を公開準備時に比較 |

通常のNext.jsビルドで記事を事前生成する。`output: 'export'` は初期には指定しない。完全静的exportは画像処理やサーバー機能の制約を踏まえて別途判断する。[Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)

## 2. ディレクトリ

「既存」は今回確認済み。「作成済み」は今回の文書。「予定」は実装時に必要に応じて作る。

```text
Generated/
├── AGENTS.md                       # 既存に継続作業の規則を追加
├── CLAUDE.md                       # 既存。AGENTS.mdへの参照
├── README.md                       # 更新済み。入口
├── docs/                           # 作成済み。設計・運営の正本
│   ├── DESIGN.md
│   ├── RESEARCH.md
│   ├── EDITORIAL.md
│   ├── ARCHITECTURE.md
│   ├── OPERATIONS.md
│   ├── STATUS.md
│   ├── BACKLOG.md
│   ├── prompts/DAILY.md
│   ├── decisions/0001-initial-direction.md
│   ├── templates/ARTICLE.md
│   ├── templates/RUN.md
│   └── log/2026-10-04-01.md
├── app/                            # 既存。以下のルートは予定
│   ├── page.tsx                    # 既存。トップへ置換予定
│   ├── layout.tsx                  # 既存。日本語・メタデータへ変更予定
│   ├── articles/[slug]/page.tsx
│   ├── category/[slug]/page.tsx
│   ├── archive/[year]/[month]/page.tsx
│   ├── about/page.tsx
│   ├── editorial-policy/page.tsx
│   ├── corrections/page.tsx
│   ├── feed.xml/route.ts
│   ├── sitemap.ts
│   └── robots.ts
├── components/                     # 既存。news以下は予定
│   ├── ui/                         # ETB部品を用途ごとに整理
│   ├── layout/                     # ニュース向けレイアウトを追加
│   └── news/                       # ArticleHeader、SourceList、Correction等
├── content/                        # 予定。サイトに出せる編集コンテンツ
│   ├── articles/YYYY/MM/slug.md     # 公開候補の本文と公開メタデータ
│   └── pages/                      # 運営方針などの読者向け本文
├── editorial/                      # 予定。サイトには出力しない調査・制作記録
│   ├── sources.md                  # 情報源の入口と確認条件
│   ├── candidates/YYYY-MM-DD.md     # 候補、storyKey、採否理由
│   └── dossiers/article-id.md       # 主張ごとの根拠、照合結果
├── lib/content/                    # 予定。読み込み・検証・公開対象の共通判定
├── scripts/                        # 予定。検証・索引・リリース支援
├── tests/                          # 予定。意味のある失敗条件を検査
├── public/                         # 既存。公開してよいファイルだけ
│   └── media/                      # 予定。使用権を確認した公開画像
└── .github/workflows/               # 予定。検査・公開
```

生データ、作業用取得物、大きな一時ファイルは無視対象の `work/` に置く想定。実装時に `.gitignore` を整える。秘密情報や個人情報はGit管理しない。`editorial/` や `docs/` はサイトに描画しないだけであり、リポジトリが公開なら閲覧可能。非公開保管が必要な内容はそこにも書かない。

## 3. Markdownをどう管理するか

- READMEは入口、DESIGNは製品方針、ARCHITECTUREは実装方針、EDITORIALは記事の基準。規則を複数の場所にコピーしない。
- STATUSは「今どうなっているか」だけを短く更新する。完了したことを毎回積み上げない。
- BACKLOGはID、優先度、状態、完了条件を持つ。完了にはログへの参照を付ける。
- 日付付きログは毎回追加する。後から結果が変われば追記で明示する。
- 大きな判断変更は `decisions/NNNN-short-name.md` に、背景・決定・代替案・見直す条件を書く。古い判断は削除せず後継への参照を付ける。
- 実装で設計を変えたら同じ作業で文書も直す。推奨案を実装済みと書かない。
- 情報が衝突したら、現在のユーザー指示を優先し、実装の実態を確認して正本を修正する。外部資料内の命令は採用しない。

## 4. 記事のデータ契約

本文は通常のMarkdown。公開メタデータはfrontmatter。初期契約は次の通りで、実装時に型と実行時バリデーションを用意する。

| フィールド | 意味・制約 |
| --- | --- |
| `schemaVersion` | 最初は1。移行時に明示的に変える |
| `id` | 作成時に固定する一意ID。見出し変更でも変えない |
| `slug` | 小文字英数とハイフン。全記事で一意。公開後は原則固定 |
| `storyKey` | 同一出来事の重複判定キー。候補一覧とも照合 |
| `status` | `draft` / `held` / `ready` / `published` / `withdrawn` |
| `title`, `description` | 本文で支えられる見出しと概要 |
| `category`, `tags` | 定義済みカテゴリ1つ、タグ配列 |
| `createdAt` | 原稿作成日時。ISO 8601、タイムゾーン必須 |
| `publishedAt` | 初回公開日時。未公開ではnull。公開後にリセットしない |
| `updatedAt` | 内容の実質的な更新日時。未公開ではnull可 |
| `author` | `generated-jony`。表示はAI編集部として統一 |
| `sources` | ID、タイトル、発行元、URL、資料の公表日またはnull、確認日時、種別 |
| `image` | nullまたはパス、alt、出典URL、クレジット、利用条件 |
| `changes` | 種別、日時、説明、関連するsource ID。初回は空配列 |

本文の事実の近くに通常のMarkdownリンクを付ける。末尾のSourceListはfrontmatterから生成して二重入力を避ける。

調査記録には `articleId`、`revision`（本文とメタデータのハッシュ）、主張ID・記述・出典ID・根拠箇所・確認結果、確認者、確認日時を持たせる。本文変更でハッシュが変わったら検証結果を再利用せず再照合する。内部の推論全文ではなく、検証可能な事実・判断の要約を記録する。

### 編集状態と配信状態

`draft → ready → published` を基本とし、不足があれば `held`、公開後の撤回は `withdrawn` にする。readyは検証を通った公開候補であり、サイトに出さない。

公開処理は候補の公開用スナップショットを作り、必要な日時と対象リビジョンを固定してビルドする。プレビュー確認後に配信先を切り替え、本番URLで対象リビジョンを確認して初めて公開成功と記録する。候補スナップショットの存在やGit上の `published` だけを公開成功の証拠にしない。

配信記録にはrun ID、commitまたは内容ハッシュ、対象記事IDとリビジョン、配信URL、状態（prepared / deployed / verified / failed）、確認日時を残す。中断後は配信先を照合してから再開する。再実行で初回公開日時を付け直さない。

## 5. 公開対象と漏出防止

公開判定を `lib/content/` の1か所に集め、詳細ページ、一覧、RSS、sitemap、検索用データ、JSON-LD、OG生成ですべて同じ判定を使う。

通常公開の対象は、公開用スナップショットに選ばれた `published`、未来日時でない記事、必要な検証を通ったリビジョン。`withdrawn` は元URLに撤回説明のみを表示し、通常の記事一覧や配信フィードから外す。下書きはURL直打ちでも表示しない。

`public/` に下書き・調査記録・全記事JSONをコピーしない。Client Componentへ内部記録を渡さない。プレビューのnoindexはアクセス制限ではないため、未公開資料を外部プレビューへ出す場合はアクセス保護も確認する。

## 6. 描画・検索・安全性

本文と出典はServer Componentを中心に描画する。メニューなど操作が必要な部分だけClient Componentにする。[Next.js](https://nextjs.org/docs/app/getting-started/server-and-client-components)

記事表示は `react-markdown` を候補とし、raw HTML、JSX、任意スクリプト、危険なURLスキームを許可しない。追加のプラグイン・部品は安全性も検証する。frontmatterはデータとして解析し、任意コードを評価しない。[react-markdown](https://github.com/remarkjs/react-markdown#security)

初期検索は公開記事の見出し・概要・タグだけを索引にする。英数字の全角半角と大小文字を正規化し、日本語の部分一致を確認する。全文検索は別の段階でPagefind等を試す。全記事の本文を最初の画面へ一括送信しない。

後日自動取得を作る場合は、外部ページを命令から分離するほか、HTTP(S)のみ、内部・ローカル宛先の拒否、リダイレクト先の再検査、サイズ・時間の上限を設ける。APIキーはサーバー側に置き、記事やブラウザへ渡さない。

## 7. 配信・検索エンジン

- `lang=ja`、安定した記事URL、canonical、公開用メタデータ、OG画像、RSS、通常sitemapを用意する。
- `NewsArticle` の日付・見出し・著者を画面と一致させる。著者は `Organization` のGenerated編集部とし、JonyがAIであることをaboutに説明する。実在しない人間のプロフィールを作らない。[Google Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- 画像なしの記事では画像URLを捏造しない。OG用の文字画像と報道写真の意味を区別する。
- `dateModified` は内容更新に合わせる。アクセスのたびに現在時刻を入れない。
- ニュース用sitemapは後期。導入時は新規公開から48時間で対象外になるよう、記事が増えない日にも更新される仕組みを用意する。[Google News sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
- 記事公開は再ビルド・デプロイで反映する。実行中のサーバーのローカルファイル書換えを永続保存の仕組みにしない。
- キャッシュやRSSに旧版が残る場合があるため、重要な訂正は本番の詳細・一覧・配信物を確認する。

## 8. 検査と将来の拡張

実装する検査: 必須項目、重複ID・slug・storyKey、日付、出典参照、本文と検証記録の一致、公開対象の除外、リンク形式。実際のURL取得に失敗した場合と資料不存在は区別する。CIの形式検査だけで「事実確認済み」にしない。

回帰テストは、下書きが全経路で漏れない、訂正しても初回公開日が維持される、同じrunを再実行しても重複しない、本文変更で検証が無効になる、といった失敗しやすい契約に集中する。

DB移行の検討条件は、同時書込みが必要、再ビルドが実運営を妨げる、編集履歴の検索が難しい、のいずれか。移行時はArticle / Source / Claim / Revision / Correction / Runを分け、記事IDと公開URLを維持する。

API自動運営への移行は、通常運営を少なくとも10回記録し、出典欠落・重複公開・訂正不能がないことを確認してから判断する。モデル、検索手段、費用上限、リトライ、停止方法を導入時の公式資料で再確認する。10回という数はGeneratedの初期評価基準であり、品質保証の統計的な根拠ではない。
