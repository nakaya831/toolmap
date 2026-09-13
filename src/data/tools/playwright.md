---
name: Playwright
aliases: [playwright-test, pw]
category: devops
layer: framework
oneLiner: Chromium/Firefox/WebKitを1つのAPIで自動操作するE2Eテストフレームワーク
officialUrl: https://playwright.dev/
docsUrl: https://playwright.dev/docs/intro
can: [test-e2e, scrape-web, call-http-api]
cannot:
  - Node.js の 22.x / 24.x / 26.x 系以外（EOL済みの旧LTSなど）での動作保証
  - Windows 10、macOS 13以前、公式非対応のLinuxディストリビューションでのサポート
  - Playwrightを更新した後、ブラウザバイナリを再インストールせずに同じ検証結果を維持すること（バージョンごとにブラウザが固定される）
  - 実機のiOS/Android端末上でのネイティブアプリテスト（あくまでデスクトップブラウザエンジンによるモバイルエミュレーション）
  - CI環境でブラウザバイナリをキャッシュして大幅に高速化すること（インストール時間とキャッシュ復元時間がほぼ同等）
constraints:
  - label: 対応Node.jsバージョン
    value: 最新の 22.x, 24.x, 26.x 系のいずれか
    impact: 古いNode.js（18.x以前など）やサポート対象外の中間バージョンでは動作保証されず、CI環境のNodeイメージを合わせる必要がある
    source: https://playwright.dev/docs/intro
    verifiedAt: 2026-09-13
  - label: 対応OS
    value: Windows 11以降/Windows Server 2019以降、macOS 14（Sonoma）以降、Linuxは Debian 12/13・Ubuntu 22.04/24.04/26.04（x86-64またはarm64）
    impact: 古いOSやディストリビューションは公式サポート外となり、ブラウザバイナリが正しく動かないことがある
    source: https://playwright.dev/docs/intro
    verifiedAt: 2026-09-13
  - label: 対応ブラウザエンジン
    value: Chromium・Firefox・WebKitの3種（chrome/msedgeなどのチャネル切り替えも可能）
    impact: Playwright専用にビルドされたブラウザで検証するため、利用者の手元のChrome/Edgeの実バージョンとは完全には一致しないことがある
    source: https://playwright.dev/docs/intro
    verifiedAt: 2026-09-13
  - label: ブラウザバイナリのインストール容量
    value: Chromium約281MB、Firefox約187MB、WebKit約180MB（初回 playwright install 時にダウンロード）
    impact: CI環境ではディスク・ネットワーク帯域を消費し、キャッシュしてもダウンロード時間との差が小さいため高速化効果が薄い
    source: https://playwright.dev/docs/browsers
    verifiedAt: 2026-09-13
  - label: CI実行時の推奨ワーカー数
    value: 1（公式推奨。安定性と再現性を優先するため）
    impact: 並列実行は強力な自己ホストCI環境がある場合のみ推奨され、幅広い並列化にはジョブ自体を分割するシャーディングが必要になる
    source: https://playwright.dev/docs/ci
    verifiedAt: 2026-09-13
pitfalls:
  - Playwrightを更新した後にブラウザバイナリを再インストールしないと、バージョン不整合でテストが失敗する
  - CI用イメージのNode.jsバージョンを対応外のまま放置し、原因不明の失敗に遭遇する
  - ブラウザバイナリをCIキャッシュに乗せても、インストール時間とほぼ変わらずキャッシュ管理コストだけが増える
cost:
  model: free
  note: Apache License 2.0のOSSで無償。費用が発生するのはCI実行環境（クラウドランナーの実行時間や自己ホストのマシン代）側であり、Playwright自体に課金要素はない
  source: https://github.com/microsoft/playwright/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: python
    difference: PythonはHTTPクライアントやHTMLパーサーを自分で組み合わせて軽量にスクレイピングでき、静的なページならブラウザ起動が不要な分高速。PlaywrightはJavaScriptレンダリングが必要な動的サイトやブラウザ操作そのものの検証（E2Eテスト）に対応できるが、実ブラウザを起動する分リソースを消費する
verdict: ブラウザ経由のE2Eテストや、JavaScript実行が必要な動的サイトのスクレイピングでは第一候補。静的HTMLの取得だけならブラウザ起動が不要な軽量ライブラリのほうが高速。CI環境のNode.jsバージョンやOSが対応範囲外の場合は、先にランナー環境を合わせる必要がある
updatedAt: 2026-09-13
---

Playwrightは1つのAPIでChromium・Firefox・WebKitの3エンジンを同じコードから操作できる点が特徴で、テストランナー（Playwright Test）・トレースビューア・自動待機（auto-wait）などE2Eテストに必要な機能一式を内蔵する。ブラウザの実体を操作するため、HTTPリクエストのみで完結する軽量なスクレイピングよりも動的サイトへの対応力が高い。

利用者が最初に当たるのはNode.jsのバージョン要件とOS要件で、CI環境のイメージがこれに合っていないとインストール自体が失敗する。次に当たるのがブラウザバイナリの容量で、更新のたびに数百MB単位のダウンロードが発生し、キャッシュしても時間短縮効果が薄いことは事前に知っておく必要がある。
