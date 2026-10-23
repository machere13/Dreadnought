import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { components } from './config.mjs';

export function readComponentTokens(root, family, name) {
  const source = components.find((item) => item.family === family && item.name === name)?.tokenSource ?? name;
  const directory = path.join(root, 'packages/themes/src/default/tokens/components', family, source);
  const tokens = [];
  for (const file of readdirSync(directory).filter((file) => file.endsWith('.tokens.css')).sort()) {
    const css = readFileSync(path.join(directory, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const match of css.matchAll(/(--dreadnought-[\w-]+)\s*:\s*([^;{}]+);/g)) {
      if (tokens.some((token) => token.name === match[1])) throw new Error(`Duplicate theme token: ${match[1]}`);
      tokens.push({ name: match[1], value: match[2].trim() });
    }
  }
  if (!tokens.length) throw new Error(`No theme tokens found: ${name}`);
  return tokens.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
}
