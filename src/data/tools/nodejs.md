---
name: Node.js
aliases: [Node, node]
category: language
layer: runtime
oneLiner: JavaScriptをブラウザの外（サーバー・CLI）で動かす実行環境
officialUrl: https://nodejs.org/
docsUrl: https://nodejs.org/docs/latest/api/
can: [run-long-process, build-cli, expose-http-api]
cannot:
  - 1つのプロセスで CPU 負荷の高い処理を並列に捌くこと（JavaScript は1スレッドで動く。worker_threads か複数プロセスが必要）
  - ブラウザの中で動くこと（ブラウザは別の実行環境。ファイル操作などの Node.js API はブラウザにない）
  - Node.js 固有の API をそのままエッジ環境で使うこと（Cloudflare Workers 等は互換レイヤ経由で一部のみ）
  - 奇数バージョンを長く使い続けること（Node.js 26 までの奇数版は6か月で非対応になる）
constraints:
  - label: JavaScript の実行スレッド
    value: JavaScript のコードは1本のイベントループで実行され、ファイル I/O などの重い処理はワーカープールに委ねられる
    impact: イベントループを長時間止める処理（重い計算、同期的なファイル読み込み）があると、他の全リクエストが待たされる。悪意ある入力で止められれば DoS になる
    source: https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop
    verifiedAt: 2026-09-13
  - label: バージョンのサポート期間
    value: メジャー版は6か月 Current。LTS 版は合計30か月（Active LTS ＋ Maintenance）。26 までは偶数版のみ LTS、27 以降は年1回リリースで全メジャー版が LTS になる
    impact: 本番では LTS 版だけを使う。2026-09 時点の LTS は 24 と 22。30か月ごとにメジャー更新が必要で、依存パッケージの追従を確認する
    source: https://nodejs.org/en/about/previous-releases
    verifiedAt: 2026-09-13
  - label: ライセンス
    value: MIT License
    impact: 商用利用・改変・再配布に制限はない
    source: https://github.com/nodejs/node/blob/main/LICENSE
    verifiedAt: 2026-09-13
pitfalls:
  - 同期 API（readFileSync 等）をリクエスト処理の中で使い、同時アクセス時に全体が遅くなる
  - グローバルにインストールした Node.js のバージョンがプロジェクトごとに違い、「自分の環境では動く」が起きる。バージョン管理ツール（nvm、fnm、Volta）を使う
  - 例外を捕まえずにプロセスごと落ちる。常駐させるならプロセス管理（再起動）を用意する
cost:
  model: free
  note: MIT ライセンスで無償。費用は動かすサーバー側で発生する
  source: https://github.com/nodejs/node/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: cloudflare-workers
    difference: Workers は V8 の isolate で動くエッジ環境で、起動が速く待機コストがない代わりに、Node.js API の一部しか使えず CPU 時間に上限がある。常駐サーバーや Node.js 前提のライブラリを使うなら Node.js
  - tool: python
    difference: Python は別言語で、データ処理と AI のライブラリが厚い。Node.js は画面と同じ言語（JavaScript / TypeScript）でサーバーも書ける点が利点
verdict: TypeScript / JavaScript でサーバー、CLI、ビルドツールを動かすときの標準の実行環境。画面と同じ言語で裏側も書きたい場合の第一候補。CPU 負荷の高い処理を1プロセスで並列に捌く必要がある場合は Go などのコンパイル言語へ
updatedAt: 2026-09-13
---

ブラウザの中でしか動かなかった JavaScript を、サーバーやコマンドラインで動かせるようにした実行環境である。npm という巨大なパッケージの集まりと一体で、フロントエンドのビルドツール（Astro、Next.js の開発サーバー）もこの上で動いている。

最初に当たる制約は「1スレッド」である。I/O 待ちが多いサーバーでは効率がよいが、重い計算を1リクエストの中でやると全体が止まる。設計の前提として覚えておく。
