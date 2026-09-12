// 検証日の経過日数を検査する（SPEC 6.4 / 9.3）
// 使い方: node scripts/check-freshness.ts [--report reports/freshness.md] [--fail-over 365]
// 既定では情報表示のみ。--fail-over N を付けると N 日超の事実があれば終了コード 1。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { daysSince, readCollection, rel } from './lib.ts';

const WARN = 180;
const STALE = 365;

interface Row {
  file: string;
  tool: string;
  what: string;
  verifiedAt: Date;
  days: number;
  source: string;
}

const rows: Row[] = [];
for (const t of readCollection('tools')) {
  const f = rel(t.file);
  for (const c of t.data.constraints ?? []) {
    const d = new Date(c.verifiedAt);
    rows.push({ file: f, tool: t.data.name, what: c.label, verifiedAt: d, days: daysSince(d), source: c.source });
  }
  if (t.data.cost?.verifiedAt) {
    const d = new Date(t.data.cost.verifiedAt);
    rows.push({ file: f, tool: t.data.name, what: 'cost', verifiedAt: d, days: daysSince(d), source: t.data.cost.source });
  }
}
rows.sort((a, b) => b.days - a.days);

const stale = rows.filter((r) => r.days > STALE);
const warn = rows.filter((r) => r.days > WARN && r.days <= STALE);
console.log(`${rows.length} 件の事実。${STALE}日超 ${stale.length} 件、${WARN}日超 ${warn.length} 件`);
for (const r of [...stale, ...warn].slice(0, 50)) {
  console.log(`  ${r.days}日  ${r.tool} / ${r.what}  (${r.file})`);
}

const fmt = (r: Row) => `| ${r.days} | ${r.tool} | ${r.what} | ${r.verifiedAt.toISOString().slice(0, 10)} | [出典](${r.source}) | ${r.file} |`;
const reportIdx = process.argv.indexOf('--report');
if (reportIdx !== -1) {
  const path = process.argv[reportIdx + 1] ?? 'reports/freshness.md';
  const table = (list: Row[]) =>
    list.length
      ? ['| 経過日 | ツール | 項目 | 検証日 | 出典 | ファイル |', '| --- | --- | --- | --- | --- | --- |', ...list.map(fmt)]
      : ['該当なし。'];
  const lines = [
    `# 鮮度レポート（${new Date().toISOString().slice(0, 10)}）`,
    '',
    `事実 ${rows.length} 件のうち、${STALE} 日超が ${stale.length} 件、${WARN} 日超が ${warn.length} 件。`,
    '',
    `## ${STALE} 日超（ページ上部に注意が出ている）`,
    '',
    ...table(stale),
    '',
    `## ${WARN} 日超（制約表の行に「要再確認」が出ている）`,
    '',
    ...table(warn),
    '',
    '再確認の手順：出典リンク先で現在の値を確認し、値が同じなら `verifiedAt` のみ、変わっていれば `value` / `impact` も更新する。',
    '',
  ];
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, lines.join('\n'));
  console.log(`レポート: ${path}`);
}

const failIdx = process.argv.indexOf('--fail-over');
if (failIdx !== -1) {
  const n = Number(process.argv[failIdx + 1] ?? STALE);
  if (rows.some((r) => r.days > n)) process.exit(1);
}
