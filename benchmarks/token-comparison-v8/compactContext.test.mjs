import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {getContext} from '../../tools/catalog/src/query/getContext.mjs';
import {compactContext} from './compactContext.mjs';
const catalog = JSON.parse(await readFile(new URL('./catalog.json',import.meta.url),'utf8'));
const result = getContext(catalog,{components:['Button','Input','Card','Badge','Tabs','Table'],format:'contract',maxBytes:32768});
const response = {compatibility:{status:'compatible'},result};
const compact = compactContext(response);
for (const [index,item] of result.items.entries()) {
  const actual = compact.components[index];
  assert.equal(actual.example,item.example.code);
  assert.equal(actual.importPath,item.binding.importPath);
  assert.deepEqual(actual.contracts.map(overload => overload.map(variant => Object.entries(variant).map(([name,type]) => ({
    name:name.replace(/\?$/,''),type,...(name.endsWith('?') ? {} : {required:true}),
  })))),item.variants);
}
assert.throws(() => compactContext({...response,compatibility:{status:'incompatible'}}));
assert.throws(() => compactContext({...response,result:{...result,truncated:true}}));
console.log('All six public contracts survive compaction without changing overloads, required properties or types.');
