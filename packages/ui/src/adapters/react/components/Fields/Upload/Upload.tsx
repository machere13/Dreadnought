import { UploadAdapter } from '@dreadnought/react/unstyled';
import type { UploadAdapterProps, UploadActionRenderProps } from '@dreadnought/react/unstyled';
import { Button } from '../../Controls/Button/Button.tsx';
import { Icon } from '../../DataDisplay/Icon/Icon.tsx';
import { Loader } from '../../Feedback/Loader/Loader.tsx';
import { Progress } from '../../Feedback/Progress/Progress.tsx';
import { uploadPresentation } from '#presentation/Fields/Upload/uploadPresentation.ts';

export type UploadProps = Omit<UploadAdapterProps, 'renderAction' | 'renderProgress'>;

function UploadAction({ action, label, disabled, onClick }: UploadActionRenderProps) {
  if (action === 'pick' || action === 'start') {
    return (
      <Button type="button" size="compact" disabled={disabled} onClick={onClick}>
        {label}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      size="compact"
      variant="ghosted"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      icon={<Icon name={action === 'retry' ? 'redo' : 'close'} />}
    />
  );
}

export function Upload({ className, ...props }: UploadProps) {
  return (
    <UploadAdapter
      {...props}
      className={[uploadPresentation.root, className].filter(Boolean).join(' ')}
      renderAction={(action) => <UploadAction {...action} />}
      renderProgress={(item) =>
        item.progress === undefined ? (
          <Loader label={`Загрузка ${item.file.name}`} />
        ) : (
          <Progress value={item.progress} aria-label={`Загрузка ${item.file.name}`} />
        )
      }
    />
  );
}
