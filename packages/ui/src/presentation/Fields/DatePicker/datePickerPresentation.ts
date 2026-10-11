import styles from './DatePicker.module.css';

export const datePickerPresentation = {
  root: `dreadnought-date-picker dreadnought-text-date-picker ${styles.root}`,
  slots: {
    fields: styles.fields,
    field: styles.field,
    actions: styles.actions,
    popup: styles.popup,
    header: styles.header,
    grid: styles.grid,
    day: styles.day,
    error: styles.error,
  },
} as const;
