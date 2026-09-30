import type { KnowledgeEntry } from './types';

const stop = new Set('как что это для или при из на в с и a an the how to do does can i use using of in on with is show configure create build сделать показать использовать настроить создать собрать работает ли'.split(' '));
const aliases: Record<string, string> = {
  пароль: 'password', пароля: 'password', паролем: 'password', парол: 'password',
  тема: 'theme', темы: 'theme', тему: 'theme', theming: 'theme', themes: 'theme',
  установка: 'install', установить: 'install', installation: 'install',
  кнопка: 'button', кнопки: 'button', кнопку: 'button',
  иконка: 'icon', иконки: 'icon', иконку: 'icon',
  загрузка: 'loading', загрузки: 'loading', ожидание: 'loading',
  отключить: 'disabled', отключение: 'disabled', недоступна: 'disabled',
  отступы: 'spacing', отступов: 'spacing', цвет: 'color', цвета: 'color',
  отступ: 'spacing', отступа: 'spacing',
  components: 'component', компонент: 'component', компоненты: 'component', компонента: 'component',
  свой: 'custom', собственный: 'custom', собственные: 'custom', собственная: 'custom', собственную: 'custom',
  закрепить: 'sticky', закрепление: 'sticky', заголовок: 'header', шапка: 'header', шапки: 'header',
};

function words(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}_@-]+/gu) ?? []).flatMap(word => word.includes('-') ? [word, ...word.split('-').filter(Boolean)] : [word])
    .filter(word => !stop.has(word)).map(word => aliases[word] ?? word);
}

/** Every meaningful query term needs evidence; a component name alone cannot justify an unrelated feature. */
export function searchKnowledge(entries: KnowledgeEntry[], query: string, limit = 8): KnowledgeEntry[] {
  const terms = [...new Set(words(query))];
  if (!terms.length || limit <= 0) return [];
  return entries.map(entry => {
    const title = new Set(words(entry.title));
    const keywords = new Set(words((entry.keywords ?? []).join(' ')));
    const body = new Set(words(`${entry.text} ${entry.code.join(' ')}`));
    let score = 0;
    for (const term of terms) {
      const value = title.has(term) ? 12 : keywords.has(term) ? 10 : body.has(term) ? 2 : 0;
      if (!value) return { entry, score: 0 };
      score += value;
    }
    return { entry, score: score + (entry.sourceKind === 'guide' ? 2 : 0) + (entry.id.includes(':react-ui:') ? 1 : 0) };
  }).filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.entry.id.localeCompare(b.entry.id))
    .slice(0, limit).map(result => result.entry);
}
