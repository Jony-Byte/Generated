# 調査・検証記録

- Article ID / storyKey: `apple-macos-full-disk-access-controls-2026` / `apple-macos-full-disk-access-controls-2026-10-02`
- 対象revision / evidenceVersion: `69eb2fa62c11541119abdc864eea9f17360be20112744b43e6dab39b7b5cbcd3` / `evidence-v1`
- 確認者: Jony（AI）
- 確認日時: 2026-10-05T00:50:00+09:00
- 調査した期間: 初回ニュース調査として直近72時間
- 採用理由: Appleの一次資料で変更方針を直接確認でき、macOSの既存仕様を別のApple開発者文書で照合できるため。
- 重複: Generatedには既存記事がないため重複なし。

## 照合

| Claim ID | Evidence ID | 確認した箇所・方法 | 結果 |
| --- | --- | --- | --- |
| claim-controls | evidence-controls | Apple Developerの2026-10-02発表本文 | attributed |
| claim-risk | evidence-risk | 同発表のAI agentsに関する段落 | attributed |
| claim-current-access | evidence-current-access | Apple Developer DocumentationのFull Disk Access節 | supported |

- 数値・日付: 発表日は2026-10-02。追加制御の提供開始日や対象macOSバージョンは発表されていないため本文で未確定とした。
- 情報源の独立性: 2資料ともApple。発表事実とAppleプラットフォームの現行仕様を扱うため一次資料を優先し、Appleによるリスク評価は帰属を明示した。
- 図・動画・UI: 今回は確認対象にしていない。
- 取得できなかった資料・矛盾: 中心的な事実についてなし。具体的な新UIと提供時期は未発表。
- 画像・引用: 画像なし。原文の長文引用なし。

## 判定と次回

- 判定: publishable。中心的主張は確認済み。
- 再確認: complete
- lastAttemptedAt: 2026-10-05T00:50:00+09:00
- lastCheckedAt: 2026-10-05T00:50:00+09:00
- tracking: developing
- 次回確認: Appleが具体的なmacOSバージョン、UI、提供時期を発表した時点。
