import type { SankeyLayout, SankeyLayoutOptions, SankeyNodeRect } from './sankey.types.ts';

const nonempty = (value: unknown): value is string => typeof value === 'string' && !!value.trim();

export function buildSankeyLayout({
  nodes: inputNodes,
  links: inputLinks,
  width: requestedWidth,
  height: requestedHeight,
  nodeWidth = 16,
  nodeGap = 24,
}: SankeyLayoutOptions): SankeyLayout {
  if (!Array.isArray(inputNodes) || !Array.isArray(inputLinks))
    throw new TypeError('Sankey nodes and links must be arrays');
  if (inputNodes.length > 200 || inputLinks.length > 1000)
    throw new RangeError('Sankey supports up to 200 nodes and 1000 links; aggregate larger graphs');
  for (const value of [nodeWidth, nodeGap, requestedWidth ?? 640, requestedHeight ?? 320]) {
    if (!Number.isFinite(value) || value <= 0)
      throw new RangeError('Sankey dimensions and gaps must be finite and positive');
  }
  const byId = new Map<string, SankeyNodeRect>();
  const nodes: SankeyNodeRect[] = [];
  for (const node of inputNodes) {
    if (!node || !nonempty(node.id) || !nonempty(node.label) || byId.has(node.id))
      throw new TypeError('Sankey nodes require unique nonempty IDs and labels');
    const rect: SankeyNodeRect = {
      id: node.id,
      label: node.label,
      kind: 'node',
      index: nodes.length,
      incoming: 0,
      outgoing: 0,
      value: 0,
      layer: 0,
      x: 0,
      y: 0,
      width: nodeWidth,
      height: 0,
    };
    nodes.push(rect);
    byId.set(rect.id, rect);
  }
  const ids = new Set<string>();
  const outgoing = nodes.map(() => [] as number[]);
  const degree = nodes.map(() => 0);
  const links = [];
  for (const link of inputLinks) {
    if (!link || !nonempty(link.id) || ids.has(link.id))
      throw new TypeError('Sankey links require unique nonempty IDs');
    const source = byId.get(link.source);
    const target = byId.get(link.target);
    if (!source || !target)
      throw new TypeError('Sankey link endpoints must reference existing nodes');
    if (!Number.isFinite(link.value) || link.value <= 0)
      throw new RangeError('Sankey link values must be finite and positive');
    ids.add(link.id);
    source.outgoing += link.value;
    target.incoming += link.value;
    if (!Number.isFinite(source.outgoing) || !Number.isFinite(target.incoming))
      throw new RangeError('Sankey flow sum exceeds finite numbers');
    outgoing[source.index].push(target.index);
    degree[target.index]++;
    links.push({ id: link.id, source: link.source, target: link.target, value: link.value });
  }
  const queue = nodes.filter((node) => degree[node.index] === 0);
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const node = queue[cursor];
    for (const index of outgoing[node.index]) {
      nodes[index].layer = Math.max(nodes[index].layer, node.layer + 1);
      if (--degree[index] === 0) queue.push(nodes[index]);
    }
  }
  if (queue.length !== nodes.length) throw new RangeError('Sankey does not support cycles');
  const lastLayer = Math.max(0, ...nodes.map((node) => node.layer));
  const columns = Array.from({ length: lastLayer + 1 }, () => [] as SankeyNodeRect[]);
  for (const node of nodes) {
    if (!outgoing[node.index].length && node.incoming > 0) node.layer = lastLayer;
    node.value = Math.max(node.incoming, node.outgoing);
    columns[node.layer].push(node);
  }
  const width =
    requestedWidth ?? Math.max(640, 280 + nodeWidth + lastLayer * Math.max(320, nodeWidth + 24));
  const height =
    requestedHeight ??
    Math.max(
      320,
      ...columns.map((column) => column.length * 24 + Math.max(0, column.length - 1) * nodeGap),
    );
  if (!Number.isFinite(width) || !Number.isFinite(height))
    throw new RangeError('Sankey automatic dimensions exceed finite numbers');
  if (width < 280 + nodeWidth + lastLayer * (nodeWidth + 24))
    throw new RangeError('Sankey width is too small for its layers and labels');
  const maximum = Math.max(0, ...nodes.map((node) => node.value));
  let scale = height;
  for (const column of columns) {
    const available = height - Math.max(0, column.length - 1) * nodeGap;
    if (available <= 0) throw new RangeError('Sankey height is too small for node gaps');
    const sum = maximum ? column.reduce((total, node) => total + node.value / maximum, 0) : 0;
    if (sum > 0) scale = Math.min(scale, available / sum);
  }
  for (const column of columns) {
    for (const node of column) node.height = maximum ? (node.value / maximum) * scale : 0;
    const occupied =
      column.reduce((sum, node) => sum + node.height, 0) + Math.max(0, column.length - 1) * nodeGap;
    let y = (height - occupied) / 2;
    for (const node of column) {
      node.x = lastLayer
        ? 140 + (node.layer / lastLayer) * (width - 280 - nodeWidth)
        : (width - nodeWidth) / 2;
      node.y = y;
      y += node.height + nodeGap;
    }
  }
  const sourceOffset = nodes.map(() => 0);
  const targetOffset = nodes.map(() => 0);
  const flows = links.map((link) => {
    const source = byId.get(link.source)!;
    const target = byId.get(link.target)!;
    const flowWidth = (link.value / maximum) * scale;
    const flow = {
      ...link,
      kind: 'link' as const,
      sourceLabel: source.label,
      targetLabel: target.label,
      sourceIndex: source.index,
      sourceX: source.x + nodeWidth,
      targetX: target.x,
      sourceY: source.y + sourceOffset[source.index] + flowWidth / 2,
      targetY: target.y + targetOffset[target.index] + flowWidth / 2,
      width: flowWidth,
    };
    sourceOffset[source.index] += flowWidth;
    targetOffset[target.index] += flowWidth;
    return flow;
  });
  return { nodes, links: flows, width, height };
}
