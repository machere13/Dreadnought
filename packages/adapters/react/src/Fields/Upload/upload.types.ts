import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { UploadConstraints, UploadItemState, UploadRejection } from '@dreadnought/core';

export type UploadHandler = (
  file: File,
  context: { signal: AbortSignal; onProgress(value: number): void },
) => Promise<void>;

export interface UseUploadOptions extends UploadConstraints {
  disabled?: boolean;
  autoUpload?: boolean;
  upload?: UploadHandler;
}

export interface UploadItem extends UploadItemState {
  id: string;
  file: File;
}

export interface UseUploadResult {
  items: readonly UploadItem[];
  rejections: readonly { file: File; reason: UploadRejection['reason'] }[];
  picking: boolean;
  pickFailed: boolean;
  pickError: unknown;
  disabled: boolean;
  canUpload: boolean;
  pick(): Promise<void>;
  add(files: readonly File[]): void;
  start(id: string): Promise<void>;
  startAll(): Promise<void>;
  cancel(id: string): void;
  retry(id: string): Promise<void>;
  remove(id: string): void;
  clear(): void;
}

export interface UploadActionRenderProps {
  action: 'pick' | 'start' | 'cancel' | 'retry' | 'remove';
  label: string;
  disabled: boolean;
  onClick(): void;
}

export type UploadSlotClassNames = Partial<
  Record<
    'root' | 'dropzone' | 'list' | 'item' | 'name' | 'status' | 'actions' | 'rejections',
    string
  >
>;

export type UploadAdapterProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  upload: UseUploadResult;
  label: string;
  dropzone?: boolean;
  slotClassNames?: UploadSlotClassNames;
  renderAction?: (props: UploadActionRenderProps) => ReactNode;
  renderProgress?: (item: UploadItem) => ReactNode;
};
