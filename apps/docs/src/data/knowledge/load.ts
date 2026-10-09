import { validateManifest, type KnowledgeManifest } from './types';

type Expected = { buildId: string; packageVersions: Record<string, string> };
let pending: Promise<KnowledgeManifest> | undefined;
let pendingKey: string | undefined;

/** No persistent cache: a failed request is evicted, and a changed build never reuses entries. */
export async function loadKnowledge(expected?: Expected, fetcher: typeof fetch = fetch): Promise<KnowledgeManifest> {
  const pageBuild = typeof document === 'undefined' ? null : document.querySelector<HTMLMetaElement>('meta[name="knowledge-build"]')?.content;
  const pageVersions = typeof document === 'undefined' ? null : document.querySelector<HTMLMetaElement>('meta[name="knowledge-versions"]')?.content;
  const pageIdentity = pageBuild && pageVersions ? { buildId: pageBuild, packageVersions: JSON.parse(pageVersions) } : undefined;
  const identity = expected ?? pageIdentity ?? await fetchJson('/knowledge-manifest.json', fetcher) as Expected;
  if (!identity || typeof identity.buildId !== 'string' || !/^[a-f0-9]{64}$/.test(identity.buildId)
    || !identity.packageVersions || typeof identity.packageVersions !== 'object') {
    throw new Error('Не удалось проверить версию документации.');
  }
  const key = JSON.stringify(identity);
  if (!pending || pendingKey !== key) {
    pendingKey = key;
    const request = fetchJson(`/rag-index.json?build=${identity.buildId}`, fetcher)
      .then(data => validateManifest(data, identity));
    pending = request;
    request.catch(() => { if (pending === request) { pending = undefined; pendingKey = undefined; } });
  }
  return pending;
}

async function fetchJson(url: string, fetcher: typeof fetch): Promise<unknown> {
  const response = await fetcher(url, { cache: 'no-store' });
  if (!response.ok) throw new Error('Не удалось загрузить поиск. Попробуйте ещё раз.');
  return response.json();
}
