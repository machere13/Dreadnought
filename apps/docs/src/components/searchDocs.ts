export type SearchEntry = {
  href: string;
  title: string;
  description: string;
  content: string;
};

export function searchDocs(entries: readonly SearchEntry[], query: string, limit = 8): SearchEntry[] {
  const terms = query.normalize('NFKC').toLocaleLowerCase('ru').trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return entries
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase('ru');
      const description = entry.description.toLocaleLowerCase('ru');
      const content = entry.content.toLocaleLowerCase('ru');
      if (!terms.every((term) => title.includes(term) || description.includes(term) || content.includes(term))) return null;
      const score = terms.reduce((total, term) => total + (title.includes(term) ? 4 : 0) + (description.includes(term) ? 2 : 0) + (content.includes(term) ? 1 : 0), 0);
      return { entry, score };
    })
    .filter((result): result is { entry: SearchEntry; score: number } => result !== null)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, 'ru'))
    .slice(0, limit)
    .map(({ entry }) => entry);
}
