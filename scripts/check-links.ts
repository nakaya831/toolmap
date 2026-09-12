// 出典・公式URLの死活確認（SPEC 9.2 / 9.3）
// 使い方: node scripts/check-links.ts [--report reports/links.md]
// 終了コード 1 = 到達できないURLがある
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { readCollection, rel } from './lib.ts';

const TIMEOUT_MS = 15_000;
const CONCURRENCY = 6;
const UA = 'Mozilla/5.0 (compatible; toolmap-linkcheck/1.0; +https://toolmap.pages.dev/about/)';

interface Ref {
  url: string;
  where: string[];
}

const refs = new Map<string, Ref>();
const add = (url: string, where: string) => {
  const r = refs.get(url) ?? { url, where: [] };
  r.where.push(where);
  refs.set(url, r);
};
for (const t of readCollection('tools')) {
  const f = rel(t.file);
  add(t.data.officialUrl, `${f} officialUrl`);
  add(t.data.docsUrl, `${f} docsUrl`);
  add(t.data.cost?.source, `${f} cost.source`);
  (t.data.constraints ?? []).forEach((c: any, i: number) => add(c.source, `${f} constraints[${i}]`));
}

async function probe(url: string): Promise<{ ok: boolean; status: number | string }> {
  const attempt = async (method: 'HEAD' | 'GET') => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        signal: ctrl.signal,
        headers: { 'user-agent': UA, accept: 'text/html,*/*' },
      });
      // 本文は捨てる（GET のとき）
      if (method === 'GET') await res.body?.cancel();
      return res.status;
    } finally {
      clearTimeout(timer);
    }
  };
  try {
    let status = await attempt('HEAD');
    if (status === 405 || status === 403 || status === 404 || status >= 500) status = await attempt('GET');
    return { ok: status >= 200 && status < 400, status };
  } catch (e) {
    return { ok: false, status: (e as Error).name === 'AbortError' ? 'timeout' : String((e as Error).message) };
  }
}

// ボット遮断・レート制限・認証要求。ページは存在するが機械では確認できない状態
const BLOCKED = new Set([401, 403, 418, 429]);

const list = [...refs.values()];
const results: { ref: Ref; ok: boolean; status: number | string }[] = [];
let cursor = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (cursor < list.length) {
      const ref = list[cursor++]!;
      const r = await probe(ref.url);
      results.push({ ref, ...r });
      process.stdout.write(r.ok ? '.' : 'x');
    }
  }),
);
process.stdout.write('\n');

const failed = results.filter((r) => !r.ok);
const blocked = failed.filter((r) => typeof r.status === 'number' && BLOCKED.has(r.status));
const bad = failed
  .filter((r) => !(typeof r.status === 'number' && BLOCKED.has(r.status)))
  .sort((a, b) => a.ref.url.localeCompare(b.ref.url));
console.log(`${results.length} URL を確認、${bad.length} 件に問題、${blocked.length} 件は機械確認不能（遮断）`);
for (const b of bad) {
  console.log(`  [${b.status}] ${b.ref.url}`);
  for (const w of b.ref.where) console.log(`      ${w}`);
}
for (const b of blocked) {
  console.log(`  (遮断 ${b.status}) ${b.ref.url}  ← ブラウザで開いて目視確認`);
}

const reportIdx = process.argv.indexOf('--report');
if (reportIdx !== -1) {
  const path = process.argv[reportIdx + 1] ?? 'reports/links.md';
  const lines = [
    `# リンク死活レポート（${new Date().toISOString().slice(0, 10)}）`,
    '',
    `${results.length} URL を確認し、${bad.length} 件に到達できませんでした。${blocked.length} 件はボット遮断等で機械確認できません（目視で確認してください）。`,
    '',
    ...(bad.length
      ? ['| 状態 | URL | 参照元 |', '| --- | --- | --- |', ...bad.map((b) => `| ${b.status} | ${b.ref.url} | ${b.ref.where.join('<br>')} |`)]
      : ['到達不能なリンクはありません。']),
    '',
    ...(blocked.length
      ? ['### 機械確認不能（遮断）', '', '| 状態 | URL | 参照元 |', '| --- | --- | --- |', ...blocked.map((b) => `| ${b.status} | ${b.ref.url} | ${b.ref.where.join('<br>')} |`), '']
      : []),
  ];
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, lines.join('\n'));
  console.log(`レポート: ${path}`);
}
process.exit(bad.length ? 1 : 0);
