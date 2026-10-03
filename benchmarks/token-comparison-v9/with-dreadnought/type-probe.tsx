import {useState} from 'react';
import {Input,Table,Tabs} from '@dreadnought/ui/react';
const input = <Input type='text' aria-label='Имя' name='name' required />;
const table = <Table rowKey='id' pagination={false} locale={{emptyText:'Нет данных'}} dataSource={[{id:1,name:'Анна'}]} columns={[{key:'name',title:'Имя',dataIndex:'name',render:(_value,record) => <strong>{record.name}</strong>}]} />;
function Example() { const [value,setValue]=useState('first'); return <Tabs value={value} onValueChange={setValue}><Tabs.List aria-label='Разделы'><Tabs.Tab value='first'>Первый</Tabs.Tab><Tabs.Tab value='second'>Второй</Tabs.Tab></Tabs.List><Tabs.Panel value='first'>Первый раздел</Tabs.Panel><Tabs.Panel value='second'>Второй раздел</Tabs.Panel></Tabs>; }
