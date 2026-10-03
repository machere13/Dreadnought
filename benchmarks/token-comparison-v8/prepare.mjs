import {readFile, writeFile, copyFile, mkdir} from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('../../tools/catalog/dist/catalog.json', root), 'utf8'));
catalog.entries = catalog.entries.filter(entry => entry.name !== 'CollectionPage');
await writeFile(new URL('catalog.json', root), JSON.stringify(catalog));
await mkdir(new URL('vendor/', root), {recursive: true});
for (const name of ['core', 'react', 'themes', 'ui']) {
  const file = 'dreadnought-' + name + '-0.1.0.tgz';
  await copyFile(new URL('../../../4course_proof_of_concept/vendor/' + file, root), new URL('vendor/' + file, root));
}
console.log('Frozen 14-component catalog and four pre-CollectionPage packages.');

