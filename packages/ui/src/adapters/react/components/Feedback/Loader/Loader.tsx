import { LoaderAdapter, type LoaderAdapterProps } from '@dreadnought/react/unstyled';
import { loaderPresentation } from '#presentation/Feedback/Loader/loaderPresentation.ts';

export type LoaderProps = LoaderAdapterProps & { size?: 'small' | 'default' | 'large' };

export function Loader({ size = 'default', indicator, slotClassNames, className, ...props }: LoaderProps) {
  const slots = {
    indicator: [loaderPresentation.indicator, slotClassNames?.indicator].filter(Boolean).join(' '),
    graphic: [loaderPresentation.graphic, slotClassNames?.graphic].filter(Boolean).join(' '),
    label: [loaderPresentation.label, slotClassNames?.label].filter(Boolean).join(' '),
    content: [loaderPresentation.content, slotClassNames?.content].filter(Boolean).join(' '),
  };
  return <LoaderAdapter {...props} indicator={indicator} data-size={size} data-custom-indicator={indicator != null || undefined}
    slotClassNames={slots} className={[loaderPresentation.root, className].filter(Boolean).join(' ')} />;
}
