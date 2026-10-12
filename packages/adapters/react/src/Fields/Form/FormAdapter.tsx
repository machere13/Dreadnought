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
        const submitter = (event.nativeEvent as SubmitEvent).submitter as
          HTMLButtonElement | HTMLInputElement | null;
        if (!noValidate && !submitter?.formNoValidate) {
          const invalid = Array.from(event.currentTarget.elements).find(
            (control): control is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement =>
              (control instanceof HTMLInputElement ||
                control instanceof HTMLTextAreaElement ||
                control instanceof HTMLSelectElement) &&
              control.willValidate &&
              control.validity.customError,
          );
          if (invalid) {
            invalid.reportValidity();
            return;
          }
        }
        void form.submit(onFinish);
      }}
      onReset={(event) => {
        onReset?.(event);
        if (event.defaultPrevented || !form) return;
        form.reset();
      }}
    />
  );
}
