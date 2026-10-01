import {serveStdio} from '@modelcontextprotocol/server/stdio';
import {parseServerArgs} from './mcp/config.mjs';
import {createCatalogMcpServer} from './mcp/server.mjs';

try {
  const config = parseServerArgs(process.argv.slice(2));
  serveStdio(() => createCatalogMcpServer(config));
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Cannot start catalog MCP server');
  process.exitCode = 1;
}
