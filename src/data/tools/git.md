---
name: Git
aliases: [git-scm, ギット, バージョン管理]
category: devops
layer: tool
oneLiner: 分散型バージョン管理システム。全履歴を手元に持ち、ほぼ全操作がローカル
officialUrl: https://git-scm.com/
docsUrl: https://git-scm.com/docs
can: [version-control]
cannot:
  - 数百 MB 級のバイナリを頻繁に更新するリポジトリの軽量な運用（全版が全クローンに含まれる。Git LFS 等で本体の外に置く）
  - 履歴に入ったファイルを、コミット ID を変えずに完全削除すること（削除には該当以降の全コミットの書き換えが必要）
  - リポジトリの一部ディレクトリだけに閲覧権限を絞ること（アクセス制御はリポジトリ単位で、ホスティング側の機能）
  - 同じファイルへの同時編集の即時同期やファイルロック（競合はマージ時に手で解決する）
  - コードレビュー・Issue・CI（Git 本体にはない。GitHub 等のホスティングサービスが担う）
constraints:
  - label: 履歴に入れたファイルの永続性
    value: clone は「プロジェクトの全履歴、すべてのファイルのすべての版」を取得する。一度コミットした大きなファイルは、次のコミットで削除しても、以後すべてのクローンがダウンロードし続ける
    impact: 誤って入れたビルド成果物・動画・秘密鍵は「削除コミット」では消えない。歴史の書き換えが必要で、公開済みなら全協力者に影響する。最初から .gitignore と LFS で入れない設計にする
    source: https://git-scm.com/book/en/v2/Git-Internals-Maintenance-and-Data-Recovery
    verifiedAt: 2026-09-13
  - label: 履歴書き換えの影響範囲
    value: 書き換え後の履歴は全オブジェクトの名前（コミット ID）が変わり、元のブランチと収束しない。git filter-branch 自体は安全性と性能の問題で「使用は推奨されない」とされ、git filter-repo が代替として案内されている
    impact: 公開済みのブランチを書き換えると、他の全員がローカル作業を新しい履歴に載せ替える必要がある。1コミットの修正で済むなら書き換えない
    source: https://git-scm.com/docs/git-filter-branch
    verifiedAt: 2026-09-13
  - label: データモデル（差分ではなくスナップショット）
    value: 各コミットは差分ではなく、その時点の全ファイルのスナップショットへの参照。変更のないファイルは前の同一オブジェクトへのリンクで済ませる。全内容は SHA-1 チェックサムで参照され、ほとんどの操作はネットワーク不要でローカルに完結する
    impact: 履歴の閲覧・ブランチ切替・差分表示は高速だが、リポジトリの総サイズは「全版の合計」で増える。テキストは圧縮とデルタで小さく収まるが、バイナリはほぼ全版分の容量を消費する
    source: https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F
    verifiedAt: 2026-09-13
  - label: ライセンス
    value: GNU General Public License version 2.0（GPLv2）。プロジェクトとしては v2 のみを有効とし、v3 等の後継版は明示がない限り適用されない
    impact: 利用・商用利用は無償で制限なし。Git 本体を改変して配布する場合のみ GPLv2 の義務（ソース公開）が生じる
    source: https://git-scm.com/about
    verifiedAt: 2026-09-13
pitfalls:
  - .gitignore を最初に置かず node_modules・ビルド成果物・.env をコミットする。特に秘密情報は削除しても履歴に残るため、漏えいとして扱いキーを無効化する
  - 共有ブランチへの force push で他人のコミットが消える。公開ブランチでは rebase ではなく merge、force push は禁止設定にする
  - 改行コード（CRLF / LF）の自動変換設定が OS ごとに異なり、内容を変えていないのに全行が差分になる。.gitattributes で統一する
  - 大きなバイナリを LFS なしで入れ続けると clone が遅くなり、ホスティング側の上限（GitHub は 100 MiB でブロック）に当たる
cost:
  model: free
  note: GPLv2 で無償、商用利用も制限なし。費用が発生するのはリモートリポジトリを置くホスティングサービス側（GitHub 等）のプランと、LFS の容量・帯域
  source: https://git-scm.com/about
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: github
    difference: Git は手元で履歴を管理するツールで、GitHub はその履歴を置き、レビュー・Issue・CI を足すホスティングサービス。Git は GitHub なしで動くが、GitHub は Git を前提とする。「Git を使う」と「GitHub を使う」は別の判断
verdict: ソースコードとテキスト設定の履歴管理では事実上の既定解で、代替を検討する場面はほぼない。避けるのは、頻繁に更新される大きなバイナリ（動画・データセット・ゲームアセット）を本体に入れる運用で、この場合は LFS かオブジェクトストレージに本体を置き、Git には参照だけを残す
updatedAt: 2026-09-13
---

2005 年に Linux カーネル開発のために作られた分散型バージョン管理システムで、各開発者が全履歴の完全な複製を持つ。ブランチ作成・切替・差分・履歴閲覧がすべてローカルで完結し、ネットワークが要るのは push / fetch のときだけである。

最初に当たる制約は操作の難しさよりも「一度入れたものは消えない」という性質である。履歴はスナップショットの連鎖で、削除コミットを足しても過去のオブジェクトは残り、全クローンに配られる。秘密情報と大きなバイナリを入れないことが、Git を使い始める時点で決めておくべき唯一の設計判断になる。
