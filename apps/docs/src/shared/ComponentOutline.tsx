import { useEffect, useState } from 'react';
import { Button, Icon } from '@dreadnought/ui/react';
import styles from './Documentation.module.css';
import type { ComponentDoc } from './types.ts';

export function ComponentOutline({
  component,
  examples,
}: {
  component: string;
  examples?: ComponentDoc['examples'];
}) {
  const [active, setActive] = useState(`${component}-overview`);
  const [expanded, setExpanded] = useState(false);
  const items = [
    { id: `${component}-overview`, title: 'Когда использовать' },
    { id: `${component}-example`, title: 'Примеры' },
    ...(examples ?? []).map((example) => ({
      id: `${component}-${example.id}`,
      title: example.title,
    })),
    { id: `${component}-api`, title: 'API' },
    { id: `${component}-layers`, title: 'Другие слои' },
  ];

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((target): target is HTMLElement => target !== null);
    let frame = 0;

    function update() {
      const header = document.querySelector('header');
      const offset = (header?.getBoundingClientRect().bottom ?? 0) + 24;
      let current = targets[0];
      for (const target of targets) {
        if (target.getBoundingClientRect().top <= offset) current = target;
      }
      if (current) setActive(current.id);
    }

    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('hashchange', schedule);
    };
  }, [component, examples]);

  return (
    <nav className={styles.outline} aria-label="На этой странице">
      <span className={styles.outlineTitle}>На этой странице</span>
      <Button
        className={styles.outlineToggle}
        variant="ghosted"
        size="compact"
        icon={<Icon name="down" />}
        iconPosition="end"
        aria-expanded={expanded}
        aria-controls={`${component}-outline`}
        onClick={() => setExpanded((value) => !value)}
      >
        На этой странице
      </Button>
      <ul id={`${component}-outline`} className={styles.outlineLinks} data-expanded={expanded}>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? 'location' : undefined}
              onClick={() => setActive(item.id)}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
