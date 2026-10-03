import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import { fileURLToPath } from 'node:url';

const project = fileURLToPath(new URL('./with-dreadnought/', import.meta.url));
const tool = `dreadnought_${process.argv[2] ?? ''}`;
const args = Object.fromEntries(process.argv.slice(3).map((item) => {
  const separator = item.indexOf('=');
  if (separator < 1) throw new Error(`Expected key=value: ${item}`);
  const key = item.slice(0, separator);
  const value = item.slice(separator + 1);
  return [key, key === 'components' ? value.split(',') :
    ['layer', 'limit', 'offset', 'maxBytes'].includes(key) ? Number(value) :
    key === 'includeTokens' ? value === 'true' : value];
}));
const client = new Client({ name: 'dreadnought-benchmark', version: '1.0.0' });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [fileURLToPath(new URL('../../tools/catalog/src/mcp.mjs', import.meta.url)),
    '--catalog', fileURLToPath(new URL('../../tools/catalog/dist/catalog.json', import.meta.url)),
    '--project', project],
});
try {
  await client.connect(transport);
  const response = await client.callTool({ name: tool, arguments: args });
  console.log(JSON.stringify(response.structuredContent));
  if (response.isError) process.exitCode = 1;
} finally {
  await client.close();
}
