import { createOpacityBinder } from './opacity.js';
import { addComponents, componentReviewNames, componentSpecs } from './components/index.js';

const fileKey = 'wpjgUf13LJaogeTFapW8w9';
const pageId = '1161:2';
const setNames = [
  'Dreadnought/Button/primary',
  'Dreadnought/Button/secondary',
  'Dreadnought/Button/outlined',
  'Dreadnought/Button/ghosted',
  'Dreadnought/Input',
  'Dreadnought/Card',
];
const reviewNames = [
  'Dreadnought / Foundations',
  'Dreadnought / Button / Review',
  'Dreadnought / Input / Review',
  'Dreadnought / Card / Review',
];

export async function targetPage(figma) {
  if (figma.fileKey && figma.fileKey !== fileKey)
    throw new Error('Откройте исходный файл Diploma. Этот плагин предназначен только для него.');
  const page = figma.root.children.find((p) => p.id === pageId && p.name === '1 module');
  if (!page)
    throw new Error('Не найдена исходная страница «1 module». Другие страницы не изменены.');
  await figma.setCurrentPageAsync(page);
  return page;
}

function uniqueMap(items, keyOf, label) {
  const result = new Map();
  for (const item of items) {
    const key = keyOf(item);
    if (result.has(key)) throw new Error(`${label}: неоднозначное имя ${key}`);
    result.set(key, item);
  }
  return result;
}

export async function syncTokens(figma, data) {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const variables = await figma.variables.getLocalVariablesAsync();
  const byCollection = uniqueMap(
    collections.filter((c) => c.name.startsWith('Dreadnought / ')),
    (c) => c.name,
    'Коллекции',
  );
  const byName = uniqueMap(
    variables.filter((v) =>
      collections.some(
        (c) => c.id === v.variableCollectionId && c.name.startsWith('Dreadnought / '),
      ),
    ),
    (v) => `${v.variableCollectionId}:${v.name}`,
    'Переменные',
  );
  for (const token of data.tokens) {
    const collection = byCollection.get('Dreadnought / ' + token.group);
    const existing = collection && byName.get(`${collection.id}:${token.name}`);
    if (existing && existing.resolvedType !== token.type)
      throw new Error(`Конфликт типа ${token.css}. Переменная не удалена.`);
  }
  const createdVariableIds = [],
    changedVariableIds = [],
    createdCollectionIds = [];
  const byCss = new Map();
  for (const token of data.tokens) {
    const name = 'Dreadnought / ' + token.group;
    let collection = byCollection.get(name);
    if (!collection) {
      collection = figma.variables.createVariableCollection(name);
      collection.renameMode(collection.defaultModeId, 'Default');
      byCollection.set(name, collection);
      createdCollectionIds.push(collection.id);
    }
    let variable = byName.get(`${collection.id}:${token.name}`);
    if (!variable) {
      variable = figma.variables.createVariable(token.name, collection, token.type);
      byName.set(`${collection.id}:${token.name}`, variable);
      createdVariableIds.push(variable.id);
    }
    variable.scopes = token.scopes;
    variable.setVariableCodeSyntax('WEB', `var(${token.css})`);
    variable.description =
      `${token.source} | CSS: ${token.raw}` +
      (token.type === 'STRING'
        ? ' | Preserved CSS expression, not a directly bindable Figma dimension.'
        : '') +
      (/rem/.test(token.raw) ? ' | Root size: 16px.' : '');
    byCss.set(token.css, variable);
    changedVariableIds.push(variable.id);
  }
  for (const token of data.tokens) {
    const variable = byCss.get(token.css);
    const collection = byCollection.get('Dreadnought / ' + token.group);
    const target = token.alias && byCss.get(token.alias);
    if (token.alias && (!target || target.resolvedType !== token.type))
      throw new Error(`Ошибка ссылки ${token.css} → ${token.alias}`);
    variable.setValueForMode(
      collection.defaultModeId,
      target ? figma.variables.createVariableAlias(target) : token.value,
    );
  }
  return { byCss, createdVariableIds, changedVariableIds, createdCollectionIds };
}

export async function syncTextStyles(figma, data, byCss) {
  const available = await figma.listAvailableFontsAsync();
  const fonts = ['Regular', 'SemiBold', 'Bold'].map((style) => ({ family: 'Roboto Flex', style }));
  for (const font of fonts) {
    if (
      !available.some((f) => f.fontName.family === font.family && f.fontName.style === font.style)
    )
      throw new Error(`Не найден шрифт ${font.family} ${font.style}. Подмена не выполнялась.`);
  }
  await Promise.all(fonts.map((font) => figma.loadFontAsync(font)));
  const existing = uniqueMap(
    (await figma.getLocalTextStylesAsync()).filter((s) => s.name.startsWith('Dreadnought/')),
    (s) => s.name,
    'Стили',
  );
  const styleIds = [];
  for (const role of data.styles) {
    const name = `Dreadnought/${role.role}`;
    const style = existing.get(name) || figma.createTextStyle();
    style.name = name;
    style.fontName = {
      family: 'Roboto Flex',
      style: role.weight === 700 ? 'Bold' : role.weight === 600 ? 'SemiBold' : 'Regular',
    };
    style.fontSize = role.size;
    style.lineHeight = { unit: 'PERCENT', value: role.lineHeight };
    style.letterSpacing = { unit: 'PIXELS', value: 0 };
    style.setBoundVariable('fontSize', byCss.get(`--dreadnought-font-size-${role.role}`));
    style.description = 'Matches typography.tokens.css; rem at root 16px; normal font width.';
    styleIds.push(style.id);
  }
  return styleIds;
}

export async function repairComponents(figma, page, byCss) {
  const sets = page
    .findAllWithCriteria({ types: ['COMPONENT_SET'] })
    .filter((s) => setNames.includes(s.name));
  uniqueMap(sets, (s) => s.name, 'Компоненты');
  const repaired = new Set(),
    warnings = [],
    opacitySamples = [],
    colorSamples = [];
  const token = (name) => {
    const variable = byCss.get('--dreadnought-' + name);
    if (!variable) throw new Error(`Нет токена ${name}`);
    return variable;
  };
  const paint = (name) =>
    figma.variables.setBoundVariableForPaint(
      { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
      'color',
      token(name),
    );
  const textNodes = sets.flatMap((s) => s.findAllWithCriteria({ types: ['TEXT'] }));
  const fontNames = new Map();
  for (const t of textNodes)
    for (const segment of t.getStyledTextSegments(['fontName']))
      fontNames.set(JSON.stringify(segment.fontName), segment.fontName);
  await Promise.all([...fontNames.values()].map((font) => figma.loadFontAsync(font)));
  let resolvedCollection;
  const derived = new Map();
  const cardSet = sets.find((set) => set.name === 'Dreadnought/Card');
  if (cardSet?.children.length) {
    const expression = token('card-padding').resolveForConsumer(cardSet.children[0]).value;
    const calculation =
      typeof expression === 'string' &&
      expression.match(/^calc\(\s*var\((--[\w-]+)\)\s*\*\s*([\d.]+)\s*\)$/);
    const base =
      calculation && byCss.get(calculation[1])?.resolveForConsumer(cardSet.children[0]).value;
    if (!calculation || typeof base !== 'number')
      throw new Error('Не поддерживается текущее выражение card-padding: ' + expression);
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    resolvedCollection = collections.find((c) => c.name === 'Dreadnought / Figma resolved');
    if (!resolvedCollection) {
      resolvedCollection = figma.variables.createVariableCollection('Dreadnought / Figma resolved');
      resolvedCollection.renameMode(resolvedCollection.defaultModeId, 'Default');
    }
    let padding = (await figma.variables.getLocalVariablesAsync()).find(
      (v) => v.variableCollectionId === resolvedCollection.id && v.name === 'Card/padding',
    );
    if (padding && padding.resolvedType !== 'FLOAT') throw new Error('Конфликт типа Card/padding');
    if (!padding)
      padding = figma.variables.createVariable('Card/padding', resolvedCollection, 'FLOAT');
    padding.scopes = ['GAP'];
    padding.setVariableCodeSyntax('WEB', 'var(--dreadnought-card-padding)');
    padding.setValueForMode(resolvedCollection.defaultModeId, base * Number(calculation[2]));
    padding.description = 'Resolved from ' + expression + '; resync after changing CSS tokens.';
    derived.set(padding.id, padding);
    for (const n of cardSet.children) {
      for (const area of n.children.filter((area) =>
        ['header', 'body', 'footer'].includes(area.name),
      )) {
        for (const field of ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'])
          area.setBoundVariable(
            field,
            /size=compact(,|$)/.test(n.name) ? token('card-compact-padding') : padding,
          );
        repaired.add(area.id);
      }
    }
  }
  const repairOpacity = createOpacityBinder(figma, { derived, samples: opacitySamples, repaired });
  const buttonVariants = new Map();
  function repairIconVectors(button, variant) {
    for (const slot of button.children.filter((n) => n.name === 'icon' || n.name === 'spinner')) {
      if (!('findAllWithCriteria' in slot)) continue;
      for (const vector of slot.findAllWithCriteria({ types: ['VECTOR'] })) {
        if (slot.name === 'spinner') vector.strokes = [paint(`button-${variant}-fg`)];
        else vector.fills = [paint(`button-${variant}-fg`)];
        repaired.add(vector.id);
        colorSamples.push({ id: vector.id, token: `button-${variant}-fg` });
      }
    }
  }
  for (const set of sets) {
    const buttonVariant = set.name.startsWith('Dreadnought/Button/') && set.name.split('/').pop();
    for (const n of set.children) {
      if (buttonVariant) {
        buttonVariants.set(n.id, buttonVariant);
        if (/state=(disabled|loading)(,|$)/.test(n.name))
          await repairOpacity(n, token('button-disabled-opacity'));
        n.clipsContent = false;
        repaired.add(n.id);
        repairIconVectors(n, buttonVariant);
        for (const ring of n.children.filter(
          (c) => c.type === 'RECTANGLE' && c.name === 'focus-ring',
        )) {
          const offset = token('button-focus-offset').resolveForConsumer(n).value;
          ring.resize(n.width + offset * 2, n.height + offset * 2);
          ring.x = -offset;
          ring.y = -offset;
          ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
          repaired.add(ring.id);
        }
      }
      if (set.name === 'Dreadnought/Input' && /state=disabled(,|$)/.test(n.name))
        await repairOpacity(n, token('input-disabled-opacity'));
      if (set.name === 'Dreadnought/Card') {
        for (const t of n.findAllWithCriteria({ types: ['TEXT'] })) {
          t.textAutoResize = 'HEIGHT';
          t.layoutSizingHorizontal = 'FILL';
          repaired.add(t.id);
        }
      }
    }
  }
  const reviews = page.children.filter((n) => n.type === 'FRAME' && reviewNames.includes(n.name));
  for (const root of reviews) {
    for (const frame of [root, ...root.findAllWithCriteria({ types: ['FRAME'] })]) {
      frame.clipsContent = false;
      repaired.add(frame.id);
    }
    for (const instance of root.findAllWithCriteria({ types: ['INSTANCE'] })) {
      const main = await instance.getMainComponentAsync();
      if (!main) continue;
      const variant = buttonVariants.get(main.id);
      if (variant) repairIconVectors(instance, variant);
      if (variant && /state=(disabled|loading)(,|$)/.test(main.name))
        await repairOpacity(instance, token('button-disabled-opacity'));
      if (main.parent?.name === 'Dreadnought/Input' && /state=disabled(,|$)/.test(main.name))
        await repairOpacity(instance, token('input-disabled-opacity'));
    }
  }
  for (const name of setNames)
    if (!sets.some((s) => s.name === name))
      warnings.push('Отсутствует существующий набор: ' + name);
  for (const name of reviewNames)
    if (!reviews.some((s) => s.name === name)) warnings.push('Отсутствует стенд: ' + name);
  return {
    repairedNodeIds: [...repaired],
    opacitySamples,
    colorSamples,
    warnings,
    derivedVariableIds: [...derived.values()].map((v) => v.id),
  };
}

export async function syncLibrary(figma, data, progress = () => {}, icons = null) {
  const page = await targetPage(figma);
  progress('Обновляю токены…');
  const tokens = await syncTokens(figma, data);
  progress('Обновляю типографику…');
  const styleIds = await syncTextStyles(figma, data, tokens.byCss);
  progress('Исправляю компоненты и стенды…');
  const repairs = await repairComponents(figma, page, tokens.byCss);
  const additions = icons ? await addComponents(figma, page, tokens.byCss, icons, progress) : null;
  const firstCreated = additions?.componentSets.find((set) => set.created);
  const reviewName = firstCreated
    ? firstCreated.name.replace('Dreadnought/', 'Dreadnought / ') + ' / Review'
    : additions
      ? 'Dreadnought / Checkbox / Review'
      : 'Dreadnought / Button / Review';
  const review = page.children.find((n) => n.name === reviewName);
  if (review) figma.viewport.scrollAndZoomIntoView([review]);
  return {
    tokens: tokens.byCss.size,
    styles: styleIds.length,
    pageId: page.id,
    createdVariableIds: tokens.createdVariableIds,
    changedVariableIds: tokens.changedVariableIds,
    createdCollectionIds: tokens.createdCollectionIds,
    styleIds,
    ...repairs,
    additions,
    visualVerification: 'pending — export PNG and inspect in Figma',
  };
}

export async function exportPreviews(figma, send, selected = false) {
  const page = await targetPage(figma);
  let frames = page.children.filter(
    (n) => n.type === 'FRAME' && [...reviewNames, ...componentReviewNames].includes(n.name),
  );
  if (selected) {
    const knownSets = new Set(componentSpecs.map((spec) => spec.name));
    frames = (page.selection || []).filter(
      (node) =>
        frames.includes(node) ||
        (node.type === 'COMPONENT_SET' && knownSets.has(node.name)) ||
        (node.type === 'COMPONENT' && knownSets.has(node.parent?.name)),
    );
    if (!frames.length)
      throw new Error('Выберите стенд Review или набор Dreadnought на странице «1 module».');
  }
  if (!frames.length) throw new Error('Стенды не найдены. Плагин не создаёт их заново.');
  for (const frame of frames) {
    const bytes = await frame.exportAsync({
      format: 'PNG',
      constraint: { type: 'SCALE', value: 1 },
    });
    send({
      name: frame.name.replaceAll(' / ', '-').replaceAll(' ', '_') + '.png',
      bytes: Array.from(bytes),
    });
  }
}
