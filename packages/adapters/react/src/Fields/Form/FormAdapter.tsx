import type { FormAdapterProps } from './form.types.ts';

export function FormAdapter<V extends object>({
  form,
  onFinish,
  onSubmit,
  onReset,
  noValidate,
  ...props
}: FormAdapterProps<V>) {
  return (
    <form
      {...props}
      data-ui="form"
      aria-busy={form?.submitting || form?.validating || props['aria-busy'] || undefined}
      noValidate={form ? true : noValidate}
      onSubmit={(event) => {
        onSubmit?.(event);
        if (event.defaultPrevented || !form) return;
        event.preventDefault();
        void form.submit(onFinish);
      }}
      onReset={(event) => {
        onReset?.(event);
        if (event.defaultPrevented || !form) return;
        event.preventDefault();
        form.reset();
      }}
    />
  );
}
