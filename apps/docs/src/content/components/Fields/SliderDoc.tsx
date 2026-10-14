import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { SliderVolumeDemo } from './SliderVolumeDemo.tsx';
import volumeCode from './SliderVolumeDemo.tsx?raw';
import { SliderRangeDemo } from './SliderRangeDemo.tsx';
import rangeCode from './SliderRangeDemo.tsx?raw';
import { SliderStepDemo } from './SliderStepDemo.tsx';
import stepCode from './SliderStepDemo.tsx?raw';
import { SliderMarksDemo } from './SliderMarksDemo.tsx';
import marksCode from './SliderMarksDemo.tsx?raw';
import { SliderVerticalDemo } from './SliderVerticalDemo.tsx';
import verticalCode from './SliderVerticalDemo.tsx?raw';
import { SliderDisabledDemo } from './SliderDisabledDemo.tsx';
import disabledCode from './SliderDisabledDemo.tsx?raw';

export const sliderDoc: ComponentDoc = {
  ...getCatalogDoc('slider'),
  title: 'Slider',
  description:
    'Выбирает число или диапазон на шкале. Перетаскивайте бегунки, нажимайте на шкалу или используйте клавиатуру. Подсказка показывает значение с нужной единицей измерения.',
  adapterDescription:
    'SliderAdapter создаёт шкалу и бегунки без оформления; useSlider управляет шагом, диапазоном, клавиатурой и перетаскиванием.',
  examples: [
    {
      id: 'volume',
      title: 'Одно значение: громкость',
      description:
        'Измените громкость от 0 до 100%: число над шкалой и подсказка обновятся вместе. value хранится в React, onValueChange принимает новое число. Стрелки меняют его на 1, Home и End выбирают края шкалы.',
      demo: <SliderVolumeDemo />,
      code: volumeCode,
    },
    {
      id: 'range',
      title: 'Диапазон цен',
      description:
        'Два бегунка задают цену от и до в пределах 0–100 ₽ с шагом 5 ₽. range возвращает пару чисел. Бегунки не пересекаются, но могут совпасть. В slotProps.thumb каждому задано своё доступное имя; клавиатура меняет только сфокусированный бегунок.',
      demo: <SliderRangeDemo />,
      code: rangeCode,
    },
    {
      id: 'step',
      title: 'Дробный шаг',
      description:
        'Коэффициент меняется от 0 до 1 с шагом 0.1. Сфокусируйте бегунок и нажмите стрелку вправо: 0.4 станет 0.5. min, max и step определяют допустимые значения; строка результата показывает принятое число.',
      demo: <SliderStepDemo />,
      code: stepCode,
    },
    {
      id: 'marks',
      title: 'Выбор только по отметкам',
      description:
        'Нажмите «Мало», «Средне» или «Много». step=null разрешает только значения marks: 0, 30 и 100. Стрелки переходят между соседними отметками, а не прибавляют единицу. Подпись и число в результате показывают один и тот же выбор.',
      demo: <SliderMarksDemo />,
      code: marksCode,
    },
    {
      id: 'vertical',
      title: 'Вертикальный диапазон',
      description:
        'Минимум расположен снизу, максимум — сверху. Здесь доступны только отметки 0, 30, 70 и 100. ArrowUp увеличивает значение, ArrowDown уменьшает; горизонтальные стрелки не меняют выбор. Высота задана через style.height, подсказки по умолчанию показываются справа.',
      demo: <SliderVerticalDemo />,
      code: verticalCode,
    },
    {
      id: 'disabled',
      title: 'Недоступная шкала',
      description:
        'disabled оставляет значение 50, но блокирует перетаскивание, нажатия и клавиатуру. Бегунок пропускается при обходе Tab. defaultValue задаёт начальное значение без управляемого состояния React.',
      demo: <SliderDisabledDemo />,
      code: disabledCode,
    },
  ],
  footnote:
    'Для диапазона задавайте отдельные имена бегункам через slotProps.thumb. step=null требует хотя бы одну отметку внутри min/max. tooltip=false отключает подсказки, tooltip.placement меняет их сторону. В форме диапазон передаёт два значения с одним name: читайте их через FormData.getAll(name). ref указывает на первый бегунок.',
};

export function SliderPage() {
  return <ComponentPage component="slider" doc={sliderDoc} />;
}
