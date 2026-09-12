---
name: Go
aliases: [Golang, Go言語]
category: language
layer: language
oneLiner: 単一バイナリに固めて配布できる静的型付け言語。並行処理と配布が軽い
officialUrl: https://go.dev/
docsUrl: https://go.dev/doc/
can: [build-cli, expose-http-api, run-long-process, run-batch, call-http-api]
cannot:
  - ブラウザ上の画面構築（WebAssembly 出力はあるが、DOM 操作は JavaScript 経由になる）
  - 例外（try/catch）による大域的なエラー処理。エラーは戻り値で逐一扱う設計が前提
  - GC を止めた完全な手動メモリ管理（リアルタイム制御や組み込みの一部では候補に入らない）
  - 対話的な逐次実行（公式の REPL はなく、コンパイルして動かすのが前提）
  - C ライブラリに依存するコードの追加設定なしのクロスコンパイル（cgo はクロス時に既定で無効）
constraints:
  - label: 旧バージョンのサポート期間
    value: 各メジャー版は、その後2つ新しいメジャー版が出るまでサポート。メジャー版は2月と8月の半年ごと（実質約1年）
    impact: 1年放置すると修正が来ないバージョンになる。年1回はツールチェーンを上げる運用を前提にする
    source: https://go.dev/doc/devel/release
    verifiedAt: 2026-09-13
  - label: セキュリティ修正の対象
    value: 直近2つのメジャー版と開発版（master）のみ
    impact: 上と同じく、2世代前のバージョンには脆弱性修正が配布されない
    source: https://go.dev/doc/security/policy
    verifiedAt: 2026-09-13
  - label: 後方互換性の保証範囲（Go 1 互換性）
    value: Go 1 で書いたソースはコンパイル・実行が維持される。ただしバイナリ互換は保証されず、unsafe の利用・キーなし構造体リテラル・ドットインポートは保証の対象外
    impact: ツールチェーンを上げても書き直しはほぼ発生しないが、再コンパイルは必要。他パッケージの構造体はキー付きリテラルで書く
    source: https://go.dev/doc/go1compat
    verifiedAt: 2026-09-13
  - label: 実行ファイルのサイズ
    value: 既定で静的リンク。fmt.Printf だけのプログラムでも数 MB（C の同等品は約 750 KB）。-ldflags=-w でデバッグ情報を除ける
    impact: 配布物が最初から MB 単位になる。多数のマイクロバイナリを配る場合はサイズを見込む
    source: https://go.dev/doc/faq
    verifiedAt: 2026-09-13
  - label: cgo とクロスコンパイル
    value: クロスコンパイル時は cgo が既定で無効（CGO_ENABLED=0）。C 依存パッケージを含めるには C クロスコンパイラの指定が必要
    impact: SQLite ドライバなど C 依存のライブラリを使うと、他 OS 向けビルドが1コマンドでは済まなくなる。純 Go 実装のライブラリを選ぶ
    source: https://pkg.go.dev/cmd/cgo
    verifiedAt: 2026-09-13
  - label: 動作環境の下限
    value: Linux はカーネル 3.2 以降（Go 1.24〜）、Windows 10 / Server 2016 以降（Go 1.21〜）、macOS 13 以降（Go 1.27〜）
    impact: 古い OS 向けに配るバイナリは、古いツールチェーンで別途ビルドする必要がある
    source: https://go.dev/wiki/MinimumRequirements
    verifiedAt: 2026-09-13
pitfalls:
  - goroutine に終了条件を持たせないとリークする。context でキャンセルを伝播する設計を最初から入れる
  - エラーを _ で捨てる、err の確認を書き忘れると失敗が黙って進む。go vet と errcheck 系の linter を CI に入れる
  - nil マップへの書き込み、nil インターフェースと nil ポインタの区別など、nil 周りで実行時 panic になる
  - GOPATH 時代の記事が多く残っている。現在は go.mod によるモジュール管理が前提で、古い手順は通らない
cost:
  model: free
  note: BSD 3-Clause License で無償、商用利用も制限なし。費用は動かすサーバー側で発生する
  source: https://go.dev/LICENSE
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: python
    difference: Python は書く量が少なく、データ処理・AI のライブラリが厚い。Go は実行速度・並列処理・単一バイナリ配布で勝り、CLI や常駐サーバーに向く
  - tool: typescript
    difference: TypeScript はブラウザと同じ言語でサーバーを書け、npm の資産を使える。Go は依存の少ない単一バイナリを吐き、Node.js のような実行環境の同梱が不要
verdict: CLI ツール、HTTP API サーバー、常駐ワーカーなど「配布して長く動かす」用途では第一候補。ブラウザ画面、データ分析・機械学習、数十行で済む自動化スクリプトは避け、TypeScript か Python へ
updatedAt: 2026-09-13
---

Google 発の静的型付け言語で、コンパイルすると依存を含む単一の実行ファイルになる。goroutine とチャネルによる並行処理が言語機能として組み込まれ、Docker・Kubernetes・Terraform など運用系ツールの多くがこの言語で書かれている。

最初に当たる制約は言語仕様の限界よりも運用側にある。サポートは直近2メジャー（約1年）に限られるため、年1回のツールチェーン更新が前提になる。Go 1 互換性保証のおかげで更新そのものはほぼ書き直しなしで済む。コードを書く上では、例外がなくエラーを戻り値で毎回扱う点と、cgo に依存した瞬間にクロスコンパイルの手軽さが失われる点が分岐点になる。
