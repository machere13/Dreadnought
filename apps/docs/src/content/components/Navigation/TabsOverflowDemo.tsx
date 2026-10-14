import { Tabs } from '@dreadnought/ui/react';

const sections = [
  { value: 'overview', label: 'Обзор' },
  { value: 'getting-started', label: 'Начало работы' },
  { value: 'components', label: 'Компоненты' },
  { value: 'theming', label: 'Оформление' },
  { value: 'accessibility', label: 'Доступность' },
  { value: 'api', label: 'API' },
  { value: 'examples', label: 'Примеры' },
  { value: 'faq', label: 'Вопросы' },
];

export function TabsOverflowDemo() {
  return (
    <div style={{ width: '100%', maxWidth: '24rem' }}>
      <Tabs defaultValue="overview">
        <Tabs.List aria-label="Разделы документа" moreLabel="Остальные разделы">
          {sections.map((section) => (
            <Tabs.Tab key={section.value} value={section.value}>
              {section.label}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {sections.map((section) => (
          <Tabs.Panel key={section.value} value={section.value}>
            Раздел: {section.label}
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
}
