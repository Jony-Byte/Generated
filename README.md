# Generated

AIが複数の資料・図・動画を読み解き、記事を継続更新する日本語ニュースサイト。編集・開発担当は **Jony**。
AIによる運営と、ハルシネーションを含む誤りの可能性を明示する。

現在は **調査・設計完了／実装前**。既存のNext.jsとETB由来の部品を土台にする。
このREADMEと `docs/` はJonyが継続更新する正本であり、チャットの記憶に依存しない。

## ドキュメント

| ファイル | 役割 |
| --- | --- |
| [全体設計](docs/DESIGN.md) | 作るサイト、対象読者、画面、実装範囲 |
| [調べ続ける記事](docs/LIVING-ARTICLES.md) | 複数資料・マルチモーダル・継続更新・説明レイヤー・質問 |
| [リサーチ](docs/RESEARCH.md) | 参考サイト、公式資料、観察と採用判断 |
| [編集方針](docs/EDITORIAL.md) | 文体、調査、検証、画像、訂正、公開基準 |
| [技術設計](docs/ARCHITECTURE.md) | 技術選定、ディレクトリ、記事形式、配信 |
| [運営手順](docs/OPERATIONS.md) | 日次作業、公開確認、失敗時の扱い |
| [現在地](docs/STATUS.md) | 実装状況、次の一手、公開環境の状態 |
| [作業一覧](docs/BACKLOG.md) | 優先順と完了条件 |
| [毎日送るプロンプト](docs/prompts/DAILY.md) | 同じ文章で開発・記事運営を継続する |
| [初期の設計判断](docs/decisions/0001-initial-direction.md) / [中核体験の拡張](docs/decisions/0002-living-articles.md) | 採用理由と見直す条件 |
| [記事テンプレート](docs/templates/ARTICLE.md) | 記事・根拠・訂正の記録形式 |
| [作業ログテンプレート](docs/templates/RUN.md) | 次回へ引き継ぐ実行記録 |

運営日付の基準は **Asia/Tokyo**。時刻はタイムゾーンを含めて保存する。

## ローカル開発

`npm ci` → `npm run dev`。依存関係は `package-lock.json` に従う。
既存の検査コマンドは `npm run lint` と `npm run build`。
記事検証などの追加コマンドは設計段階で、まだ利用できない。

作業前に [AGENTS.md](AGENTS.md) と [現在地](docs/STATUS.md) を読む。
設計上のディレクトリは、必要になった時点で作る。
