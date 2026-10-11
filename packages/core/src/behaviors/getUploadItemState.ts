import type { UploadEvent, UploadItemState } from './upload.types.ts';

export function getUploadItemState(state: UploadItemState, event: UploadEvent): UploadItemState {
  switch (event.type) {
    case 'start':
      return state.status === 'ready' ? { status: 'uploading' } : state;
    case 'retry':
      return state.status === 'error' || state.status === 'canceled'
        ? { status: 'uploading' }
        : state;
    case 'progress':
      if (state.status !== 'uploading' || !Number.isFinite(event.value)) return state;
      if (event.value < (state.progress ?? 0) || event.value > 100) return state;
      return { ...state, progress: event.value };
    case 'success':
      return state.status === 'uploading' ? { status: 'success', progress: 100 } : state;
    case 'error':
      return state.status === 'uploading'
        ? { ...state, status: 'error', error: event.error }
        : state;
    case 'cancel':
      return state.status === 'uploading' ? { ...state, status: 'canceled' } : state;
    default:
      throw new TypeError('Unknown upload event');
  }
}
