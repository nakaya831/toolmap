---
name: FastAPI
aliases: [fastapi, Fast API, FastAPI (Python)]
category: backend
layer: framework
oneLiner: 型ヒントからAPI仕様と検証を自動生成する、Pythonの非同期Webフレームワーク
officialUrl: https://fastapi.tiangolo.com/
docsUrl: https://fastapi.tiangolo.com/tutorial/
can: [expose-http-api, run-long-process]
cannot:
  - HTTPS の終端（TLS 証明書の処理は Nginx・Caddy・Traefik 等のプロキシに任せる前提）
  - 実行基盤の提供（サーバー・コンテナ・関数基盤は別に用意し、そこで ASGI サーバーを動かす）
  - 複数プロセス・複数サーバーにまたがる重いバックグラウンド処理（BackgroundTasks は同一プロセス内。Celery 等のジョブキューが別途必要）
  - Python 3.9 以前の環境での動作
  - ブラウザ側の画面構築（テンプレート描画はできるが、コンポーネント指向の UI は React 等の領分）
constraints:
  - label: 対応 Python バージョン
    value: Python 3.10 以上（3.10〜3.14 を公式サポート）
    impact: OS 同梱の古い Python や、3.9 で止まっているサーバーでは動かない。実行環境の Python を先に確認する
    source: https://github.com/fastapi/fastapi/blob/master/pyproject.toml
    verifiedAt: 2026-09-13
  - label: 同期関数と非同期関数の実行方式
    value: def で書いた処理は外部スレッドプールで実行、async def はイベントループ上で直接実行される（依存関係の関数も同じ）
    impact: async def の中でブロッキング I/O（同期 DB ドライバ、requests 等）を呼ぶとイベントループが止まり、全リクエストが待たされる。同期ライブラリを使う処理は def で書く
    source: https://fastapi.tiangolo.com/async/
    verifiedAt: 2026-09-13
  - label: バージョン互換性の方針
    value: 0.x 系。MINOR バージョンで破壊的変更と新機能が入り、PATCH のみが非破壊
    impact: 「fastapi>=0.112.0,<0.113.0」のように MINOR を固定しないと、依存更新で API が壊れる
    source: https://fastapi.tiangolo.com/deployment/versions/
    verifiedAt: 2026-09-13
  - label: 既定のプロセス数
    value: 1 プロセス（fastapi run / uvicorn の既定）。--workers N で複製してマルチコアを使う
    impact: 1 プロセスでは CPU コアを1つしか使えない。ワーカーを増やすとプロセス内メモリの状態（キャッシュ・接続）は共有されなくなる
    source: https://fastapi.tiangolo.com/deployment/server-workers/
    verifiedAt: 2026-09-13
  - label: HTTPS の扱い
    value: アプリケーションサーバー（Uvicorn）は HTTPS を処理せず、TLS 終端プロキシと平文 HTTP で通信する構成が公式の前提
    impact: 公開時はプロキシ（Traefik、Caddy、Nginx、HAProxy）か、HTTPS を提供するホスティング基盤が別途必要になる
    source: https://fastapi.tiangolo.com/deployment/https/
    verifiedAt: 2026-09-13
  - label: ファイルアップロードの前提
    value: python-multipart の追加インストールが必要。File / Form パラメータと JSON の Body は同一エンドポイントで併用できない（HTTP の仕様上、1リクエストの本文は1形式）
    impact: ファイルとメタデータを同時に受けるなら、メタデータも Form フィールドにするか、エンドポイントを分ける
    source: https://fastapi.tiangolo.com/tutorial/request-files/
    verifiedAt: 2026-09-13
pitfalls:
  - async def のエンドポイントで同期の DB ドライバや requests を呼び、負荷をかけたときだけ全体が遅くなる
  - Starlette と Pydantic のバージョンに挙動が引きずられる。FastAPI だけでなく依存ごとロックファイルで固定する
  - 自動生成される /docs と /openapi.json を本番でも公開したままにし、内部 API の構造が外部から見える
  - --workers でプロセスを増やした後、プロセス内変数に置いたキャッシュや WebSocket 接続の一覧がワーカー間で食い違う
cost:
  model: free
  note: MIT ライセンスで無償。費用は動かすサーバー・コンテナ・関数基盤の側で発生する
  source: https://github.com/fastapi/fastapi/blob/master/LICENSE
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: hono
    difference: Hono は TypeScript で Web 標準 API のみを使い、Cloudflare Workers 等のエッジでも同じコードが動く。FastAPI は Python のデータ処理・AI ライブラリと同居でき、型ヒントから検証と OpenAPI を自動生成する
  - tool: go
    difference: Go は標準ライブラリだけで HTTP サーバーを書け、単一バイナリで配布でき、並列処理が言語機能として軽い。FastAPI は書く量が少なく Python 資産を直接使えるが、CPU 負荷の高い処理と配布の軽さでは Go が勝る
verdict: Python でデータ処理や AI 推論を HTTP API として公開する用途では第一候補。CPU 負荷の高い処理を1プロセスで並列に捌く必要がある場合、エッジ配置や単一バイナリ配布が要る場合は避け、Go か Hono へ
updatedAt: 2026-09-13
---

Starlette（Web 部分）と Pydantic（データ検証）の上に作られたフレームワークで、関数の型ヒントを書くだけで入力検証・シリアライズ・OpenAPI 仕様・対話型ドキュメントが揃う。Python 側にある pandas・PyTorch・各種 AI SDK をそのまま API 化できる点が、他言語のフレームワークに対する実質的な差である。

利用者が最初に当たるのは Python のバージョン要件（3.10 以上）で、次に当たるのが async def と def の使い分けである。async def の中に同期のブロッキング処理を書いても開発中は動くため、負荷がかかった本番で初めてイベントループの停止として現れる。
