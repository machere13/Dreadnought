import { useState } from 'react';
import { Slider } from '@dreadnought/ui/react';
import { getCatalogDoc } from '../../catalog/getCatalogDoc';
import type { ComponentDoc } from './types';

function SliderDemo() {
  const [value, setValue] = useState(25);
  return <div>
    <p>Громкость: {value}%</p>
    <Slider aria-label="Громкость" value={value} onValueChange={setValue} tooltip={{ formatter: next => `${next}%` }} />
    <p>Дробный шаг</p>
    <Slider aria-label="Дробное значение" min={0} max={1} step={0.1} defaultValue={0.4} />
    <p>Недоступное управление</p>
    <Slider aria-label="Недоступное значение" disabled defaultValue={50} />
  </div>;
}

export const sliderDoc: ComponentDoc = {
  ...getCatalogDoc('slider'),
  title: 'Slider',
  description: 'Одно число на горизонтальной шкале. Перетаскивайте бегунок или используйте стрелки; подсказка показывает принятое значение.',
  adapterDescription: 'useSlider связывает getSteppedValue и getNavigationDirection с формами и pointer capture. SliderAdapter создаёт разметку без стилей; Slider добавляет тему и общий Tooltip.',
  footnote: 'ArrowRight/Up увеличивают, ArrowLeft/Down уменьшают, Home/End выбирают края. onValueChange получает число. name/form и reset поддерживаются; ref указывает на бегунок. Пока один бегунок и направление LTR, без marks и range.',
  demo: <SliderDemo />,
};
