export interface UploadFileMetadata {
  name: string;
  size: number;
  type: string;
}

export interface UploadConstraints {
  accept?: string;
  multiple?: boolean;
  maxCount?: number;
  maxSize?: number;
}

export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error' | 'canceled';

export interface UploadItemState {
  status: UploadStatus;
  progress?: number;
  error?: unknown;
}

export type UploadEvent =
  | { type: 'start' }
  | { type: 'retry' }
  | { type: 'progress'; value: number }
  | { type: 'success' }
  | { type: 'error'; error: unknown }
  | { type: 'cancel' };

export interface UploadRejection {
  index: number;
  reason: 'type' | 'size' | 'count';
}
