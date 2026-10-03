// @vitest-environment node
import {describe, expect, it} from 'vitest';
import {getContext, getEntry} from '../src/query/index.mjs';
import {makeCatalog} from './queryFixtures';

function fixture() {
  const catalog = makeCatalog();
  const binding = catalog.entries[0].bindings[0];
  binding.examples = [{id:'basic', code:'<Button />'}, {id:'usage', code:'<Button type="submit">Save</Button>'}];
  binding.contracts[0].variants = [
    {properties:[
      {name:'href',type:'undefined',optional:true,origin:'library'},
      {name:'type',type:'"button" | "submit"',optional:true,origin:'dependency'},
      {name:'variant',type:'"primary" | "secondary" | undefined',optional:true,origin:'library'},
      {name:'ref',type:'Ref<HTMLButtonElement>',optional:true,origin:'library'},
      {name:'value',type:'string',optional:true,origin:'library'},
    ]},
    {properties:[
      {name:'href',type:'string',optional:false,origin:'library'},
      {name:'type',type:'undefined',optional:true,origin:'library'},
      {name:'ref',type:'Ref<HTMLAnchorElement>',optional:true,origin:'library'},
      {name:'value',type:'() => string',optional:true,origin:'library'},
    ]},
  ] as any;
  return catalog;
}

describe('usage context', () => {
  it('defaults to a partial usage guide, leaving complex contracts available through get', () => {
    const catalog = fixture();
    const result = getContext(catalog,{components:['Button']});
    expect(result).toMatchObject({format:'usage',apiCoverage:'partial',truncated:false});
    expect(result.items[0]).toMatchObject({binding:{importPath:'@dreadnought/ui/react'},
      props:{href:'undefined | string',variant:'"primary" | "secondary" | undefined'},
      example:{id:'usage',code:'<Button type="submit">Save</Button>'}});
    expect(result.items[0].variants).toBeUndefined();
    expect(result.items[0].description).toBeUndefined();
    expect(getEntry(catalog,'Button',{binding:'react-ui',section:'api',property:'ref'}).contracts[0].variants)
      .toHaveLength(2);
  });

  it('does not turn an absent branch or a partly complex property into a complete simple type', () => {
    const result = getContext(fixture(),{components:['Button']});
    expect(result.items[0].props).not.toHaveProperty('type');
    expect(result.items[0].props).not.toHaveProperty('value');
    expect(result.items[0].props).not.toHaveProperty('ref');
  });

  it('keeps overload branches available in contract format', () => {
    const result = getContext(fixture(),{components:['Button'],format:'contract'});
    expect(result.format).toBe('contract');
    expect(result.items[0].variants[0]).toHaveLength(2);
    expect(result.items[0].variants[0][1]).toContainEqual({name:'href',type:'string',required:true});
  });

  it('omits whole examples at a small byte limit and marks truncation', () => {
    const catalog = fixture();
    catalog.entries[0].bindings[0].examples[1].code = 'я'.repeat(1000);
    const result = getContext(catalog,{components:['Button'],maxBytes:500});
    expect(Buffer.byteLength(JSON.stringify(result),'utf8')).toBeLessThanOrEqual(500);
    expect(result.truncated).toBe(true);
    expect(result.items[0].example).toBeUndefined();
  });

  it('rejects unknown formats instead of silently providing a different contract', () => {
    expect(() => getContext(fixture(),{components:['Button'],format:'typo'}))
      .toThrow(expect.objectContaining({code:'INVALID_ARGUMENTS'}));
  });
});
