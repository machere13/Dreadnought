import styles from './Form.module.css';

export const formPresentation = {
  root: `dreadnought-form ${styles.form}`,
  field: `dreadnought-form-field ${styles.field}`,
} as const;
