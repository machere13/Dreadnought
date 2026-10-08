import data from '../generated/catalog-docs.json';
import { propertySummaries } from './propertySummaries.ts';

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

function apiRow(row: string[], component: string): ApiRow {
  if (row.length !== 4) throw new Error(`Некорректная строка API: ${component}`);
  const [name, values, fallback, description] = row;
  return [name, values, fallback, description];
}

export function getCatalogDoc(component: string): CatalogDoc {
  const doc = (data.components as Record<string, GeneratedDoc>)[component];
  if (!doc) throw new Error(`Компонент отсутствует в каталоге: ${component}. Запустите сборку документации.`);
  const apiRows = doc.apiRows.map((row): ApiRow => {
    const [name, values, fallback, description] = apiRow(row, component);
    const meaning = propertySummaries[component]?.[name] ?? description;
    return [name, values, fallback, meaning];
  });
  const apiGroups = doc.apiGroups?.map(group => ({
    title: group.title,
    rows: group.rows.map(row => apiRow(row, component)),
  }));
  return { ...doc, apiRows, apiGroups };
}

export const catalogVersions = data.packageVersions;
