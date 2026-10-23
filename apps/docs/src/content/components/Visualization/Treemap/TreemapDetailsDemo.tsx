import { Treemap } from '@dreadnought/ui/react';

const data = {
  id: 'disk',
  label: 'Хранилище',
  children: [
    {
      id: 'media',
      label: 'Медиафайлы',
      children: [
        { id: 'video', label: 'Записи встреч и обучающие видеоролики', value: 800 },
        { id: 'photos', label: 'Фотографии', value: 200 },
        { id: 'icon', label: 'Иконка приложения', value: 1 },
      ],
    },
    { id: 'docs', label: 'Документы', value: 250 },
    { id: 'archive', label: 'Пустой архив', children: [] },
  ],
};
const percent = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 2 });

export function TreemapDetailsDemo() {
  return (
    <Treemap
      label="Что занимает место"
      data={data}
      formatValue={(value) => `${value} МБ`}
      formatPercent={(value) => percent.format(value)}
    />
  );
}
