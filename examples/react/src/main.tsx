import { createRoot } from 'react-dom/client';
import { useState } from 'react';
import { Button, Input, TextArea } from '@dreadnought/ui';
import { ButtonAdapter } from '@dreadnought/react/unstyled';
import { useButton } from '@dreadnought/react/logic';
import '@dreadnought/themes/default.css';
import './page.css';

function App() {
  const [count, setCount] = useState(0);
  const { buttonProps } = useButton({ onClick: () => setCount((value) => value + 1) });

  return (
    <main>
      <h1>Dreadnought: Button, Input, TextArea</h1>
      <section>
        <h2>Готовый компонент</h2>
        <div className="demo-row">
          <Button onClick={() => setCount((value) => value + 1)}>Нажать</Button>
          <Button disabled>Недоступна</Button>
          <Button loading>Загрузка</Button>
        </div>
      </section>
      <section className="other-theme">
        <h2>Своя тема</h2>
        <Button variant="secondary" onClick={() => setCount((value) => value + 1)}>Нажать</Button>
      </section>
      <section>
        <h2>Своя разметка</h2>
        <div className="demo-row">
          <ButtonAdapter className="custom-button" onClick={() => setCount((value) => value + 1)}>ButtonAdapter</ButtonAdapter>
          <button {...buttonProps} className="custom-button">useButton</button>
        </div>
      </section>
      <p aria-live="polite">Нажатий: {count}</p>
      <section>
        <h2>Текстовые поля</h2>
        <div className="demo-fields">
          <label htmlFor="demo-email">Электронная почта</label>
          <Input id="demo-email" type="email" placeholder="name@example.com" />
          <label htmlFor="demo-notes">Заметки</label>
          <TextArea id="demo-notes" rows={4} placeholder="Напишите что-нибудь" />
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
