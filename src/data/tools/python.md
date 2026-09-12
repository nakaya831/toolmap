---
name: Python
aliases: [CPython, py, Python 3]
category: language
layer: language
oneLiner: 読みやすさを優先した動的型付け言語。データ処理・自動化・AI分野の共通語
officialUrl: https://www.python.org/
docsUrl: https://docs.python.org/3/
can: [build-cli, transform-tabular, scrape-web, call-http-api, run-batch]
cannot:
  - 標準の CPython で、複数スレッドによる CPU 処理の並列実行（GIL により1スレッドずつ）
  - ブラウザ上での実行（WebAssembly 経由の実験的手段を除く）
  - 単一の実行ファイルとしての軽量な配布（同梱ツールはあるがサイズが大きく起動も遅い）
  - コンパイル時の型エラー検出（型ヒントは実行時に検査されない。別途型検査器が必要）
constraints:
  - label: スレッド並列の上限（GIL）
    value: CPython では同時に1スレッドしか Python バイトコードを実行しない。I/O 中は解放される
    impact: CPU 負荷の高い処理をスレッドで並列化しても速くならない。multiprocessing か、GIL を解放する拡張（NumPy 等）を使う。3.13 以降はビルドオプションで GIL 無効化が可能だが既定ではない
    source: https://docs.python.org/3/glossary.html#term-global-interpreter-lock
    verifiedAt: 2026-09-13
  - label: バージョンのサポート期間
    value: 毎年10月に新版。バグ修正2年＋セキュリティ修正3年の計5年
    impact: 5年で EOL になるため、長期運用ではメジャー更新の計画が必要。依存ライブラリが新版に追従するまで数か月遅れることが多い
    source: https://peps.python.org/pep-0602/
    verifiedAt: 2026-09-13
  - label: 小数の表現
    value: float は IEEE 754 倍精度（2進浮動小数）
    impact: 0.1 + 0.2 が 0.3 にならない。金額計算は decimal モジュールを使う
    source: https://docs.python.org/3/tutorial/floatingpoint.html
    verifiedAt: 2026-09-13
pitfalls:
  - 仮想環境（venv）を作らずにグローバルへ pip install すると、プロジェクト間で依存が衝突する
  - OS 同梱の Python（macOS や Linux のシステム Python）を使うと、OS 更新で壊れることがある。別途インストールする
  - 可変オブジェクト（リスト・辞書）を関数の既定引数にすると、呼び出し間で状態が共有される
  - 実行速度は C や Go の数十分の一になることがある。ボトルネックはライブラリ（NumPy、pandas、Polars）に任せる前提で設計する
cost:
  model: free
  note: PSF ライセンスで無償、商用利用も制限なし
  source: https://docs.python.org/3/license.html
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: typescript
    difference: TypeScript はコンパイル時に型を検査し、ブラウザとサーバーの両方で同じ言語を使える。データ処理と AI のライブラリは Python が厚く、Web 画面は TypeScript が厚い
  - tool: go
    difference: Go は単一バイナリで配布でき、並列処理が言語機能として軽い。書く量は増えるが実行速度と配布の容易さで勝る。CLI や常駐サーバーなら Go
verdict: データ処理・自動化スクリプト・AI 連携・学習用途では第一候補。配布が単一バイナリである必要がある場合、CPU 並列が要る場合、ブラウザで動かす場合は他言語を選ぶ
updatedAt: 2026-09-13
---

「とりあえず書いて動かす」までの距離が最短の言語で、データ処理（pandas、Polars）、機械学習（PyTorch、scikit-learn）、自動化の分野でライブラリが最も厚い。

制約の中心は実行速度と並列性である。重い処理は自分で書かず、C で実装されたライブラリに委ねるのが前提の設計になる。この前提が成り立たない領域（ゲームエンジン、組み込み、高頻度取引）では最初から候補に入らない。
