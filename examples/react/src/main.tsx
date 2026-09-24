import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Button } from '@dreadnought/ui';
import { ButtonBase } from '@dreadnought/react/unstyled';
import { useButton } from '@dreadnought/react/logic';
import '@dreadnought/themes/default.css';
import './page.css';

function App() {
  const [count, setCount] = useState(0);
  const { buttonProps } = useButton({ onClick: () => setCount((value) => value + 1) });

  return (
    <main>
      <h1>Dreadnought: Button</h1>
      <section>
        <h2>Готовый компонент</h2>
        <Button onClick={() => setCount((value) => value + 1)}>Нажать</Button>
        <Button disabled>Недоступна</Button>
        <Button loading>Загрузка</Button>
      </section>
      <section className="other-theme">
        <h2>Своя тема</h2>
        <Button variant="secondary" onClick={() => setCount((value) => value + 1)}>Нажать</Button>
      </section>
      <section>
        <h2>Своя разметка</h2>
        <ButtonBase className="custom-button" onClick={() => setCount((value) => value + 1)}>ButtonBase</ButtonBase>
        <button {...buttonProps} className="custom-button">useButton</button>
      </section>
      <p aria-live="polite">Нажатий: {count}</p>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
