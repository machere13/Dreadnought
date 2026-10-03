import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {Client} from '@modelcontextprotocol/client';
import {StdioClientTransport} from '@modelcontextprotocol/client/stdio';
import {compactContext} from './compactContext.mjs';
const project = process.argv[2];
if (!['with-dreadnought', 'without-dreadnought'].includes(project)) throw new Error('Select a benchmark project');
const root = new URL('./', import.meta.url);
console.log(await readFile('C:/Users/vladi/.codex/skills/ponytail/SKILL.md','utf8'));
for (const file of ['package.json','tsconfig.json','src/main.tsx']) console.log(file + '\n' + await readFile(new URL(project + '/' + file, root),'utf8'));
if (project === 'with-dreadnought') {
  console.log(await readFile(new URL('SKILL.md',root),'utf8'));
  const client = new Client({name:'dreadnought-bootstrap-v10',version:'1.0.0'});
  const transport = new StdioClientTransport({command:process.execPath,args:[fileURLToPath(new URL('../../tools/catalog/src/mcp.mjs',root)), '--catalog',fileURLToPath(new URL('catalog.json',root)), '--project',fileURLToPath(new URL(project + '/',root))]});
  try {
    await client.connect(transport);
    const response = await client.callTool({name:'dreadnought_context',arguments:{components:process.argv[3].split(','),format:'contract',maxBytes:32768}});
    if (response.isError) throw new Error(JSON.stringify(response.structuredContent));
    console.log(JSON.stringify(compactContext(response.structuredContent)));
  } finally {await client.close();}
}
