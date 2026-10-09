import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { packages } from '../../../tools/catalog/src/config.mjs';

const defaultRoot = fileURLToPath(new URL('../../../', import.meta.url));
export const allowedRoutes = JSON.parse(readFileSync(new URL('../src/knowledge/routes.json', import.meta.url), 'utf8'));
const normalize = text => text.replace(/\s+/g, ' ').trim();
const guideLabels = {
  '/getting-started/': ['install', 'setup', 'установка', 'начало'],
  '/theming/': ['theme', 'theming', 'тема', 'темы'],
  '/custom-components/': ['custom', 'components', 'собственные', 'компоненты'],
};

export function parsePage(html) { return new JSDOM(html).window.document; }

export function validateLink(url, pages) {
  if (typeof url !== 'string') throw new Error('Missing documentation URL');
  const [route, anchor, ...extra] = url.split('#');
  if (!allowedRoutes.includes(route) || extra.length || (anchor !== undefined && !/^[a-zA-Z0-9_-]+$/.test(anchor))) {
    throw new Error(`Disallowed documentation URL: ${url}`);
  }
  const document = pages.get(route);
  if (!document || (anchor && !document.getElementById(anchor))) throw new Error(`Unpublished documentation URL: ${url}`);
}

export function extractGuides(document, route) {
  const entries = [];
  const article = document.querySelector('main article');
  if (!article) return entries;
  for (const section of article.querySelectorAll('[data-knowledge]')) {
    if (section.parentElement?.closest('[data-knowledge]')) continue;
    const heading = section.querySelector('h1,h2,h3,h4');
    const explicitId = section.getAttribute('data-knowledge-id');
    const anchor = section.id || section.getAttribute('aria-labelledby') || heading?.id || (explicitId && document.getElementById(explicitId) ? explicitId : '');
    const key = section.getAttribute('data-knowledge-id') || anchor;
    if (!key) throw new Error(`Knowledge section needs a stable id: ${route}`);
    const labelled = anchor && document.getElementById(anchor);
    const title = section.getAttribute('data-knowledge-title') || heading?.textContent || labelled?.textContent || document.title;
    const clone = section.cloneNode(true);
    clone.querySelectorAll('script,style,nav,button,input,select,textarea,[aria-hidden="true"],[data-knowledge-exclude],.demo').forEach(node => node.remove());
    const code = Array.from(clone.querySelectorAll('pre')).map(node => node.textContent.trim()).filter(Boolean);
    clone.querySelectorAll('pre').forEach(node => node.remove());
    clone.querySelectorAll('p,div,section,h1,h2,h3,h4,li,br').forEach(node => node.append(document.createTextNode(' ')));
    const text = normalize(clone.textContent);
    if (!text && !code.length) throw new Error(`Empty knowledge section: ${route}#${key}`);
    entries.push({ id: `guide:${route}:${key}`, sourceKind: 'guide', sourceId: `guide:${route}`,
      title: normalize(title), url: `${route}${anchor ? `#${anchor}` : ''}`, text: text || normalize(title), code,
      keywords: [...(guideLabels[route] || []), ...(section.getAttribute('data-knowledge-keywords') || '').split(/\s+/).filter(Boolean)] });
  }
  return entries;
}

function usageProps(binding, russian = false) {
  const unknown = russian ? 'не указаны в каталоге' : 'not specified in catalog';
  const branches = (binding.contracts || []).flatMap((contract, contractIndex) =>
    (contract.variants || []).map((variant, variantIndex) => {
      const required = Array.isArray(variant.properties)
        ? variant.properties.filter(prop => !prop.optional).map(prop => prop.name).join(', ') || (russian ? 'нет' : 'none')
        : unknown;
      if (russian) return `Вариант API ${contractIndex + 1}.${variantIndex + 1}. Обязательные пропсы: ${required}.`
        + (Array.isArray(variant.properties) ? ' Остальные объявленные пропсы в этом варианте необязательны.' : '');
      return `Contract ${contractIndex + 1}, branch ${variantIndex + 1}: required props: ${required}.`
        + (Array.isArray(variant.properties) ? ' Other declared props are optional in that branch.' : '');
    }));
  const defaults = Object.keys(binding.defaults || {}).length
    ? JSON.stringify(binding.defaults)
    : `${unknown}.`;
  return russian
    ? `${branches.join('\n') || `Обязательные пропсы: ${unknown}.`}\nПо умолчанию: ${defaults}`
    : `${branches.join('\n') || 'Required props: not specified in catalog.'}\nDefaults: ${defaults}`;
}

export function catalogChunks(catalog, pages) {
  const entries = [];
  for (const entity of catalog.entries) {
    if (!entity.docsUrl) continue;
    // A declared public docs URL must work; records with no docsUrl remain catalog-only.
    validateLink(entity.docsUrl, pages);
    const sourceId = `catalog:${entity.id}`;
    const base = { sourceKind: 'catalog', sourceId, url: entity.docsUrl };
    for (const binding of entity.bindings) {
      const prefix = `${sourceId}:${binding.id}`;
      const publicName = [binding.exportName, ...(binding.propertyPath || [])].join('.');
      const title = `${entity.name} · ${publicName}`;
      const importCode = `import { ${binding.exportName} } from '${binding.importPath}';`;
      const description = binding.description || entity.description || '';
      const context = binding.layer === 3 ? `${usageProps(binding)}\n${description}` : description;
      const facts = binding.layer === 3 ? { apiSummary: usageProps(binding, true) } : {};
      entries.push({ ...base, ...facts, id: prefix, title, text: `${publicName}: ${context}`, code: [importCode], keywords: [entity.name, publicName, binding.importPath] });
      for (const [contractIndex, contract] of (binding.contracts || []).entries()) {
        const parameters = (contract.parameters || []).map(parameter => `${parameter.name}${parameter.optional ? '?' : ''}: ${parameter.type}`).join(', ');
        if (parameters && parameters.length < 1500 && (binding.layer === 1 || (contract.variants || []).every(variant => !variant.properties.length))) entries.push({ ...base, ...facts, id: `${prefix}:signature:${contractIndex + 1}`,
          title: `${title} · сигнатура ${contractIndex + 1}`, text: `${publicName}(${parameters})${contract.returnType?.length < 800 ? `: ${contract.returnType}` : ''}`,
          code: [importCode], keywords: [entity.name, publicName, ...(contract.parameters || []).map(parameter => parameter.name)] });
        const variants = contract.variants || [];
        const libraryNames = [...new Set(variants.flatMap(variant => variant.properties.filter(prop => prop.origin !== 'dependency').map(prop => prop.name)))];
        const distinguishing = libraryNames.filter(name => new Set(variants.map(variant => {
          const prop = variant.properties.find(prop => prop.name === name);
          return prop ? `${prop.optional}:${prop.type}` : 'absent';
        })).size > 1);
        for (const [variantIndex, variant] of variants.entries()) {
          const branch = variants.length > 1 ? `Contract ${contractIndex + 1}, branch ${variantIndex + 1}. ${distinguishing.map(name => {
            const prop = variant.properties.find(prop => prop.name === name);
            return prop ? `${name}${prop.optional ? '?' : ''}: ${prop.type}` : `${name}: not declared in this branch`;
          }).join('; ')}.\n` : '';
          for (const prop of variant.properties || []) {
            if (prop.origin === 'dependency' && !binding.propertyDescriptions?.[prop.name]) continue;
            const line = `${prop.name}${prop.optional ? '?' : ''}: ${prop.type}. ${binding.propertyDescriptions?.[prop.name] || ''}${Object.hasOwn(binding.defaults || {}, prop.name) ? ` Default: ${JSON.stringify(binding.defaults[prop.name])}.` : ''}`;
            entries.push({ ...base, ...facts, id: `${prefix}:contract:${contractIndex + 1}:branch:${variantIndex + 1}:property:${prop.name}`,
              title: `${title} · ${prop.name}${variants.length > 1 ? ` · ветвь ${variantIndex + 1}` : ''}`, text: `${publicName}. ${branch}${line}`,
              code: [importCode], keywords: [entity.name, publicName, prop.name] });
          }
        }
      }
      for (const example of binding.examples || []) entries.push({ ...base, ...facts, id: `${prefix}:example:${example.id}`,
        title: `${title} · ${example.id}`, text: `${context}\n${example.description || example.title || example.id}`,
        code: [example.code], keywords: [entity.name, publicName, example.id] });
    }
    if (entity.constraints?.length) entries.push({ ...base, id: `${sourceId}:constraints`, title: `${entity.name} · ограничения`,
      text: entity.constraints.join('\n'), code: [], keywords: [entity.name, 'constraints', 'ограничения'] });
    if (entity.tokens?.length || entity.parts?.length) entries.push({ ...base, id: `${sourceId}:styling`, title: `${entity.name} · оформление`,
      text: [...(entity.parts || []).map(part => `${part.name}: ${part.description}`), ...(entity.tokens || []).map(token => `${token.name}: ${token.value}`)].join('\n'), code: [], keywords: [entity.name, 'theme', 'tokens', 'стили', 'оформление'] });
  }
  return entries;
}

export function buildKnowledge(root = defaultRoot, { publicOutput = false } = {}) {
  const dist = path.join(root, 'apps/docs/dist');
  const catalog = JSON.parse(readFileSync(path.join(root, 'tools/catalog/dist/catalog.json'), 'utf8'));
  if (catalog.schemaVersion !== 1) throw new Error('Unsupported catalog schema');
  const versions = Object.fromEntries(packages.map(({ directory }) => {
    const pkg = JSON.parse(readFileSync(path.join(root, directory, 'package.json'), 'utf8'));
    return [pkg.name, pkg.version];
  }));
  if (Object.keys(catalog.packageVersions).length !== Object.keys(versions).length || Object.entries(versions).some(([name, version]) => catalog.packageVersions[name] !== version)) throw new Error('Catalog package version mismatch');
  const pages = new Map(allowedRoutes.map(route => [route, parsePage(readFileSync(path.join(dist, route.slice(1), 'index.html'), 'utf8'))]));
  const candidates = [...catalogChunks(catalog, pages), ...[...pages].flatMap(([route, doc]) => extractGuides(doc, route))];
  const ids = new Set();
  const seenContent = new Set();
  const entries = candidates.filter(entry => {
    validateLink(entry.url, pages);
    if (ids.has(entry.id)) throw new Error(`Duplicate knowledge id: ${entry.id}`);
    ids.add(entry.id);
    const content = JSON.stringify([entry.sourceId, entry.title, entry.text, entry.code]);
    if (seenContent.has(content)) return false;
    seenContent.add(content);
    return true;
  }).sort((a, b) => a.id.localeCompare(b.id));
  const buildId = createHash('sha256').update(JSON.stringify({ schemaVersion: 1, packageVersions: versions, catalog, entries })).digest('hex');
  const manifest = { schemaVersion: 1, buildId, packageVersions: versions, entries };
  for (const route of allowedRoutes) {
    const htmlPath = path.join(dist, route.slice(1), 'index.html');
    const html = readFileSync(htmlPath, 'utf8').replace(/<meta name="knowledge-build"[^>]*>/g, '').replace(/<meta name="knowledge-versions"[^>]*>/g, '');
    const tags = `<meta name="knowledge-build" content="${buildId}"><meta name="knowledge-versions" content="${JSON.stringify(versions).replaceAll('"', '&quot;')}">`;
    writeFileSync(htmlPath, html.replace('</head>', `${tags}</head>`));
  }
  const outputs = [dist, ...(publicOutput ? [path.join(root, 'apps/docs/public')] : [])];
  for (const target of outputs) {
    mkdirSync(target, { recursive: true });
    writeFileSync(path.join(target, 'rag-index.json'), JSON.stringify(manifest));
    writeFileSync(path.join(target, 'knowledge-manifest.json'), JSON.stringify({ schemaVersion: 1, buildId, packageVersions: versions }));
    writeFileSync(path.join(target, 'catalog.json'), JSON.stringify(catalog));
  }
  console.log(`Knowledge: ${entries.length} fragments, build ${buildId.slice(0, 12)}`);
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildKnowledge(defaultRoot, { publicOutput: process.argv.includes('--public') });
