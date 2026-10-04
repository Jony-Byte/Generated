---
{
  "schemaVersion": 1,
  "id": "apple-macos-full-disk-access-controls-2026",
  "slug": "apple-macos-full-disk-access-controls",
  "storyKey": "apple-macos-full-disk-access-controls-2026-10-02",
  "status": "published",
  "title": "AppleがmacOSの「フルディスクアクセス」に追加の制御を予告、AIエージェントの普及でリスク増大を指摘",
  "description": "Appleは、Macの広範なファイルへアクセスできる「フルディスクアクセス」について、今後はユーザーのより明示的な操作を必要とする追加制御を導入すると発表しました。",
  "category": "technology",
  "tags": ["apple", "macos", "privacy", "security"],
  "createdAt": "2026-10-05T00:45:00+09:00",
  "publishedAt": "2026-10-05T00:50:00+09:00",
  "updatedAt": null,
  "lastCheckedAt": "2026-10-05T00:50:00+09:00",
  "checkScope": {
    "sourceVersionIds": ["apple-news-v1", "apple-files-doc-v1"],
    "claimIds": ["claim-controls", "claim-risk", "claim-current-access"]
  },
  "checkStatus": "complete",
  "summary": [
    {
      "text": "AppleはmacOSのフルディスクアクセスに、より明示的なユーザー操作を求める追加制御を導入すると予告しました。",
      "claimIds": ["claim-controls"]
    },
    {
      "text": "Appleは、AIエージェントの高機能化・自律化に伴い、この権限が持つリスクが大きくなると説明しています。",
      "claimIds": ["claim-risk"]
    },
    {
      "text": "現在もアプリがフルディスクアクセスを自動取得することはできず、ユーザーがシステム設定から許可する必要があります。",
      "claimIds": ["claim-current-access"]
    }
  ],
  "evidenceVersion": "evidence-v1",
  "tracking": "developing",
  "author": "generated-jony",
  "sources": ["apple-news", "apple-files-doc"],
  "image": null,
  "changes": []
}
---

Appleは2026年10月2日、macOSの「フルディスクアクセス」について、今後さらに強いユーザー確認を導入する方針を発表しました。フルディスクアクセスは、バックアップアプリなどがMac内の広い範囲のファイルを扱うために使われる強力な権限です。

Appleによると、一部の開発者がこの権限を、ユーザーが十分に理解しないままファイル、メール、メッセージ、閲覧履歴などへアクセスできる形で利用しているとしています。そのため今後は、ユーザーが本当に許可したい場合にだけ、**より明示的な操作**でフルディスクアクセスを付与できるよう追加の制御を導入するとしています。

## AIエージェントの普及も理由に

今回の発表でAppleは、AIエージェントがより高機能かつ自律的になるにつれて、広範なファイルアクセスを与えるリスクが大きくなると説明しています。

ただし、10月2日の発表では、新しい確認画面の具体的なデザイン、導入されるmacOSのバージョン、提供開始日は示されていません。現時点で「どの操作が追加されるのか」までは確定していない点に注意が必要です。

## 現在のフルディスクアクセス

Appleの開発者向け文書では、バックアップのようにMac上の広い範囲のファイルを扱う処理ではフルディスクアクセスが必要になる場合があると説明されています。

現在もアプリがコードやentitlementだけでこの権限を自動的に取得することはできません。ユーザー自身が「システム設定」の「プライバシーとセキュリティ」から許可する必要があります。

今回の変更は、この既存のユーザー許可をなくすものではなく、強力な権限を与える場面でさらに明確な意思確認を求める方向の予告です。具体的な実装や提供時期は、今後のAppleの発表を確認する必要があります。
