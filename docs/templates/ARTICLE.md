# 記事・根拠・調査記録テンプレート

テンプレートであり、記事ではない。プレースホルダーを残して公開しない。
契約は [ARCHITECTURE.md](../ARCHITECTURE.md)、確認の意味は [LIVING-ARTICLES.md](../LIVING-ARTICLES.md) に従う。

## 1. 記事

保存先: `content/articles/YYYY/MM/slug.md`。公開してよい情報だけを書く。
G-001のローダーは `---` で囲まれたfrontmatterをJSON objectとして厳格に読む。未知のフィールド、タイムゾーンのない日時、重複参照は検査で拒否する。

```markdown
---
{
  "schemaVersion": 1,
  "id": "REPLACE_WITH_STABLE_ID",
  "slug": "replace-with-unique-slug",
  "storyKey": "replace-with-event-key",
  "status": "draft",
  "title": "何が起きたかを具体的に伝える",
  "description": "本文で説明している事実を短く要約する",
  "category": "technology",
  "tags": [],
  "createdAt": "REPLACE_WITH_ISO8601_WITH_TIMEZONE",
  "publishedAt": null,
  "updatedAt": null,
  "lastCheckedAt": null,
  "checkScope": {
    "sourceVersionIds": [],
    "claimIds": []
  },
  "checkStatus": "unchecked",
  "summary": [],
  "evidenceVersion": "REPLACE_WITH_IMMUTABLE_EVIDENCE_VERSION",
  "tracking": "developing",
  "author": "generated-jony",
  "sources": [],
  "image": null,
  "changes": []
}
---

出来事と重要な条件を冒頭で説明する。事実の近くに出典へのリンクを付ける。

## 何が変わるのか

機能、研究結果、変更内容を説明する。旧版と比較できる場合はその違いを示す。

## 資料を照合すると分かること

仕様、実装、図、実演などを確認して説明する。未確認なら見たと書かない。

## 条件と分かっていないこと

対象地域、時期、研究の限界、矛盾など必要なものを書く。
```

カテゴリIDは `technology` / `science` / `internet`。summaryは最大3項目の `{ "text": "...", "claimIds": ["claim-id"] }` を持つ。
`sources` は根拠パッケージの `sourceId`、`checkScope.sourceVersionIds` は確認した具体的な資料の版を参照する。

## 2. 根拠パッケージ

保存先: `content/evidence/article-id.json`。下記は構造例であり、実在する出典ではない。第三者資料の原文全文は保存せず、位置と独自要約を基本にする。

```json
{
  "schemaVersion": 1,
  "articleId": "REPLACE_WITH_STABLE_ID",
  "version": "REPLACE_WITH_IMMUTABLE_EVIDENCE_VERSION",
  "sourceVersions": [
    {
      "id": "source-v1",
      "sourceId": "source-1",
      "title": "資料の実際のタイトル",
      "publisher": "発行元",
      "url": "REPLACE_WITH_ACTUAL_HTTPS_URL",
      "publishedAt": null,
      "retrievedAt": "REPLACE_WITH_ISO8601_WITH_TIMEZONE",
      "checkedAt": "REPLACE_WITH_ISO8601_WITH_TIMEZONE",
      "kind": "web",
      "verificationMethod": "原文を直接確認",
      "versionIdentifier": "REPLACE_WITH_DOCUMENT_VERSION_OR_HASH",
      "usageNotes": "公開する要約・抜粋・図の利用条件"
    }
  ],
  "evidence": [
    {
      "id": "evidence-1",
      "sourceVersionId": "source-v1",
      "locator": "section: REPLACE_WITH_SECTION_OR_PAGE",
      "summary": "この箇所で確認できたことを独自の文章で記録",
      "scope": "この根拠が支えられる範囲"
    }
  ],
  "claims": [
    {
      "id": "claim-1",
      "statement": "資料が裏付ける範囲に限定した記述",
      "appliesAt": null,
      "region": null,
      "productVersion": null,
      "status": "supported",
      "evidence": [
        {
          "evidenceId": "evidence-1",
          "relation": "support"
        }
      ]
    }
  ],
  "events": [],
  "verification": {
    "articleRevision": "REPLACE_WITH_64_CHAR_SHA256",
    "verifiedAt": "REPLACE_WITH_ISO8601_WITH_TIMEZONE",
    "verifier": "generated-jony",
    "result": "passed"
  }
}
```

`SourceVersion → Evidence → Claim` の参照はローダーが検査する。資料の版が変わる場合は新しいsourceVersion IDとevidence versionを作り、確認前に古い検証結果を流用しない。

`articleRevision` は本文、見出し、概要、summary、evidenceVersionなど読者へ意味を持つ内容から計算する。本文や要約を変えるとハッシュが変わるため、以前の `verification` は公開判定を通らなくなる。
現在のリビジョンは実装コードの `computeArticleRevision` で計算し、検証後に根拠パッケージへ記録する。

## 3. 公開判定

通常の記事として配信できるのは、少なくとも次をすべて満たすもの。

- `status: published` で、`publishedAt` が現在以前
- `checkStatus: complete` かつ `lastCheckedAt` が設定済み
- `checkScope` に実在するsourceVersionとclaimが入っている
- summaryのclaimが確認範囲内にある
- 確認範囲のclaimが `supported` または `attributed`
- 記事の `evidenceVersion` と根拠パッケージの `version` が一致
- `verification.result: passed`
- `verification.articleRevision` が現在の本文リビジョンと一致

`draft` / `held` / `ready` / `withdrawn`、未来公開、部分確認、古い検証リビジョンは通常公開一覧へ出さない。

## 4. 調査・検証記録

保存先: `editorial/dossiers/article-id.md`。サイトには出力しない。ただし公開リポジトリなら非公開ではない。

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

| Claim ID | Evidence ID | 確認した箇所・方法 | 結果 |
| --- | --- | --- | --- |
| claim-1 | evidence-1 | | supported / attributed / uncertain / contradicted |

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

公開後の実質的な変更は記事の `changes` に `type`、`at`、`description`、`sourceIds` を追加する。初回公開日時は変更しない。本文変更なしの完全再確認ではlastCheckedAtだけを更新し、updatedAtは維持する。
