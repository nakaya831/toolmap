---
name: React
aliases: [React.js, ReactJS, JSX]
category: frontend
layer: framework
oneLiner: コンポーネントと状態でUIを組む、ブラウザ画面向けのJavaScriptライブラリ
officialUrl: https://react.dev/
docsUrl: https://react.dev/reference/react
can: [build-web-ui]
cannot:
  - ルーティング・データ取得・サーバー描画を単体で完結させること（Next.js 等のフレームワークか個別ライブラリが必要）
  - 描画（render）中の副作用（DOM の直接変更、現在時刻の取得、外部通信）。React は同じコンポーネントを複数回描画することがある
  - フックを条件分岐・ループ・早期 return の後・イベントハンドラ・クラスコンポーネントの中で呼ぶこと
  - ビルド工程なしの JSX 実行（JSX はブラウザが解釈しないため、変換ツールが必須）
  - サーバー側での useEffect の実行（Effect はクライアントでのみ動く）
constraints:
  - label: フック呼び出しの制約（Rules of Hooks）
    value: フックは関数コンポーネントかカスタムフックの最上位でのみ呼べる。条件分岐・ループ・早期 return の後・イベントハンドラ・try/catch・useMemo や useEffect に渡す関数の中・クラスコンポーネントでは呼べない
    impact: 「条件によってこの state は要らない」という書き方ができない。条件分岐は別コンポーネントに切り出して解決する
    source: https://react.dev/reference/rules/rules-of-hooks
    verifiedAt: 2026-09-13
  - label: 描画の純粋性
    value: コンポーネントとフックは、同じ入力（props・state・context）に対して同じ出力を返さなければならない。props・state・フックの引数は変更不可で、副作用はイベントハンドラか Effect に置く
    impact: 描画中に配列を直接並び替える、日時を取る、外部に書き込むといったコードが「たまに壊れる」不具合になる。純粋関数として書けない処理は Effect に移す
    source: https://react.dev/reference/rules/components-and-hooks-must-be-pure
    verifiedAt: 2026-09-13
  - label: Strict Mode の開発時二重実行
    value: 開発時はコンポーネントの描画、Effect の setup+cleanup、ref コールバックがそれぞれ1回余分に実行される。本番ビルドには影響しない
    impact: 開発時に「API が2回呼ばれる」「ログが2回出る」のは仕様。cleanup を正しく書けば副作用は打ち消される。二重実行で壊れる処理は設計の誤り
    source: https://react.dev/reference/react/StrictMode
    verifiedAt: 2026-09-13
  - label: Effect の実行環境
    value: useEffect はクライアントでのみ実行され、サーバー描画中には動かない
    impact: サーバー描画（SSR/RSC）と組み合わせると、Effect に置いたデータ取得は初回 HTML に含まれない。サーバーで必要なデータはフレームワーク側の仕組みで取る
    source: https://react.dev/reference/react/useEffect
    verifiedAt: 2026-09-13
  - label: バージョン方針
    value: semver に従い、破壊的変更はメジャー版のみ。脆弱性の修正は影響を受ける全メジャー版に配布。Canary / Experimental チャネルは semver に従わず、連続するリリース間で破壊的変更が起こり得る
    impact: Latest チャネルなら同一メジャー内の更新は安全。フレームワークが同梱する Canary 版に依存すると、更新のたびに動作が変わり得る
    source: https://react.dev/community/versioning-policy
    verifiedAt: 2026-09-13
  - label: React 19 で削除されたレガシー API
    value: createFactory、クラスコンポーネントの propTypes・contextTypes・childContextTypes・getChildContext・this.refs は React 19 で削除。Component・PureComponent・forwardRef・createRef・Children・cloneElement は非推奨扱いで残る
    impact: 2010年代の記事やライブラリのコードは React 19 でそのままでは動かないことがある。依存ライブラリの対応版を確認する
    source: https://react.dev/reference/react/legacy
    verifiedAt: 2026-09-13
pitfalls:
  - useEffect でのデータ取得は、前のリクエストが後から返る競合とクリーンアップ忘れを起こしやすい。データ取得は専用ライブラリ（TanStack Query 等）かフレームワークの仕組みに任せる
  - 配列描画の key に配列の添字を使うと、並び替えや削除で state が別の要素に付いたままになる。データ側の一意な ID を使う
  - 依存配列の抜けで古い値を参照し続ける（stale closure）。eslint-plugin-react-hooks を必ず入れる
  - state の配列・オブジェクトを直接変更しても再描画されない。新しいオブジェクトを作って setter に渡す
cost:
  model: free
  note: MIT License で無償、商用利用も制限なし。費用は配信するホスティング側で発生する
  source: https://github.com/facebook/react/blob/main/LICENSE
  verifiedAt: 2026-09-13
learningCost: medium
maturity: stable
alternatives:
  - tool: nextjs
    difference: Next.js は React を土台にルーティング・サーバー描画・API・画像最適化を同梱するフレームワーク。React 単体はビルド構成と周辺ライブラリを自分で選ぶ分、構成の自由度が高く、依存も少ない
  - tool: astro
    difference: Astro は既定で JavaScript を出力しない静的サイト向けで、必要な部分だけ React 等を島として埋め込む。操作の多い画面全体を動かすなら React、文章中心なら Astro
verdict: 操作の多いブラウザ画面（管理画面、ダッシュボード、フォーム主体のアプリ）では第一候補で、周辺ライブラリと情報の厚さが最大の利点。ルーティングやサーバー描画まで必要なら React 単体ではなく Next.js 等のフレームワークから始め、文書中心の静的サイトは Astro へ
updatedAt: 2026-09-13
---

Meta が公開する UI ライブラリで、画面をコンポーネントに分け、state の変化に応じて差分だけを描き直す。ライブラリ本体はビュー層のみで、ルーティング・データ取得・サーバー描画は周辺ライブラリかフレームワーク（Next.js 等）に委ねる構造になっている。

最初に当たる制約はフックの呼び出し規則で、「条件によって state を持つ／持たない」という自然な発想がそのまま書けない。次に当たるのが描画の純粋性で、開発時に Strict Mode が描画と Effect を2回走らせるため、副作用を描画中に書いたコードは開発環境で必ず露見する。いずれも React の最適化（描画の中断・再実行）を可能にするための前提であり、回避策ではなく設計で従う必要がある。
