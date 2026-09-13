// エントリの検証（ビルドを回さずに1ファイル単位で確認する）
// 使い方: node scripts/validate-entries.ts [file ...]
//   引数なしなら src/data 全体。終了コード 1 = エラーあり。
// content.config.ts と同じ強制を課す。差異が出たら content.config.ts を正とする。
import { z } from 'astro/zod';
import { readCollection, readEntry, rel, type Collection, type Entry } from './lib.ts';

const GROUPS = ['run', 'store', 'connect', 'ship', 'secure', 'operate', 'process', 'ai'] as const;
const LAYERS = ['language', 'runtime', 'framework', 'managed-service', 'tool', 'protocol'] as const;
const COST = ['free', 'free-tier', 'usage-based', 'subscription', 'license'] as const;
const LEARN = ['low', 'medium', 'high'] as const;
const MATURITY = ['stable', 'growing', 'legacy', 'deprecated'] as const;

const date = z.coerce.date().refine((d) => d.getTime() <= Date.now() + 86_400_000, {
  message: '未来の日付',
});
const url = z.url().refine((u) => u.startsWith('https://'), { message: 'https で始める' });

const fact = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  impact: z.string().min(1),
  source: url,
  verifiedAt: date,
});

const schemas = {
  categories: z.object({
    name: z.string(),
    order: z.number(),
    question: z.string(),
    summary: z.string(),
    plain: z.string().min(1),
    role: z.string().min(1),
    connections: z.array(z.object({ to: z.string(), how: z.string().min(1) })).min(1),
    startWith: z.string(),
    startWhy: z.string().min(1),
  }),
  capabilities: z.object({
    name: z.string(),
    group: z.enum(GROUPS),
    question: z.string(),
    axes: z.array(z.string()).min(1),
  }),
  tools: z.object({
    name: z.string(),
    aliases: z.array(z.string()).default([]),
    category: z.string(),
    layer: z.enum(LAYERS),
    oneLiner: z.string().max(60, { message: 'oneLiner は60字以内' }),
    officialUrl: url,
    docsUrl: url,
    can: z.array(z.string()).min(1),
    cannot: z.array(z.string().min(1)).min(1, { message: 'cannot は1件以上' }),
    constraints: z.array(fact).min(1, { message: 'constraints は1件以上' }),
    pitfalls: z.array(z.string()).default([]),
    cost: z.object({ model: z.enum(COST), note: z.string().min(1), source: url, verifiedAt: date }),
    learningCost: z.enum(LEARN),
    maturity: z.enum(MATURITY),
    alternatives: z
      .array(z.object({ tool: z.string(), difference: z.string().min(1) }))
      .default([]),
    verdict: z.string().min(1),
    updatedAt: date,
  }),
} satisfies Record<Collection, z.ZodTypeAny>;

const ids: Record<Collection, Set<string>> = {
  tools: new Set(readCollection('tools').map((e) => e.id)),
  capabilities: new Set(readCollection('capabilities').map((e) => e.id)),
  categories: new Set(readCollection('categories').map((e) => e.id)),
};

function collectionOf(file: string): Collection {
  const m = file.replaceAll('\\', '/').match(/src\/data\/(tools|capabilities|categories)\//);
  if (!m) throw new Error(`src/data 配下のファイルではない: ${file}`);
  return m[1] as Collection;
}

function validate(e: Entry): string[] {
  const errors: string[] = [];
  if (e.parseError) return [`YAML 構文エラー: ${e.parseError.split('\n')[0]}`];
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) errors.push(`ID が kebab-case でない: ${e.id}`);
  if (/^# PHASE3:/m.test(e.raw)) errors.push('PHASE3 コメント（退避した alternatives）が残っている');

  const r = schemas[e.collection].safeParse(e.data);
  if (!r.success) {
    for (const i of r.error.issues) errors.push(`${i.path.join('.') || '(root)'}: ${i.message}`);
    return errors;
  }
  const d = r.data as any;
  const ref = (kind: Collection, id: string, where: string) => {
    if (!ids[kind].has(id)) errors.push(`${where}: ${kind}/${id} が存在しない`);
  };
  if (e.collection === 'tools') {
    ref('categories', d.category, 'category');
    d.can.forEach((c: string, i: number) => ref('capabilities', c, `can[${i}]`));
    d.alternatives.forEach((a: any, i: number) => {
      ref('tools', a.tool, `alternatives[${i}].tool`);
      if (a.tool === e.id) errors.push(`alternatives[${i}]: 自分自身を代替に挙げている`);
    });
    if (new Set(d.can).size !== d.can.length) errors.push('can に重複がある');
    for (const [i, c] of d.constraints.entries()) {
      if (/\d/.test(c.value) === false && /\d/.test(c.label) === false) {
        // 数値を含まない制約は許容するが、注意として出す
        errors.push(`constraints[${i}]: 値に数値が含まれない（"${c.value}"）。限界値・上限として書けないか確認`);
      }
    }
  }
  if (e.collection === 'categories') {
    ref('tools', d.startWith, 'startWith');
    d.connections.forEach((c: any, i: number) => {
      ref('categories', c.to, `connections[${i}].to`);
      if (c.to === e.id) errors.push(`connections[${i}]: 自分自身を指している`);
    });
  }
  return errors;
}

const args = process.argv.slice(2);
const entries: Entry[] = args.length
  ? args.map((f) => {
      try {
        return readEntry(collectionOf(f), f);
      } catch (e) {
        return { collection: collectionOf(f), id: f, file: f, data: {}, body: '', raw: '', parseError: String((e as Error).message) };
      }
    })
  : (['categories', 'capabilities', 'tools'] as Collection[]).flatMap(readCollection);

let failed = 0;
const warnOnly = /値に数値が含まれない/;
for (const e of entries) {
  let errs: string[];
  try {
    errs = validate(e);
  } catch (err) {
    errs = [String(err)];
  }
  const hard = errs.filter((x) => !warnOnly.test(x));
  const soft = errs.filter((x) => warnOnly.test(x));
  if (hard.length) failed++;
  if (errs.length) {
    console.log(`${hard.length ? '✗' : '△'} ${rel(e.file)}`);
    for (const x of hard) console.log(`    ${x}`);
    for (const x of soft) console.log(`    (注意) ${x}`);
  }
}
console.log(`\n${entries.length} 件を検証、${failed} 件にエラー`);
process.exit(failed ? 1 : 0);
