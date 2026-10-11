import { SwitchAdapter } from '@dreadnought/react/unstyled';
import type { SwitchAdapterProps } from '@dreadnought/react/unstyled';
import { switchPresentation } from '#presentation/Fields/Switch/switchPresentation.ts';
import { Loader } from '../../Feedback/Loader/Loader.tsx';

export type SwitchProps = SwitchAdapterProps;
export function Switch({ className, loading = false, slotProps, ...props }: SwitchProps) {
  return (
    <SwitchAdapter
      {...props}
      loading={loading}
      slotProps={{
        ...slotProps,
        indicator: {
          ...slotProps?.indicator,
          children: loading
            ? (slotProps?.indicator?.children ?? <Loader size="small" />)
            : slotProps?.indicator?.children,
        },
      }}
      className={[switchPresentation.root, className].filter(Boolean).join(' ')}
    />
  );
}
