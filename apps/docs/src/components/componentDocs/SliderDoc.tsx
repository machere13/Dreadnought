import { useState } from 'react';
import { Slider } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../data/catalog/getCatalogDoc';
import type { ComponentDoc } from './types';

function SliderDemo() {
  const [value, setValue] = useState(25);
  const [range, setRange] = useState<[number, number]>([20, 80]);
  return <div>
    <p>Громкость: {value}%</p>
    <Slider aria-label="Громкость" value={value} onValueChange={setValue} tooltip={{ formatter: next => `${next}%` }} />
    <p>Цена: {range[0]}–{range[1]} ₽</p>
    <Slider range value={range} onValueChange={setRange} step={5}
      slotProps={{ thumb: [{ 'aria-label': 'Цена от' }, { 'aria-label': 'Цена до' }] }}
      tooltip={{ formatter: next => `${next} ₽` }} />
    <p>Дробный шаг</p>
    <Slider aria-label="Дробное значение" min={0} max={1} step={0.1} defaultValue={0.4} />
    <p>Выбор только по отметкам</p>
    <Slider aria-label="Уровень" step={null} marks={{ 0: 'Мало', 30: 'Средне', 100: 'Много' }} defaultValue={30} />
    <p>Вертикальный диапазон с отметками</p>
    <Slider orientation="vertical" range step={null} marks={{ 0: '0', 30: '30', 70: '70', 100: '100' }}
      defaultValue={[30, 70]} slotProps={{ thumb: [{ 'aria-label': 'Вертикальный минимум' }, { 'aria-label': 'Вертикальный максимум' }] }} />
    <p>Недоступное управление</p>
    <Slider aria-label="Недоступное значение" disabled defaultValue={50} />
  </div>;
}

export const sliderDoc: ComponentDoc = {
  ...getCatalogDoc('slider'),
  title: 'Slider',
  description: 'Число или диапазон на горизонтальной или вертикальной шкале. Перетаскивайте бегунки или используйте стрелки; подсказки показывают принятые значения.',
  adapterDescription: 'useSlider связывает getSteppedValue, getSteppedRange, getNavigationDirection и getNextEnabledValue с формами и pointer capture. SliderAdapter создаёт разметку без стилей; Slider добавляет тему и общий Tooltip каждому бегунку.',
  footnote: 'range=true включает пару [от, до]. Бегунки не пересекаются, но могут совпадать; нажатие на шкалу или отметку двигает ближайший. marks задаёт значения и подписи; step=null разрешает только отметки, стрелки переключают между ними. Нужна хотя бы одна отметка внутри min/max. Подписи — текст или неинтерактивная разметка; плотные подписи потребитель сокращает. orientation=vertical: минимум снизу, максимум сверху; ArrowUp увеличивает, ArrowDown уменьшает, горизонтальные стрелки не перехватываются. Высота задаётся style.height или токеном --dreadnought-slider-vertical-height (по умолчанию 12rem). Tooltip по умолчанию справа, placement меняет его сторону. Горизонтальный режим LTR: ArrowRight/Up увеличивают, ArrowLeft/Down уменьшают. Home/End выбирают доступные края сфокусированного бегунка. Для формы используйте FormData.getAll(name). ref указывает на первый бегунок; slotProps.thumb принимает пару объектов с отдельными доступными названиями.',
  demo: <SliderDemo />,
};
