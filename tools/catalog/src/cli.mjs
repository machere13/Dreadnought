import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { packages, components } from './config.mjs';
import { createContext, assertCoreCoverage } from './compiler.mjs';
import { readMetadata } from './metadata.mjs';
import { generateCatalog } from './generateCatalog.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const context = createContext(root, packages);
const metadata = readMetadata(root, components);
assertCoreCoverage(context, metadata);
const catalog = generateCatalog(context, metadata);
const output = path.join(root, 'tools/catalog/dist/catalog.json');
mkdirSync(path.dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(catalog, null, 2)}\n`);
console.log(`Catalog: ${catalog.entries.length} entries → tools/catalog/dist/catalog.json`);
