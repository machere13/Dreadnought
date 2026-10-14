import { Alert } from '@dreadnought/ui/react';

export function AlertTypesDemo() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Alert
        type="info"
        title="Плановое обслуживание"
        description="Сегодня с 22:00 до 23:00 загрузка файлов будет недоступна."
        showIcon
      />
      <Alert
        type="success"
        title="Профиль обновлён"
        description="Новые контактные данные сохранены."
        showIcon
      />
      <Alert
        type="warning"
        title="Мало свободного места"
        description="Освободите место перед загрузкой следующего файла."
        showIcon
      />
      <Alert
        type="error"
        title="Файл не загружен"
        description="Проверьте соединение и повторите попытку."
        showIcon
      />
    </div>
  );
}
