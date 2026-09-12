/** サイト全体の定数。SPEC.md 6.4 の閾値はここだけで変える。 */

export const SITE_NAME = 'Toolmap';
export const SITE_TAGLINE = '課題から手段へ。制約つきで。';
export const SITE_DESCRIPTION =
  'プログラミングツール・サービスの「できること・できないこと・制約」を同じ物差しで並べた図鑑。課題から入って、選定に必要な制約知識に3クリックで到達する。';

/** 制約表の行に「要再確認」を出す経過日数 */
export const FRESHNESS_WARN_DAYS = 180;
/** ページ上部に注意を出す経過日数 */
export const FRESHNESS_STALE_DAYS = 365;

/** 表示ラベル。enum の値は SPEC のまま英語、画面では日本語 */
export const LABELS = {
  layer: {
    language: '言語',
    runtime: '実行環境',
    framework: 'フレームワーク',
    'managed-service': 'マネージドサービス',
    tool: 'ツール',
    protocol: 'プロトコル',
  },
  costModel: {
    free: '無料',
    'free-tier': '無料枠あり',
    'usage-based': '従量課金',
    subscription: '定額課金',
    license: 'ライセンス購入',
  },
  learningCost: {
    low: '低',
    medium: '中',
    high: '高',
  },
  maturity: {
    stable: '安定',
    growing: '成長中',
    legacy: 'レガシー',
    deprecated: '非推奨',
  },
  fit: {
    best: '第一候補',
    viable: '成立する',
    overkill: '過剰',
    avoid: '避ける',
  },
  group: {
    run: '実行する',
    store: '保存・検索する',
    connect: '外部とつなぐ',
    ship: '画面を作り、公開する',
    secure: '認証し、守る',
    operate: '開発・配信・監視を回す',
    process: 'データを加工・分析する',
    ai: 'AI・機械学習を使う',
  },
} as const;

/** 比較表の行順（6.3）。maturity → learningCost */
export const MATURITY_ORDER = ['stable', 'growing', 'legacy', 'deprecated'] as const;
export const LEARNING_COST_ORDER = ['low', 'medium', 'high'] as const;
export const FIT_ORDER = ['best', 'viable', 'overkill', 'avoid'] as const;
export const GROUP_ORDER = [
  'run',
  'store',
  'connect',
  'ship',
  'secure',
  'operate',
  'process',
  'ai',
] as const;
