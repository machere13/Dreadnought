import styles from './Documentation.module.css';

export function PageHeading({ title, description }: { title: string; description: string }) {
  return <div className={styles.pageHeading}>
    <h1 className={styles.title}>{title}</h1>
    <p className={styles.lead}>{description}</p>
  </div>;
}
