---
title: 文書を投げると要約や分類を返すツールを作りたい
needs: [call-llm, run-short-function]
candidates:
  - tool: claude-api
    fit: best
    reason: 長い文書をそのまま渡せるコンテキスト長があり、要約・分類・抽出の品質が高い。トークン単位の従量課金
  - tool: openai-api
    fit: best
    reason: 同様にトークン課金で、埋め込み（ベクトル化）も同じ API で済む。既存のライブラリやサンプルが最も多い
  - tool: ollama
    fit: viable
    reason: 文書を外部に送れない場合の選択肢。手元の GPU / メモリで動く範囲のモデルに限られ、品質と速度は API に劣る
  - tool: hugging-face
    fit: overkill
    reason: モデルを自分で選び、動かす環境も自分で用意する。要約だけが目的なら API を呼ぶほうが早い
updatedAt: 2026-09-13
---

- 文書を外部に送ってよいなら **Claude API** か **OpenAI API**。どちらも従量課金で、コストは「入力トークン数 × 単価」で先に見積もれる。
- 社内文書・個人情報を含み、外部送信が許されないなら **Ollama** で手元実行。モデルサイズに応じたメモリが要る。
- 「似た文書を探す」まで必要なら、埋め込み（`embed-text`）とベクトル検索（`store-vectors`）の能力を追加で見る。
- 呼び出し側は、数秒で終わるなら **Cloudflare Workers** や **AWS Lambda** のような短時間実行で足りる。ただし関数の実行時間上限（Workers は CPU 時間、Lambda は 15 分）と LLM の応答時間を突き合わせる。
