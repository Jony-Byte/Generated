# 記事・根拠・調査記録テンプレート

テンプレートであり、記事ではない。プレースホルダーを残して公開しない。
契約は [ARCHITECTURE.md](../ARCHITECTURE.md)、確認の意味は [LIVING-ARTICLES.md](../LIVING-ARTICLES.md) に従う。

## 1. 記事

保存先案: `content/articles/YYYY/MM/slug.md`。公開してよい情報だけを書く。
dsafsdfas

```markdownddd
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
lastCheckedAt: null
checkScope:
  sourceIds: []
  claimIds: []
checkStatus: unchecked
tracking: developing
author: generated-jony
evidenceVersion: null
sources: []
summary: []
image: null
changes: []
---

出来事と重要な条件を冒頭で説明する。事実の近くに出典へのリンクを付ける。

## 何が変わるのか

機能、研究結果、変更内容を説明する。旧版と比較できる場合はその違いを示す。

## 資料を照合すると分かること

仕様、実装、図、実演などを確認して説明する。未確認なら見たと書かない。

## 条件と分かっていないこと

対象地域、時期、研究の限界、矛盾など必要なものを書く。
```

カテゴリIDは `technology` / `science` / `internet`。公開段階ではsourcesとevidenceVersionを実際の根拠に接続する。summaryは最大3項目の `{ text, claimIds }` を持ち、短縮しても重要な条件を落とさない。見出し、AI表示、SourceList、日時は共通部品が生成する。

## 2. 根拠パッケージ

保存先案: `content/evidence/article-id.yaml`。下記は構造例であり、実在する出典ではない。すべてのREPLACEと例示文を置き換える。

```yaml
schemaVersion: 1
articleId: "REPLACE_WITH_STABLE_ID"
version: "REPLACE_WITH_IMMUTABLE_EVIDENCE_VERSION"
sourceVersions:
    - id: sv1
      sourceId: s1
      title: "資料の実際のタイトル"
      publisher: "発行元"
      url: "REPLACE_WITH_ACTUAL_HTTPS_URL"
      publishedAt: null
      accessedAt: "REPLACE_WITH_ISO8601_WITH_TIMEZONE"
      checkedAt: "REPLACE_WITH_ISO8601_WITH_TIMEZONE"
      type: primary
      medium: pdf
      verificationMethod: "原文と図を目視確認"
      versionLabel: "REPLACE_WITH_DOCUMENT_VERSION_OR_HASH"
      usageTerms: "公開する要約・抜粋・図の利用条件"
evidence:
    - id: e1
      sourceVersionId: sv1
      locator:
          page: 3
          figure: "図1"
      summary: "この箇所で実際に確認できたことを独自の文章で記録"
      coverage: "例: 図1の軸、凡例、注記まで確認"
claims:
    - id: c1
      text: "資料が裏付ける範囲に限定した記述"
      appliesTo:
          time: null
          region: null
          productVersion: null
      status: supported
      evidence:
          - id: e1
            relation: supports
events: []
```

記事のsourcesは `[s1]` のように参照する。SourceListの表示はここから解決し、書誌情報を記事ファイルに重複入力しない。sourceVersionが変わる場合は新IDを作り、旧版を上書きしない。

mediumに応じてlocatorは節、ページ・図表番号、動画の開始／終了秒、画像の対象箇所、commitとファイル・行範囲などを使い分ける。閲覧手段が使えず確認できなかった資料は調査記録に残し、確認済み根拠として登録しない。

根拠パッケージは公開可能な短い抜粋・独自要約・位置情報に限定する。第三者の原文全文や未公開の調査メモを含めない。画像を実際に転載する場合は記事のimageにpath、alt、sourceUrl、credit、usageTermsを追加し、利用条件を別途確認する。

## 3. 調査・検証記録

保存先案: `editorial/dossiers/article-id.md`。サイトには出力しない。ただし公開リポジトリなら非公開ではない。

```markdown
# 調査・検証記録

- Article ID / storyKey:
- 対象revision / evidenceVersion:
- 確認者: Jony（AI）
- 確認日時（タイムゾーン付き）:
- 調査した期間:
- 採用理由と重複しない理由:
- 発表文からさらに説明できたこと:

## 照合

| Claim ID | Evidence ID | 確認した箇所・方法 | 結果                                              |
| -------- | ----------- | ------------------ | ------------------------------------------------- |
| c1       | e1          |                    | supported / attributed / uncertain / contradicted |

- 重要な条件・数値・単位・日付の確認:
- 情報源の独立性:
- 図・動画・UIを実際に確認した範囲:
- 過去版との比較に使った版:
- 取得できなかった資料・未確認・矛盾:
- 要約・通常本文・派生文章の整合:
- 画像・引用の条件:

## 判定と次回

- ready / held と理由:
- 再確認: complete / partial / failed / unchecked
- lastAttemptedAt:
- lastCheckedAtを更新できる根拠とcheckScope:
- developing / stable / archived:
- 次回確認日・理由（watchlistへ反映）:
```

revisionの計算対象は技術設計に従い、検証記録自身のハッシュを含めない。本文・根拠・説明の変更時は対象を再照合する。資料の取得成功だけで確認済みにしない。

## 4. 時系列と訂正

eventsには `id`、`occurredAt`、`timePrecision`、`learnedAt`、`claimIds` を持たせる。発生日しか分からなければ日付精度とし、架空の時刻を付けない。確認した時刻と出来事が起きた時刻を区別する。

公開後の実質的な変更は記事のchangesに追加する。

```yaml
changes:
    - kind: correction # update / correction / withdrawal
      at: "REPLACE_WITH_ISO8601_WITH_TIMEZONE"
      summary: "何をどう直したかと理由"
      sourceIds: [s1]
```

初回公開日時は変更しない。本文変更なしの完全再確認ではlastCheckedAtだけを更新し、updatedAtは維持する。テンプレートのREPLACE、空の根拠、例示文、版の不一致を公開検査で拒否する。
