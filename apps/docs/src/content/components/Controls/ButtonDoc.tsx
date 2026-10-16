import { getCatalogDoc } from '../../../data/catalog/getCatalogDoc.ts';
import type { ComponentDoc } from '../../../shared/types.ts';
import { ComponentPage } from '../../../shared/ComponentPage.tsx';
import { ButtonVariantsDemo } from './ButtonVariantsDemo.tsx';
import variantsCode from './ButtonVariantsDemo.tsx?raw';
import { ButtonSizesDemo } from './ButtonSizesDemo.tsx';
import sizesCode from './ButtonSizesDemo.tsx?raw';
import { ButtonIconsDemo } from './ButtonIconsDemo.tsx';
import iconsCode from './ButtonIconsDemo.tsx?raw';
import { ButtonLoadingDemo } from './ButtonLoadingDemo.tsx';
import loadingCode from './ButtonLoadingDemo.tsx?raw';
import { ButtonFormDemo } from './ButtonFormDemo.tsx';
import formCode from './ButtonFormDemo.tsx?raw';
import { ButtonLinkDemo } from './ButtonLinkDemo.tsx';
import linkCode from './ButtonLinkDemo.tsx?raw';

export const buttonDoc: ComponentDoc = {
  ...getCatalogDoc('button'),
  title: 'Button',
  usage:
    'Для действия, отправки формы или перехода по ссылке. Если нужно выбрать значение, используйте Checkbox, Radio или Select.',
  primaryProps: ['variant', 'size', 'icon', 'iconPosition', 'loading', 'disabled', 'href'],
  description: 'Кнопка действия, отправки формы или перехода по ссылке.',
  adapterDescription:
    'Адаптер создаёт нативный button или a и сохраняет поведение без оформления темы.',
  notes: [
    'Без href поддерживаются нативные свойства button, включая type="submit" и type="reset".',
    'С href создаётся ссылка; type для неё не задавайте.',
    'loading блокирует активацию с сохранением фокуса, disabled отключает контроль.',
    'Для кнопки без текста задавайте aria-label.',
  ],
  examples: [
    {
      id: 'variants',
      title: 'Варианты оформления',
      description:
        'Все четыре кнопки увеличивают один счётчик. variant меняет только оформление: primary — основное действие, secondary — вторичное, outlined — с рамкой, ghosted — без фона.',
      demo: <ButtonVariantsDemo />,
      code: variantsCode,
    },
    {
      id: 'sizes',
      title: 'Обычная и компактная кнопка',
      description:
        'Сравните высоту и отступы двух кнопок. Нажмите любую: под ними появится выбранный размер. size="compact" подходит для плотных панелей и небольших действий.',
      demo: <ButtonSizesDemo />,
      code: sizesCode,
    },
    {
      id: 'icons',
      title: 'Иконка с текстом или без него',
      description:
        'Переключите закладку кнопкой только с иконкой либо добавьте/удалите её подписанными кнопками. aria-label даёт имя кнопке без текста; iconPosition="end" помещает иконку после надписи.',
      demo: <ButtonIconsDemo />,
      code: iconsCode,
    },
    {
      id: 'loading',
      title: 'Загрузка и недоступность',
      description:
        'Нажмите «Сохранить изменения»: операция имитируется в течение секунды, затем счётчик сохранений увеличится. Повторные нажатия во время loading блокируются, но фокус остаётся на кнопке. disabled-кнопка недоступна и для Tab.',
      demo: <ButtonLoadingDemo />,
      code: loadingCode,
    },
    {
      id: 'form',
      title: 'Отправка и сброс формы',
      description:
        'Введите имя и нажмите «Отправить форму» либо Enter в поле. Отправленное имя появится под формой; пустое поле блокирует отправку. «Очистить форму» сбрасывает поле и результат. Здесь нет запроса к серверу.',
      demo: <ButtonFormDemo />,
      code: formCode,
    },
    {
      id: 'link',
      title: 'Кнопка как ссылка',
      description:
        'Нажмите ссылку: адрес страницы изменится на #button-link-target и браузер перейдёт к тексту ниже. href создаёт нативный <a>, а не кнопку с обработчиком перехода.',
      demo: <ButtonLinkDemo />,
      code: linkCode,
    },
  ],
};

export function ButtonPage() {
  return <ComponentPage component="button" doc={buttonDoc} />;
}
