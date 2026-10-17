import { Progress } from '@dreadnought/ui/react';

export function ProgressStatusDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div>
        Все данные переданы; результат ещё проверяется.
        <Progress value={100} aria-label="Передача данных" />
      </div>
      <div>
        Файл успешно сохранён.
        <Progress value={100} status="success" aria-label="Загрузка завершена" />
      </div>
      <div>
        Соединение прервалось на 65%.
        <Progress value={65} status="error" aria-label="Ошибка загрузки" />
      </div>
    </div>
  );
}
