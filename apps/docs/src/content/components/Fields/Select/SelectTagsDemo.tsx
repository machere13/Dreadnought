import { Badge, Button, Icon, Mark, Select } from '@dreadnought/ui/react';

const options = [
  { value: 'anna', label: 'Анна' },
  { value: 'boris', label: 'Борис', disabled: true },
  { value: 'vera', label: 'Вера' },
];

export function SelectTagsDemo() {
  return (
    <div>
      <p id="select-custom-tags-label">Участники с цветными маркерами</p>
      <Select
        multiple
        aria-labelledby="select-custom-tags-label"
        options={options}
        showSearch
        defaultValue={['anna', 'vera']}
        tagRender={(option, { disabled, removeLabel, onRemove }) => (
          <Badge
            appearance="outline"
            icon={<Mark color={option.value === 'anna' ? '#73c991' : '#86a9ff'} />}
          >
            {option.label}
            <Button
              type="button"
              variant="ghosted"
              size="compact"
              disabled={disabled}
              aria-label={removeLabel}
              icon={<Icon name="close" />}
              onClick={onRemove}
            />
          </Badge>
        )}
      />
    </div>
  );
}
