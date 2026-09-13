/** サイト全体の定数。SPEC.md 6.4 の閾値はここだけで変える。 */

export const SITE_NAME = 'Toolmap';
export const SITE_TAGLINE = 'ソフトウェアの地図。制約つきで。';
export const SITE_DESCRIPTION =
  'プログラミングを学び始めた人のための地図。ソフトウェアを構成する12の分野がそれぞれ何をして、どうつながっているかを解説し、各分野の代表的なツールの「できること・できないこと・限界値」を出典つきで並べる。';

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

/** 種別の説明（初学者向け）。比較表を種別で分けるときの見出しの下に出す */
export const LAYER_DESCRIPTIONS = {
  language: '言語そのもの。標準のツールチェーンを含む',
  runtime: '言語を動かす処理系。言語とは別に選ぶ',
  framework: '自分で書くコードの土台になるライブラリ。動かす場所は自分で用意する',
  'managed-service': '事業者が運用していて、借りて使うサービス。運用を任せられる代わりに、プランの上限が乗る',
  tool: '自分の環境にインストールして使うソフトウェア。無料のものが多いが、運用は自分で持つ',
  protocol: '仕様・規格そのもの。実装は別にあり、用語を知るために載せている',
} as const;

/** 種別で分けるときの並び。自分で動かすものから、借りるものへ */
export const LAYER_ORDER = [
  'language',
  'runtime',
  'framework',
  'tool',
  'managed-service',
  'protocol',
] as const;

/** 比較表の行順（6.3）。maturity → learningCost */
export const MATURITY_ORDER = ['stable', 'growing', 'legacy', 'deprecated'] as const;
export const LEARNING_COST_ORDER = ['low', 'medium', 'high'] as const;
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
