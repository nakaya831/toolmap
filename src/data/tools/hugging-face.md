---
name: Hugging Face
aliases: [HF, Hugging Face Hub, Hub]
category: ai
layer: managed-service
oneLiner: 機械学習モデル・データセットを共有し、推論も呼び出せるハブ兼API
officialUrl: https://huggingface.co/
docsUrl: https://huggingface.co/docs
can: [run-models-locally, call-llm, embed-text, train-models]
cannot:
  - 無料プランの推論クレジットだけでの継続的な本番運用（Freeユーザーの月次クレジットは$0.10相当で、量を使うには従量課金への移行が前提）
  - 無料プランでの大容量な非公開データの保存（非公開ストレージは100GBまで。それ以上は有料プランかストレージアドオンが必要）
  - 1ファイルあたり500GBを超えるモデル・データセットの保存（Hub全体のハード上限）
  - リポジトリを跨いだリレーショナルなクエリ（Gitベースのバージョン管理であり、RDBMSではない）
  - 単一ベンダーAPIのような単純な固定料金での運用（料金体系は複数の従量課金軸（ストレージ・推論・計算資源）が併存する）
constraints:
  - label: 無料プランの推論クレジット（Inference Providers）
    value: 無料ユーザーは月$0.10相当のクレジット（変更の可能性あり）。PROユーザーは月$2.00
    impact: 無料枠は数回のAPI呼び出しで使い切る規模。継続的な推論利用には従量課金（Pay-as-you-go）への移行が前提になる
    source: https://huggingface.co/docs/inference-providers/pricing
    verifiedAt: 2026-09-13
  - label: 無料アカウントのストレージ上限
    value: 非公開リポジトリは100GBまで無料。公開リポジトリはベストエフォート（明確な上限はないが大容量利用は有料プラン推奨）
    impact: 大きな非公開モデル・データセットを複数保持すると100GBにすぐ到達する。PROは1TB＋従量課金の私有ストレージが使える
    source: https://huggingface.co/docs/hub/repositories-recommendations
    verifiedAt: 2026-09-13
  - label: リポジトリのファイル数・単一ファイルサイズの推奨/上限
    value: リポジトリあたりファイル数は10万未満推奨、1フォルダあたり1万ファイル未満が上限。単一ファイルは500GBがハード上限（200GB未満への分割を推奨）
    impact: 大量の小ファイルやチェックポイントをそのまま置くとGitベースの操作性能が劣化する。サブディレクトリ分割やParquet等への統合が必要
    source: https://huggingface.co/docs/hub/repositories-recommendations
    verifiedAt: 2026-09-13
  - label: PROプランの料金と上乗せ
    value: 月$9で非公開ストレージ10倍・公開ストレージ2倍・推論クレジット20倍（月$2相当）・ZeroGPU割当8倍
    impact: 個人開発者がストレージや推論クレジットで頻繁に上限に当たるなら、月$9のPRO移行が最初の選択肢になる
    source: https://huggingface.co/pricing
    verifiedAt: 2026-09-13
  - label: Inference Endpointsの時間課金
    value: CPUインスタンスは$0.033/時間から、GPUはT4の$0.50/時間からH100 8基構成の$74.00/時間まで
    impact: 専用エンドポイントは起動している間課金され続ける。使わない時間帯は停止しないと費用が積み上がる
    source: https://huggingface.co/pricing
    verifiedAt: 2026-09-13
pitfalls:
  - 無料の推論クレジット（月$0.10）をデモやチュートリアルの動作確認だと勘違いし、そのまま継続利用しようとして早々に費用が発生する
  - LFSでモデルファイルを削除してもポインタだけでは容量が解放されない。履歴の書き換え（super-squash等）まで行わないとストレージ使用量が減らない
  - Hub上のモデルカードやライセンス表記を確認せずにモデルを商用利用し、ライセンス条件（非商用限定等）に抵触する
cost:
  model: free-tier
  note: Hubの閲覧・公開リポジトリ利用は無料。無料の推論クレジットは月$0.10とごく小さく、実運用は従量課金のInference ProvidersかPRO/Team/Enterprise契約が前提になる
  source: https://huggingface.co/pricing
  verifiedAt: 2026-09-13
learningCost: medium
maturity: growing
alternatives:
  - tool: openai-api
    difference: OpenAI APIは単一ベンダーの高品質モデルにAPI一本でアクセスでき運用が単純。モデル選択の自由度と自己ホストの柔軟性が必要ならHugging Face、運用の単純さを優先するならOpenAI API
  - tool: ollama
    difference: OllamaはHugging Face Hub上の多くのモデルもダウンロードして手元のマシンで無料に動かせる。クラウドでの共有・学習環境やAPIホスティングまで必要ならHugging Face、完全にローカルで完結させたいならOllama
  - tool: claude-api
    difference: Claude APIは埋め込みエンドポイントを持たずテキスト生成・エージェント用途に特化する。モデルの選定幅や学習・埋め込みまで一つのプラットフォームで扱いたいならHugging Face
verdict: モデル・データセットの共有や複数モデルの比較検討、将来の自前ホスティングを見据えた検証では第一候補。無料の推論クレジット（月$0.10）や無料ストレージ上限（非公開100GB）に触れたら、PRO/Team契約かInference Endpointsの従量課金を検討する。単一の高品質モデルにAPI一本で任せたいだけならOpenAI APIやClaude APIのほうが単純
updatedAt: 2026-09-13
---

モデル・データセット・Spaces（デモアプリ）を公開・共有するGitベースのハブであり、`transformers` や `huggingface_hub` ライブラリを通じて手元での実行や学習にも使える。加えてInference Providers経由で複数のホスティング事業者のLLM・画像モデルをAPIとして呼び出せる、ハブとAPIの二面性を持つ。

利用者が最初に当たるのは無料の推論クレジットの小ささ（月$0.10相当）である。モデルを探して試すだけなら無料枠で足りるが、継続的にAPI呼び出しを行う用途では早々に従量課金かPROプランへの移行が必要になる。次に当たるのが非公開リポジトリの100GBというストレージ上限で、大きなモデルを複数保持するチームはここで有料化を検討することになる。
