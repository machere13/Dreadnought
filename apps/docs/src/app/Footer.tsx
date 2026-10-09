import { useEffect, useRef } from 'react';
import { Layout } from '@dreadnought/ui/react';
import styles from './DocsShell.module.css';

export function Footer() {
  const wordRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const word = wordRef.current!,
      container = word.parentElement!;
    let frame = 0;
    function fit() {
      if (!word.isConnected) return;
      const width = word.getBoundingClientRect().width,
        available = container.clientWidth;
      if (width > 0 && available > 0 && Math.abs(width - available) > 0.5) {
        word.style.fontSize = `${(parseFloat(getComputedStyle(word).fontSize) * available) / width}px`;
      }
    }
    function resize() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    }
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(resize);
    observer?.observe(container);
    observer?.observe(word);
    window.addEventListener('resize', resize);
    document.fonts?.ready.then(resize);
    fit();
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <Layout.Footer className={styles.footer}>
      <div className={styles.footerWidth}>
        <span ref={wordRef} className={styles.footerWord}>
          DREADNOUGHT
        </span>
      </div>
    </Layout.Footer>
  );
}
