---
name: TypeScript
aliases: [TS, tsc, Node.js, JavaScript]
category: language
layer: language
oneLiner: JavaScriptに静的型を足した言語。Node.jsでブラウザとサーバーを同じ言語で書く
officialUrl: https://www.typescriptlang.org/
docsUrl: https://www.typescriptlang.org/docs/
can: [build-web-ui, build-cli, expose-http-api, call-http-api, run-long-process]
cannot:
  - 実行時の型検査（型注釈はコンパイル時に消える。API 応答や JSON.parse の結果は別途検証が必要）
  - Node.js 単体での型エラーの検出（Node.js の TypeScript 直接実行は型を削るだけで検査しない）
  - Node.js 単体での enum・namespace・パラメータプロパティを含むコードの実行（tsc かバンドラーで変換が必要）
  - 標準の CPU 並列処理（Node.js はシングルスレッドのイベントループ。worker_threads を明示的に使う）
  - 実行環境なしの配布（実行には Node.js かブラウザが必要で、Go のような単一バイナリにはならない）
constraints:
  - label: 型の実行時消失
    value: 型注釈は JavaScript の一部ではなく、コンパイル時に完全に削除される。型が実行時の動作を変えることはない
    impact: 外部から入る値（HTTP 応答、フォーム入力、環境変数）は型を付けても検証されない。zod 等による実行時検証を境界に置く
    source: https://www.typescriptlang.org/docs/handbook/2/basic-types.html
    verifiedAt: 2026-09-13
  - label: 型エラー時の出力
    value: noEmitOnError の既定は false。型エラーがあっても JavaScript は出力される
    impact: 型エラーを放置したまま動くビルドが作れてしまう。CI で tsc --noEmit を必ず通すか、noEmitOnError を有効にする
    source: https://www.typescriptlang.org/tsconfig/
    verifiedAt: 2026-09-13
  - label: Node.js での直接実行の範囲
    value: Node.js 22.18.0 / 23.6.0 以降は型ストリッピングが既定で有効。型検査は行わず、tsconfig.json も読まない。enum・namespace・パラメータプロパティはエラーになり、import にはファイル拡張子（.ts）が必須
    impact: 小さなスクリプトは tsc なしで動くが、型検査もパスエイリアスも効かない。アプリ本体は従来どおりビルド工程を持つ
    source: https://nodejs.org/api/typescript.html
    verifiedAt: 2026-09-13
  - label: Node.js のサポート期間
    value: 偶数版のみ LTS。Active LTS 12か月＋Maintenance 18か月の計30か月。新メジャーは4月（偶数）と10月（奇数）の半年ごと
    impact: 奇数版を本番に使うと半年ほどでサポートが切れる。本番は偶数 LTS に固定し、約2年ごとに更新する
    source: https://github.com/nodejs/Release
    verifiedAt: 2026-09-13
  - label: TypeScript のリリース周期
    value: 約3か月ごとに新版。破壊的変更はベータ版までに入れ、ベータ以降は行わない方針
    impact: 新版で型検査が厳しくなり、それまで通っていたコードにエラーが出ることがある。バージョンを固定し、更新は意図して行う
    source: https://github.com/microsoft/TypeScript/wiki/TypeScript's-Release-Process
    verifiedAt: 2026-09-13
pitfalls:
  - any を多用すると型検査の恩恵が消える。外部入力は unknown で受けて検証してから型を付ける
  - strict を無効にしたまま始めると、後から有効化するときに大量のエラーが出る。最初から strict を有効にする
  - ESM と CommonJS の混在（module 設定、.mts/.cts、拡張子の有無）で import が実行時に失敗する。実行環境とバンドラーの設定を揃える
  - 依存パッケージの型定義（@types/*）と本体のバージョンがずれ、コンパイルが通らなくなる
cost:
  model: free
  note: TypeScript は Apache License 2.0、Node.js は MIT License で無償。費用は動かすサーバーやホスティング側で発生する
  source: https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: python
    difference: Python は動的型付けで、データ処理・AI のライブラリが厚い。TypeScript はコンパイル時に型を検査し、ブラウザとサーバーを同じ言語・同じ型定義で書ける
  - tool: go
    difference: Go は単一バイナリで配布でき、CPU 並列が言語機能として軽い。TypeScript は npm の資産とブラウザ側との共通化で勝るが、実行には Node.js の同梱か事前導入が必要
verdict: ブラウザ画面を持つアプリ、フロントとサーバーで型を共有したい API、npm のライブラリを使う CLI では第一候補。型は実行時に消えるため外部入力の検証は別途必要で、CPU 負荷の高い並列処理や単一バイナリでの配布が要件なら Go へ
updatedAt: 2026-09-13
---

JavaScript の上位互換として型を足した言語で、コンパイル結果は素の JavaScript になる。ブラウザで動く唯一の言語と同じ文法でサーバー側（Node.js）も書けるため、Web アプリでは画面と API の型定義を1か所で共有できる点が最大の利点である。

最初に当たる制約は「型は実行時に存在しない」ことである。型を付けた変数に、API から違う形のデータが入っても TypeScript は何も検出しない。境界（HTTP、ファイル、環境変数）で実行時検証を挟む前提で設計する。次に当たるのが Node.js の版管理で、奇数版は短命、偶数 LTS でも30か月で切れるため、更新の計画が必要になる。
