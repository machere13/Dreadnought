import routes from './routes.json';

export interface KnowledgeEntry {
  id: string;
  sourceKind: 'catalog' | 'guide';
  sourceId: string;
  title: string;
  url: string;
  text: string;
  code: string[];
  keywords?: string[];
}

export interface KnowledgeManifest {
  schemaVersion: 1;
  buildId: string;
  packageVersions: Record<string, string>;
  entries: KnowledgeEntry[];
}

export function isKnowledgeUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const [route, anchor, ...extra] = value.split('#');
  return routes.includes(route) && extra.length === 0
    && (anchor === undefined || /^[a-zA-Z0-9_-]+$/.test(anchor));
}

export function validateManifest(value: unknown, expected: { buildId: string; packageVersions: Record<string, string> }): KnowledgeManifest {
  const data = value as KnowledgeManifest;
  if (!data || data.schemaVersion !== 1 || !data.buildId || data.buildId !== expected.buildId
    || !sameVersions(data.packageVersions, expected.packageVersions) || !Array.isArray(data.entries)) {
    throw new Error('Индекс документации относится к другой сборке. Обновите страницу.');
  }
  const ids = new Set<string>();
  for (const entry of data.entries) {
    if (!entry || !['catalog', 'guide'].includes(entry.sourceKind)
      || typeof entry.id !== 'string' || !entry.id.startsWith(`${entry.sourceKind}:`) || ids.has(entry.id)
      || typeof entry.sourceId !== 'string' || !entry.sourceId.startsWith(`${entry.sourceKind}:`)
      || typeof entry.title !== 'string' || !entry.title.trim()
      || typeof entry.text !== 'string' || !entry.text.trim()
      || !isKnowledgeUrl(entry.url) || !Array.isArray(entry.code) || !entry.code.every(code => typeof code === 'string')
      || (entry.keywords !== undefined && (!Array.isArray(entry.keywords) || !entry.keywords.every(word => typeof word === 'string')))) {
      throw new Error('Некорректный индекс документации.');
    }
    ids.add(entry.id);
  }
  return data;
}

export function sameVersions(a: Record<string, string>, b: Record<string, string>): boolean {
  return !!a && !!b && Object.keys(a).length > 0 && Object.keys(a).length === Object.keys(b).length
    && Object.entries(a).every(([key, version]) => typeof version === 'string' && version === b[key]);
}
