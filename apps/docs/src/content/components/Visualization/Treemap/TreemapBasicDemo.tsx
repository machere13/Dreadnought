import { Treemap } from '@dreadnought/ui/react';

const data = {
  id: 'budget',
  label: 'Весь бюджет',
  children: [
    {
      id: 'product',
      label: 'Продукт',
      children: [
        {
          id: 'interfaces',
          label: 'Интерфейсы',
          children: [
            { id: 'web', label: 'Веб-приложение', value: 20 },
            { id: 'mobile', label: 'Мобильное приложение', value: 15 },
          ],
        },
        { id: 'backend', label: 'Backend', value: 25 },
      ],
    },
    {
      id: 'operations',
      label: 'Эксплуатация',
      children: [
        { id: 'infra', label: 'Инфраструктура', value: 25 },
        { id: 'support', label: 'Поддержка', value: 15 },
      ],
    },
  ],
};

export function TreemapBasicDemo() {
  return (
    <Treemap
      label="Бюджет команды"
      description="Распределение 100 тыс. ₽ по направлениям и проектам"
      data={data}
      formatValue={(value) => `${value} тыс. ₽`}
    />
  );
}
