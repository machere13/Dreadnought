import { useState } from 'react';
import { useToolbarItem } from '@dreadnought/react/logic';
import { Button, Toolbar } from '@dreadnought/ui/react';

function FormatButton({
  value,
  children,
  pressed,
  onClick,
}: {
  value: string;
  children: string;
  pressed?: boolean;
  onClick: () => void;
}) {
  const { itemProps } = useToolbarItem<HTMLButtonElement>({ value });
  return (
    <Button
      {...itemProps}
      type="button"
      size="compact"
      variant={pressed ? 'primary' : 'secondary'}
      aria-pressed={pressed}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

export function ToolbarFormatDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const format = [bold && 'жирное', italic && 'курсив'].filter(Boolean).join(', ') || 'обычное';
  return (
    <div>
      <Toolbar aria-label="Форматирование текста" style={{ flexWrap: 'wrap' }}>
        <FormatButton value="bold" pressed={bold} onClick={() => setBold((value) => !value)}>
          Жирный
        </FormatButton>
        <FormatButton value="italic" pressed={italic} onClick={() => setItalic((value) => !value)}>
          Курсив
        </FormatButton>
        <FormatButton
          value="reset"
          onClick={() => {
            setBold(false);
            setItalic(false);
          }}
        >
          Сбросить формат
        </FormatButton>
      </Toolbar>
      <p style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? 'italic' : 'normal' }}>
        Этот текст меняется после нажатия кнопок.
      </p>
      <p role="status">Начертание: {format}</p>
    </div>
  );
}
