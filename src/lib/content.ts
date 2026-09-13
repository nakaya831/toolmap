import { getCollection, type CollectionEntry } from 'astro:content';
import { GROUP_ORDER, LEARNING_COST_ORDER, MATURITY_ORDER } from '@/config';

export type Tool = CollectionEntry<'tools'>;
export type Capability = CollectionEntry<'capabilities'>;
export type Category = CollectionEntry<'categories'>;
export type Layer = CollectionEntry<'layers'>;

/** 比較表の行順（SPEC 6.3）：maturity → learningCost → name */
export function sortTools(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) => {
    const m = MATURITY_ORDER.indexOf(a.data.maturity) - MATURITY_ORDER.indexOf(b.data.maturity);
    if (m !== 0) return m;
    const l =
      LEARNING_COST_ORDER.indexOf(a.data.learningCost) -
      LEARNING_COST_ORDER.indexOf(b.data.learningCost);
    if (l !== 0) return l;
    return a.data.name.localeCompare(b.data.name, 'ja');
  });
}

/** 一覧向け：学習コストの低い順 → 名前。初学者が上から読める並び */
export function sortToolsForLearning(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) => {
    const l =
      LEARNING_COST_ORDER.indexOf(a.data.learningCost) -
      LEARNING_COST_ORDER.indexOf(b.data.learningCost);
    if (l !== 0) return l;
    return a.data.name.localeCompare(b.data.name, 'ja');
  });
}

export function sortCategories(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => a.data.order - b.data.order);
}

export function sortCapabilities(caps: Capability[]): Capability[] {
  return [...caps].sort((a, b) => {
    const g = GROUP_ORDER.indexOf(a.data.group) - GROUP_ORDER.indexOf(b.data.group);
    if (g !== 0) return g;
    return a.id.localeCompare(b.id);
  });
}

export async function getAll() {
  const [tools, capabilities, categories, layers] = await Promise.all([
    getCollection('tools'),
    getCollection('capabilities'),
    getCollection('categories'),
    getCollection('layers'),
  ]);
  return {
    tools: sortTools(tools),
    capabilities: sortCapabilities(capabilities),
    categories: sortCategories(categories),
    layers: [...layers].sort((a, b) => a.data.order - b.data.order),
  };
}

export function toolsInLayer(tools: Tool[], layerId: string): Tool[] {
  return sortTools(tools.filter((t) => t.data.layer === layerId));
}

/** ある種別を relations で指している種別（逆参照） */
export function relatedFrom(layers: Layer[], layerId: string) {
  return [...layers]
    .sort((a, b) => a.data.order - b.data.order)
    .filter((l) => l.id !== layerId && l.data.relations.some((x) => x.to.id === layerId))
    .map((l) => ({ layer: l, how: l.data.relations.find((x) => x.to.id === layerId)!.how }));
}

export function toolsInCategory(tools: Tool[], categoryId: string): Tool[] {
  return sortTools(tools.filter((t) => t.data.category.id === categoryId));
}

export function toolsWithCapability(tools: Tool[], capabilityId: string): Tool[] {
  return sortTools(tools.filter((t) => t.data.can.some((c) => c.id === capabilityId)));
}

/** capability ごとの紐づくツール数。索引での表示可否判定（SPEC 4.2：2件未満は索引に出さない） */
export function capabilityToolCounts(tools: Tool[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tools) for (const c of t.data.can) m.set(c.id, (m.get(c.id) ?? 0) + 1);
  return m;
}

export const MIN_TOOLS_FOR_INDEX = 2;

export function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((i) => [i.id, i]));
}

/** ツールに含まれるすべての検証日（constraints + cost） */
export function verifiedDates(tool: Tool): Date[] {
  return [...tool.data.constraints.map((c) => c.verifiedAt), tool.data.cost.verifiedAt];
}

/** ツールを「代替手段」として挙げている他ツール（逆参照） */
export function referencedBy(tools: Tool[], toolId: string): Tool[] {
  return sortTools(tools.filter((t) => t.data.alternatives.some((a) => a.tool.id === toolId)));
}

/** ある分類を connections で指している分類（逆参照） */
export function connectedFrom(categories: Category[], categoryId: string) {
  return sortCategories(categories)
    .filter((c) => c.id !== categoryId && c.data.connections.some((x) => x.to.id === categoryId))
    .map((c) => ({ category: c, how: c.data.connections.find((x) => x.to.id === categoryId)!.how }));
}
