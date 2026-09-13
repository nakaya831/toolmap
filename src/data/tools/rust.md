---
name: Rust
aliases: [Cargo, rustc]
category: language
layer: language
oneLiner: メモリ安全性をコンパイル時に保証する、GCを持たない静的型付け言語
officialUrl: https://www.rust-lang.org/
docsUrl: https://doc.rust-lang.org/
can: [build-cli, run-long-process, expose-http-api, run-batch]
cannot:
  - ガベージコレクタによる自動メモリ管理(所有権と借用チェッカーによる静的検証が前提)
  - 対話的なREPLを軸にした本番運用相当のワークフロー(コンパイルと借用チェックの待ちが前提の言語)
  - 数十分の学習で書き始める即席スクリプト(所有権・ライフタイムの理解が先に必要になる)
  - 新安定版に対する長期サポート版の提供(全リリースが約6週間でロールし、LTSという区分はない)
  - Tier3プラットフォームでの公式ビルド・自動テストの保証
constraints:
  - label: 安定版のリリース周期
    value: 6週間ごと(nightly→beta→stableのトレインモデル)。バージョンごとの長期サポート(LTS)はない
    impact: 新安定版への追従を前提にした運用になる。放置すると数か月で複数バージョン遅れ、修正の恩恵を受けにくくなる
    source: https://doc.rust-lang.org/book/appendix-07-nightly-rust.html
    verifiedAt: 2026-09-13
  - label: エディションによる言語仕様の切り替え
    value: 2015/2018/2021/2024などのエディションはCargo.tomlで明示的に選ぶオプトイン方式。異なるエディションのクレート同士は相互運用できる
    impact: async/awaitなど新しいキーワードを使うには対象クレートのeditionを上げる必要がある。上げない限り古い文法のまま動き続ける
    source: https://doc.rust-lang.org/edition-guide/editions/index.html
    verifiedAt: 2026-09-13
  - label: 最小サポートRustバージョン(MSRV)の指定
    value: Cargo.tomlのrust-versionフィールドで指定できる(例 rust-version = "1.70")。指定より古いツールチェーンではcargoがビルド前にエラーにする
    impact: 依存クレートがMSRVを引き上げると、古いツールチェーンの利用者はそのクレートを更新できなくなる。自分のcrateのMSRVも運用として明示・維持する必要がある
    source: https://doc.rust-lang.org/cargo/reference/manifest.html
    verifiedAt: 2026-09-13
  - label: プラットフォームサポートのティア
    value: Tier1は自動テストと公式バイナリ付き。Tier2はビルド保証のみ(自動テストなしの場合がある)。Tier3は公式ビルドも自動テストもなく動作保証なし
    impact: 組み込みや特殊OS向けにTier3ターゲットを選ぶと、ビルドが通ることさえ保証されない。採用前にターゲットのティアを確認する
    source: https://doc.rust-lang.org/rustc/platform-support.html
    verifiedAt: 2026-09-13
pitfalls:
  - 借用チェッカーに阻まれた設計をRc<RefCell<>>やunsafeで回避し続けると、静的保証の薄い複雑なコードになる
  - コンパイル時間がプロジェクト規模とともに伸び、大規模ワークスペースではCIのビルド時間が支配的コストになる
  - 非同期ランタイム(tokio、async-std等)が標準ライブラリに含まれず選定が必要で、異なるランタイムをまたぐ非同期コードは基本的に動かない
  - エラー処理(anyhow、thiserror等)やロギング、シリアライズの流儀が標準で決まっておらず、プロジェクトごとに構成が割れる
cost:
  model: free
  note: コンパイラ・ツールチェーンはApache License 2.0とMIT Licenseのデュアルライセンスで無償。費用が発生するのはCIのビルド時間や実行するサーバー側のみ
  source: https://www.rust-lang.org/policies/licenses
  verifiedAt: 2026-09-13
learningCost: high
maturity: stable
alternatives:
  - tool: go
    difference: Goはガベージコレクタを持ち、所有権や借用の概念を学ばずに書き始められコンパイルも速い。Rustはランタイムのオーバーヘッドがなくゼロコスト抽象化とメモリ安全性を両立するが、学習コストとコンパイル時間で劣る
  - tool: python
    difference: Pythonは書いてすぐ動かせるが実行速度と型の静的検査で劣る。Rustは事前の設計コストが高い代わりに、実行速度とメモリ安全性が要る用途(CLI、組み込み、高負荷なサーバー)で選ばれる
verdict: メモリ安全性と実行速度の両方が必要な用途(CLIツール、高負荷なバックエンド、組み込み、WebAssembly)では第一候補。所有権・借用の学習や長めのコンパイル時間を許容できない場合、数十行で終わる自動化スクリプトでは避け、Go や Python へ
updatedAt: 2026-09-13
---

コンパイル時の所有権・借用チェックによってメモリ安全性を保証する静的型付け言語で、ガベージコレクタを持たないため実行時のオーバーヘッドが小さい。Cargo によるパッケージ管理とビルドが統合されており、C/C++ が担ってきた領域(CLI、OS、組み込み、ブラウザ拡張の WebAssembly)を安全に書き直す用途で採用が広がっている。

利用者が最初に当たる制約は言語仕様の限界ではなく、所有権と借用チェッカーそのものである。書き方に慣れるまでコンパイルが通らない時間が長く続き、学習コストは高い部類に入る。次に当たるのがリリース速度で、安定版は6週間ごとに更新され続け、LTSという区分は存在しない。追従を止めると数か月で複数バージョン遅れ、依存クレートの MSRV 引き上げに巻き込まれやすくなる。
