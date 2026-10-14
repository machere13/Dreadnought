import data from './generated/catalog-docs.json';
import { commonPropertySummaries, propertySummaries } from './propertySummaries.ts';

export type ApiRow = readonly [name: string, values: string, fallback: string, meaning: string];
export type ApiGroup = { title: string; rows: readonly ApiRow[] };

type CatalogDoc = {
  readyCode?: string;
  adapterCode: string;
  logicCode?: string;
  apiRows: readonly ApiRow[];
  apiGroups?: readonly ApiGroup[];
};

type GeneratedDoc = Omit<CatalogDoc, 'apiRows' | 'apiGroups'> & {
  apiRows: string[][];
  apiGroups?: { title: string; rows: string[][] }[];
};

function apiRow(row: string[], component: string, group?: string): ApiRow {
  if (row.length !== 4) throw new Error(`Некорректная строка API: ${component}`);
  const [name, values, fallback, description] = row;
  const key = group ? `${group}.${name}` : name;
  const meaning =
    propertySummaries[component]?.[key] ??
    (description === 'Свойство компонента'
      ? (commonPropertySummaries[name.split('.').at(-1)!] ?? description)
      : description);
  return [name, values, fallback, meaning];
}

export function getCatalogDoc(component: string): CatalogDoc {
  const doc = (data.components as Record<string, GeneratedDoc>)[component];
  if (!doc)
    throw new Error(
      `Компонент отсутствует в каталоге: ${component}. Запустите сборку документации.`,
    );
  const apiRows = doc.apiRows.map((row) => apiRow(row, component));
  const apiGroups = doc.apiGroups?.map((group) => ({
    title: group.title,
    rows: group.rows.map((row) => apiRow(row, component, group.title)),
  }));
  return { ...doc, apiRows, apiGroups };
}

export const catalogVersions = data.packageVersions;
