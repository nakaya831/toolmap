---
name: cron / systemd timer
aliases: [crontab, cronie, systemd.timer, OnCalendar, クーロン]
category: automation
layer: tool
oneLiner: Linux 標準の定期実行機構。分単位の予定でコマンドを起動する
officialUrl: https://man7.org/linux/man-pages/man5/crontab.5.html
docsUrl: https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html
can: [run-on-schedule]
cannot:
  - cron での秒単位の間隔指定（時刻フィールドは分・時・日・月・曜日の5つ。秒が要るなら systemd timer）
  - マシン停止中に過ぎた予定の追い付き実行（cron は現在の分に一致するかだけを見る。systemd timer は Persistent=true にした場合のみ可）
  - 失敗時の自動再試行と通知（出力は crontab 所有者へのメール送信のみ。監視・アラートは別途）
  - 複数マシンにまたがるスケジューリングや重複起動の排除（1台の中のローカルデーモン）
  - ジョブ間の依存関係の制御（前の処理の完了を待って次を起動する仕組みがない）
constraints:
  - label: 最小実行間隔（cron）
    value: 1分。時刻フィールドは分（0-59）・時（0-23）・日（1-31）・月（1-12）・曜日（0-7）の5つで、秒は指定できない。cron は毎分エントリを検査する
    impact: 「30秒ごと」は書けない。1分未満の間隔が要るなら systemd timer か、常駐プロセス内のループにする
    source: https://man7.org/linux/man-pages/man5/crontab.5.html
    verifiedAt: 2026-09-13
  - label: 停止中の予定の扱い（systemd timer）
    value: Persistent= の既定は false。true にすると最後の起動時刻をディスクに保存し、タイマーが非アクティブだった期間に1回以上該当していれば、次の起動直後に実行する
    impact: 既定のままでは、夜間に電源が落ちていた日の「毎日 3:00 のバックアップ」は実行されない。ノート PC や停止するサーバーでは Persistent=true を明示する
    source: https://github.com/systemd/systemd/blob/main/man/systemd.timer.xml
    verifiedAt: 2026-09-13
  - label: 起動時刻の精度（systemd timer）
    value: AccuracySec= の既定は 1分。予定時刻からこの幅の中のいずれかの時点で起動する（省電力のため起床をまとめる）。RandomizedDelaySec= は既定 0
    impact: 「3:00:00 ちょうど」に動かしたいなら AccuracySec=1s 等を明示する。既定では最大1分遅れる
    source: https://github.com/systemd/systemd/blob/main/man/systemd.timer.xml
    verifiedAt: 2026-09-13
  - label: 時刻変更・夏時間の扱い（cron）
    value: 3時間未満の時刻変更は補正される（前進で飛ばされた予定は即時実行、後退では二重実行を回避）。3時間以上の変更は時計やタイムゾーンの修正と見なし、新しい時刻を即座に使う
    impact: 夏時間のある地域で 2:00〜3:00 に予定を置くと、年に一度スキップか二重実行の対象になる。日付が変わる直前直後の予定も同様に注意する
    source: https://man7.org/linux/man-pages/man8/cron.8.html
    verifiedAt: 2026-09-13
  - label: 日と曜日を両方指定した場合の一致条件（cron）
    value: 日フィールドと曜日フィールドの両方が * でない場合、どちらか一方が一致すれば実行される（OR）
    impact: 「毎月13日かつ金曜日」のような AND 条件は書けない。コマンド側で曜日判定して抜ける
    source: https://man7.org/linux/man-pages/man5/crontab.5.html
    verifiedAt: 2026-09-13
  - label: 実行結果の通知手段（cron）
    value: コマンドの出力は crontab 所有者（または MAILTO で指定した宛先）にメールで送られる。-s オプションで syslog へ送る設定も可。再実行やアラートの機能はない
    impact: メール送信が構成されていないサーバーでは出力が捨てられ、失敗に気づけない。標準出力をファイルにリダイレクトするか、外部監視に送る
    source: https://man7.org/linux/man-pages/man8/cron.8.html
    verifiedAt: 2026-09-13
pitfalls:
  - cron の実行環境は対話シェルと異なり、PATH などの環境変数が最小限。手で動くコマンドが cron では「見つからない」で失敗する。絶対パスで書き、必要な環境変数は crontab 内で定義する
  - 前回の実行が終わる前に次の予定が来ると、同じジョブが重複して走る。flock などで排他する
  - crontab のコマンド欄では % が改行に解釈される。date +%Y のような書き方はエスケープが必要
  - タイムゾーンはデーモンの環境で決まる。コンテナやクラウド VM では UTC になっていることが多く、日本時間のつもりの予定が9時間ずれる
cost:
  model: free
  note: cron（cronie 等）と systemd は Linux ディストリビューションに同梱されており追加費用はない。費用は動かし続けるマシン自体にかかる。マシンを持たずに定期実行したい場合は GitHub Actions の schedule や GAS のトリガーが代替になる
  source: https://github.com/systemd/systemd/blob/main/README
  verifiedAt: 2026-09-13
learningCost: low
maturity: stable
alternatives:
  - tool: github-actions
    difference: GitHub Actions の schedule はマシン不要で、リポジトリの YAML に書くだけで動く。ただし最短5分間隔で、混雑時は遅延し、時刻厳守はできない。cron は自分のマシンが要るが1分間隔で確実に起動する
  - tool: google-apps-script
    difference: GAS の時間主導トリガーはサーバー不要だが、実行時刻は指定した時間帯の中でばらつき、1実行6分の上限がある。cron は任意のコマンドを時間制限なく起動できる
  - tool: n8n
    difference: n8n はスケジュール実行に加えて SaaS 接続・分岐・失敗時の記録を画面で持つ。cron はコマンドを起動するだけで、ログ・再実行・通知は自前で用意する
verdict: 自分が管理する Linux マシンで定期的にコマンドを起動するなら第一候補で、追加コストも学習コストも最小。ただし「マシン停止中の予定の追い付き」「失敗時の再実行と通知」「複数台での重複排除」のどれかが要件に入った時点で、systemd timer の Persistent= か、外部のスケジューラ（GitHub Actions、n8n、ワークフローエンジン）に切り替える
updatedAt: 2026-09-13
---

cron は Unix 系 OS に数十年前から備わる定期実行デーモンで、crontab の1行が「いつ・何を」を表す。systemd timer は systemd を採用した Linux における後継的な仕組みで、秒単位の指定、停止中に過ぎた予定の追い付き（Persistent=）、起動時刻の精度制御（AccuracySec=）など、cron にない制御を持つ。

どちらも「起動する」だけの道具で、実行結果の記録・失敗時の再試行・通知は含まれない。最初に当たる制約は cron の「分単位」よりも、「動いていることを誰も見ていない」という運用上の性質である。定期処理が止まっても気づく仕組みがないため、監視を別に置くことが前提になる。
