# 記事・調査記録テンプレート

このファイルはテンプレートであり、記事ではない。プレースホルダーを残したまま公開しない。
実装時のスキーマは [ARCHITECTURE.md](../ARCHITECTURE.md) と同期させる。

## 1. 記事ファイル

保存先案: `content/articles/YYYY/MM/slug.md`。frontmatterは公開してよい情報だけ。
下のコードブロックの中身を新規記事ファイルへコピーする。見出しは画面側で生成するため、本文にh1を重複させない。

```markdown
---
schemaVersion: 1
id: "REPLACE_WITH_STABLE_ID"
slug: "replace-with-unique-slug"
storyKey: "REPLACE_WITH_EVENT_KEY"
status: draft
title: "何が起きたかを具体的に伝える"
description: "本文で説明している事実を短く要約する"
category: technology
tags: []
createdAt: "REPLACE_WITH_ISO8601_WITH_TIMEZONE"
publishedAt: null
updatedAt: null
author: generated-jony
sources: []
image: null
changes: []
---

出来事と重要な条件を冒頭で説明する。事実の近くに実際の出典へのリンクを付ける。

## 何が変わるのか

機能、研究結果、変更内容を具体的に説明する。

## 背景

仕組み、過去との違い、日本の読者に必要な文脈を補う。

## 条件と分かっていないこと

対象地域、提供時期、研究の限界、未確認点など必要なものだけを書く。
```

カテゴリIDは `technology` / `science` / `internet`。出典は確認後に次の形式でsources配列へ追加する。URLや日時は実際の値に置換する。

```yaml
sources:
  - id: s1
    title: "資料の実際のタイトル"
    publisher: "発行元"
    url: "REPLACE_WITH_ACTUAL_HTTPS_URL"
    publishedAt: null # 日付不明。取得日で埋めない
    accessedAt: "REPLACE_WITH_ISO8601_WITH_TIMEZONE"
    type: primary # primary / reporting / background
```

`image` は必要なときだけ設定し、`path`、`alt`、`sourceUrl`、`credit`、`usageTerms` を記録する。自作図の `sourceUrl` はnull可で、作成者・元データの根拠を説明する。出典表示・AI表示・公開日時は画面の共通部品が生成し、各本文へのコピーは避ける。

## 2. 調査・検証記録

保存先案: `editorial/dossiers/article-id.md`。サイトの公開対象にはしない。ただし公開リポジトリに保存した内容は非公開ではない。

```markdown
# 調査・検証記録

- Article ID:
- Story key:
- 対象リビジョン（本文とメタデータのハッシュ）:
- 確認者: Jony（AI）
- 確認日時（タイムゾーン付き）:
- 調査した期間:
- 採用理由:
- 他の記事と重複しない理由:

## 主要な主張

| ID | 記事中の主張 | Source ID | 根拠の節・表・ページ・短い要約 | 確認結果 |
| --- | --- | --- | --- | --- |
| c1 |  | s1 |  | supported / attributed / uncertain / contradicted |

## 照合

- 見出しと本文の整合:
- 数値・単位・日付・固有名詞:
- 一次資料と二次資料の役割:
- 情報源の独立性:
- 未確認・矛盾とその扱い:
- 画像・引用の条件:
- 原典を開けなかったもの:

## 公開判定

- 判定: ready / held
- 理由:
- 残る確認:
- 再確認する条件:
```

形式が埋まっているだけではreadyにしない。本文を変更したら照合対象のハッシュを更新し、影響する主張を再確認する。

## 3. 更新・訂正の記録

公開後の意味のある変更は `changes` に追加する。初回公開日時を変更しない。

```yaml
changes:
  - kind: correction # update / correction / withdrawal
    at: "REPLACE_WITH_ISO8601_WITH_TIMEZONE"
    summary: "何をどう直したかと理由。誤りを必要以上に再掲しない"
    sourceIds: [s1]
```

このテンプレートの `REPLACE_...`、空の根拠、例示見出しを検出して公開を拒否する検査をG-001で用意する。
