import {readFile, writeFile, copyFile, mkdir} from 'node:fs/promises';
const root = new URL('./', import.meta.url);
const catalog = JSON.parse(await readFile(new URL('../../tools/catalog/dist/catalog.json', root), 'utf8'));
catalog.entries = catalog.entries.filter(entry => entry.name !== 'CollectionPage');
const binding = name => catalog.entries.find(entry => entry.name === name).bindings.find(item => item.id === 'react-ui');
binding('Input').examples.unshift({id:'text',code:"import { Input } from '@dreadnought/ui/react';\\nconst example = <Input type='text' aria-label='Имя' name='name' required />;".replace('\\n','\n')});
const table = binding('Table');
binding('Tabs').examples.unshift({id:'controlled',code:"import {useState} from 'react';\nimport {Tabs} from '@dreadnought/ui/react';\nexport function Example() { const [value,setValue]=useState('first'); return <Tabs value={value} onValueChange={setValue}><Tabs.List aria-label='Разделы'><Tabs.Tab value='first'>Первый</Tabs.Tab><Tabs.Tab value='second'>Второй</Tabs.Tab></Tabs.List><Tabs.Panel value='first'>Первый раздел</Tabs.Panel><Tabs.Panel value='second'>Второй раздел</Tabs.Panel></Tabs>; }"});
table.examples = [{id:'data',code:"import { Table } from '@dreadnought/ui/react';\\nconst example = <Table rowKey='id' pagination={false} locale={{emptyText:'Нет данных'}} dataSource={[{id:1,name:'Анна'}]} columns={[{key:'name',title:'Имя',dataIndex:'name',render:(_value,record) => <strong>{record.name}</strong>}]} />;".replace('\\n','\n')}, ...table.examples.map(example => ({...example,id:example.id === 'compound' ? 'markup' : example.id}))];
await writeFile(new URL('catalog.json',root),JSON.stringify(catalog));
await mkdir(new URL('vendor/',root),{recursive:true});
for (const name of ['core','react','themes','ui']) {
 const file = 'dreadnought-' + name + '-0.1.0.tgz';
 await copyFile(new URL('../../../4course_proof_of_concept/vendor/' + file,root),new URL('vendor/' + file,root));
}
console.log('Frozen packages; only experimental catalog usage examples changed.');
