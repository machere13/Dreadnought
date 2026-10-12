import styles from './TimePicker.module.css';

export const timePickerPresentation = {
  root: `dreadnought-time-picker dreadnought-text-time-picker ${styles.root}`,
  slots: {
    field: styles.field,
    actions: styles.actions,
    popup: styles.popup,
    columns: styles.columns,
    column: styles.column,
    option: styles.option,
    footer: styles.footer,
    error: styles.error,
  },
} as const;
