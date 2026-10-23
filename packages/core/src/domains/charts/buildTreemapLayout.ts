import type {
  TreemapLayoutOptions,
  TreemapLayout,
  TreemapNode,
  TreemapSummary,
} from './treemap.types.ts';
import { treemapRects } from './treemapRects.ts';

interface Node extends TreemapSummary {
  parent?: string;
  children: Node[];
}
const summary = ({ id, label, value, group, categoryIndex }: Node): TreemapSummary => ({
  id,
  label,
  value,
  group,
  categoryIndex,
});

export function buildTreemapLayout({
  data,
  rootId,
  width = 100,
  height = 60,
}: TreemapLayoutOptions): TreemapLayout {
  if (![width, height].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Treemap dimensions must be finite and positive');
  }
  const nodes = new Map<string, Node>();
  function visit(input: TreemapNode, depth: number, categoryIndex: number, parent?: string): Node {
    if (depth > 64) throw new RangeError('Treemap supports at most 64 nested levels');
    if (
      !input ||
      typeof input.id !== 'string' ||
      !input.id.trim() ||
      typeof input.label !== 'string' ||
      !input.label.trim()
    ) {
      throw new TypeError('Treemap nodes require nonempty id and label');
    }
    if (nodes.has(input.id))
      throw new RangeError('Treemap IDs must be unique; cycles are not allowed');
    const group = 'children' in input;
    if (
      group
        ? !Array.isArray(input.children) || 'value' in input
        : !Number.isFinite(input.value) || input.value! < 0
    ) {
      throw new TypeError('Treemap nodes require either children or a finite nonnegative value');
    }
    const node: Node = {
      id: input.id,
      label: input.label,
      value: group ? 0 : input.value!,
      group,
      categoryIndex,
      parent,
      children: [],
    };
    nodes.set(node.id, node);
    if (group) {
      node.children = Array.from(input.children!, (child, index) =>
        visit(child, depth + 1, depth === 0 ? index : categoryIndex, node.id),
      );
      for (const child of node.children) {
        node.value += child.value;
        if (!Number.isFinite(node.value)) throw new RangeError('Treemap total must be finite');
      }
    }
    return node;
  }
  const tree = visit(data, 0, -1);
  if (!tree.group) throw new TypeError('Treemap data must be a root group');
  const root = nodes.get(rootId ?? tree.id);
  if (!root?.group) throw new RangeError('Treemap rootId must identify an existing group');
  const path: TreemapSummary[] = [];
  for (let current: Node | undefined = root; current; current = nodes.get(current.parent!))
    path.unshift(summary(current));
  const rects = treemapRects(
    root.children.map((node) => node.value),
    width,
    height,
  );
  return {
    root: summary(root),
    path,
    width,
    height,
    total: tree.value,
    items: root.children.map((node, index) => {
      const rect = rects[index];
      const nested = rect
        ? treemapRects(
            node.children.map((child) => child.value),
            rect.width,
            rect.height,
          )
        : [];
      return {
        ...summary(node),
        rect,
        share: root.value > 0 ? node.value / root.value : null,
        totalShare: tree.value > 0 ? node.value / tree.value : null,
        children: node.children.map((child, childIndex) => ({
          ...summary(child),
          rect: nested[childIndex] ?? null,
        })),
      };
    }),
  };
}
