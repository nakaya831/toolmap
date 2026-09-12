# エントリの追加・更新手順

本書は SPEC.md 9.2 の手順を具体化したもの。執筆の細則は `docs/AUTHORING.md`、スキーマは `src/content.config.ts` が正である。

## 前提

- Node.js 22.12 以上（`node --version`）
- `npm install` 済み

## 1. ツールを1件追加する

1. **掲載基準を満たすか確認する**（SPEC 9.1）。次の3つが書けないツールは載せない。
   - できないことを1件以上、具体的に
   - 制約を1件以上、公式ドキュメントの出典つきで
   - 選定判断を「どういう時に選ぶか／避けるか」の形で
2. **分類と能力を確認する。** `src/data/categories/` から主分類を1つ選ぶ。必要な能力（動詞句）が `src/data/capabilities/` に無ければ、先に capability を追加する（下記 3）。
3. **`src/data/tools/<id>.md` を作る。** ID は公式名称の小文字 kebab-case（SPEC 4.4.2）。既存の完成例（`google-apps-script.md` など）をコピーして書き換えるのが早い。
4. **制約を公式ドキュメントで確認する。** 値・URL・確認日を記録する。AI の出力や記憶をそのまま転記しない。確認できない数値は載せない。
5. **検証する。**
   ```
   node scripts/validate-entries.ts src/data/tools/<id>.md
   ```
6. **ビルドを通す。**
   ```
   npm run build
   ```
   参照先（category / can / alternatives.tool）が存在しない、必須項目が無い、`oneLiner` が 60 字を超える、などはここで落ちる。
7. **リンクの死活を確認する。**
   ```
   npm run check:links
   ```
8. Pull Request を出す。CI が 5〜7 を再実行する。

## 2. 既存ツールの事実を再確認する（鮮度維持）

月次で `npm run check:freshness` の結果が Issue に起票される。

1. 出典リンク先で現在の値を確認する
2. 値が同じなら `verifiedAt` だけを今日の日付にする
3. 値が変わっていれば `value` と `impact` を更新し、`verifiedAt` と `updatedAt` を今日にする
4. 出典ページが消えていれば、公式の新しいページを探して `source` を差し替える。見つからなければその制約行を削除する（出典なしの数値は残さない）

## 3. capability を追加する

1. 名前は**利用者の目的を動詞句**で書く（「定期的に処理を実行する」）。ツールの機能名（「Cron」）にしない
2. 既存の capability で表現できないか先に確認する。1つの capability に紐づくツールが常に1件しかないなら、粒度が細かすぎる
3. `src/data/capabilities/<id>.md` を作る。`group` は 8 種（run / store / connect / ship / secure / operate / process / ai）から選ぶ
4. `axes` に、その能力で選ぶときに見る軸を 3〜5 個書く

紐づくツールが 2 件に達するまで、索引（`/capabilities/`）には表示されない。

## 4. シナリオを追加する

1. `title` は利用者の言葉（「毎朝、スプレッドシートの集計を Slack に流したい」）
2. `needs` に必要な能力を列挙する
3. `candidates` は 2 件以上。必ず `avoid` か `overkill` を 1 件以上含め、「何を選ばないか」を示す
4. 本文に、候補間の分岐条件を「〜なら A、〜なら B」の形で 3〜5 行書く

## 5. 分類を変える・増やす

分類（12 件）の変更は SPEC 第 5 章の改訂を伴う。Issue で先に相談する。

## 6. ID の変更

公開済みの ID は変えない。やむを得ず変える場合は `public/_redirects` に旧 URL からのリダイレクトを追加する。

## 7. 書いてはいけないもの

- 使い方、チュートリアル、コード例
- 出典のない数値
- 第三者ブログを出典にした事実
- 「大規模には向かない」のような、条件を特定しない記述
