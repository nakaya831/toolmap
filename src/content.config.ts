import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * スキーマ定義。SPEC.md 第4章の写し（2.0）。
 * 4.4「意図的な強制」に挙げた .min(1) / 必須項目は緩めない。
 */

// 出典付きの事実。すべての検証可能な記述はこの形を取る
const sourcedFact = z.object({
  label: z.string(), // 例: 実行時間の上限
  value: z.string(), // 例: 6分 / 実行（無償版）
  impact: z.string(), // 例: 大量処理はトリガーで分割する必要がある
  source: z.url(), // 一次情報のURL（公式ドキュメント優先）
  verifiedAt: z.coerce.date(), // 人間が原典を確認した日
});

export const CAPABILITY_GROUPS = [
  'run',
  'store',
  'connect',
  'ship',
  'secure',
  'operate',
  'process',
  'ai',
] as const;

export const LAYERS = [
  'language',
  'runtime',
  'framework',
  'managed-service',
  'tool',
  'protocol',
] as const;

export const COST_MODELS = ['free', 'free-tier', 'usage-based', 'subscription', 'license'] as const;
export const LEARNING_COSTS = ['low', 'medium', 'high'] as const;
export const MATURITIES = ['stable', 'growing', 'legacy', 'deprecated'] as const;

const categories = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/categories' }),
  schema: z.object({
    name: z.string(),
    order: z.number(), // 学習の推奨順
    question: z.string(), // このカテゴリが答える問い
    summary: z.string(),
    plain: z.string(), // 初学者向けの一言。専門用語なしで「何をする分野か」
    role: z.string(), // 全体像の中での役割
    connections: z
      .array(
        z.object({
          to: reference('categories'),
          how: z.string(), // 隣接分野との関係を動詞で
        }),
      )
      .min(1),
    startWith: reference('tools'), // この分野で最初に触るツール
    startWhy: z.string(),
  }),
});

const layers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/layers' }),
  schema: z.object({
    name: z.string(),
    order: z.number(),
    plain: z.string(), // 一言。専門用語なしで
    role: z.string(), // 種別の役割
    relations: z
      .array(
        z.object({
          to: reference('layers'),
          how: z.string(), // 他の種別との関係
        }),
      )
      .min(1),
    chooseWhen: z.string(), // いつこの種別を選ぶか
  }),
});

const capabilities = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/capabilities' }),
  schema: z.object({
    name: z.string(), // 動詞句で書く
    group: z.enum(CAPABILITY_GROUPS),
    question: z.string(), // 利用者の言葉での表現
    axes: z.array(z.string()).min(1), // 選定時に見るべき軸
  }),
});

const tools = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/tools' }),
  schema: z.object({
    name: z.string(),
    aliases: z.array(z.string()).default([]), // 検索用の別名・略称
    category: reference('categories'),
    layer: z.enum(LAYERS),
    oneLiner: z.string().max(60), // 一行での定義。60字上限は意図的な制約
    officialUrl: z.url(),
    docsUrl: z.url(),

    can: z.array(reference('capabilities')).min(1), // できること
    cannot: z.array(z.string()).min(1), // できないこと（必須）

    constraints: z.array(sourcedFact).min(1), // 先頭が最重要（比較表に載る）
    pitfalls: z.array(z.string()).default([]), // 典型的な破綻パターン

    cost: z.object({
      model: z.enum(COST_MODELS),
      note: z.string(), // 課金が跳ねる条件を書く
      source: z.url(), // 料金ページ。free でもライセンス表記のURLを置く
      verifiedAt: z.coerce.date(),
    }),

    learningCost: z.enum(LEARNING_COSTS),
    maturity: z.enum(MATURITIES),

    alternatives: z
      .array(
        z.object({
          tool: reference('tools'),
          difference: z.string(), // 「何が違うか」を必ず書く
        }),
      )
      .default([]),

    verdict: z.string(), // どういう時に選ぶか / 避けるか
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { categories, layers, capabilities, tools };
