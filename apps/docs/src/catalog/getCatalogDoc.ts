import data from '../generated/catalog-docs.json';

type CatalogDoc = {
  readyCode?: string;
  adapterCode: string;
  logicCode?: string;
  apiRows: [string, string, string, string][];
};

export function getCatalogDoc(component: string): CatalogDoc {
  const doc = (data.components as Record<string, { readyCode?: string; adapterCode: string; logicCode?: string; apiRows: string[][] }>)[component];
  if (!doc) throw new Error(`Компонент отсутствует в каталоге: ${component}. Запустите сборку документации.`);
  return { ...doc, apiRows: doc.apiRows.map((row): [string, string, string, string] => {
    if (row.length !== 4) throw new Error(`Некорректная строка API: ${component}`);
    return [row[0], row[1], row[2], row[3]];
  }) };
}

export const catalogVersions = data.packageVersions;
