import { useLayoutEffect, useRef, useState } from 'react';
import { getUploadItemState, getUploadSelection, pickFiles } from '@dreadnought/core';
import type { UploadEvent } from '@dreadnought/core';
import type { UploadItem, UseUploadOptions, UseUploadResult } from './upload.types.ts';
import { runUploadAttempt } from './runUploadAttempt.ts';

export function useUpload(options: UseUploadOptions = {}): UseUploadResult {
  getUploadSelection([], 0, options);
  if (options.autoUpload && !options.upload) {
    throw new TypeError('autoUpload requires an upload handler');
  }
  const [view, setView] = useState({
    items: [] as UploadItem[],
    rejections: [] as UseUploadResult['rejections'],
    picking: false,
    pickFailed: false,
    pickError: undefined as unknown,
  });
  const current = useRef(view);
  const settings = useRef(options);
  const mounted = useRef(true);
  const nextId = useRef(0);
  const active = useRef(new Map<string, AbortController>());
  const picker = useRef<AbortController | null>(null);

  function publish(next: typeof view) {
    current.current = next;
    if (mounted.current) setView(next);
  }

  function updateItem(id: string, event: UploadEvent) {
    const items = current.current.items.map((item) => {
      if (item.id !== id) return item;
      const next = getUploadItemState(item, event);
      if (next === item) return item;
      return { ...item, status: next.status, progress: next.progress, error: next.error };
    });
    publish({ ...current.current, items });
  }

  function invalidate(id: string) {
    const controller = active.current.get(id);
    active.current.delete(id);
    return controller;
  }

  function cancelPicker() {
    const controller = picker.current;
    picker.current = null;
    controller?.abort();
  }

  useLayoutEffect(() => {
    settings.current = options;
  });
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelPicker();
      const controllers = [...active.current.values()];
      active.current.clear();
      controllers.forEach((controller) => controller.abort());
    };
  }, []);

  async function send(id: string, event: 'start' | 'retry') {
    const handler = settings.current.upload;
    if (!mounted.current || settings.current.disabled || !handler) return;
    const item = current.current.items.find((item) => item.id === id);
    if (!item || active.current.has(id)) return;
    const next = getUploadItemState(item, { type: event });
    if (next === item) return;
    const controller = new AbortController();
    active.current.set(id, controller);
    updateItem(id, { type: event });
    const isCurrent = () =>
      mounted.current &&
      active.current.get(id) === controller &&
      !controller.signal.aborted &&
      current.current.items.some((item) => item.id === id);
    await runUploadAttempt(item.file, handler, controller, isCurrent, (update) =>
      updateItem(id, update),
    );
    if (active.current.get(id) === controller) active.current.delete(id);
  }

  function add(files: readonly File[]) {
    if (!mounted.current || settings.current.disabled) return;
    const selection = getUploadSelection(files, current.current.items.length, settings.current);
    const added: UploadItem[] = selection.accepted.map((index) => ({
      id: String(++nextId.current),
      file: files[index],
      status: 'ready',
    }));
    publish({
      ...current.current,
      items: [...current.current.items, ...added],
      rejections: selection.rejected.map(({ index, reason }) => ({ file: files[index], reason })),
    });
    if (settings.current.autoUpload)
      added.forEach((item) => {
        void send(item.id, 'start');
      });
  }

  async function pick() {
    if (!mounted.current || settings.current.disabled || picker.current) return;
    const controller = new AbortController();
    picker.current = controller;
    publish({ ...current.current, picking: true, pickFailed: false, pickError: undefined });
    try {
      const files = await pickFiles({
        accept: settings.current.accept,
        multiple: settings.current.multiple,
        signal: controller.signal,
      });
      if (mounted.current && picker.current === controller && files.length) add(files);
    } catch (error) {
      if (mounted.current && picker.current === controller) {
        publish({ ...current.current, pickFailed: true, pickError: error });
      }
    } finally {
      if (mounted.current && picker.current === controller) {
        picker.current = null;
        publish({ ...current.current, picking: false });
      }
    }
  }

  function cancel(id: string) {
    const controller = invalidate(id);
    updateItem(id, { type: 'cancel' });
    controller?.abort();
  }

  function remove(id: string) {
    const controller = invalidate(id);
    publish({ ...current.current, items: current.current.items.filter((item) => item.id !== id) });
    controller?.abort();
  }

  function clear() {
    const controllers = [...active.current.values()];
    active.current.clear();
    cancelPicker();
    publish({ items: [], rejections: [], picking: false, pickFailed: false, pickError: undefined });
    controllers.forEach((controller) => controller.abort());
  }

  return {
    ...view,
    disabled: options.disabled ?? false,
    canUpload: Boolean(options.upload),
    pick,
    add,
    cancel,
    remove,
    clear,
    start: (id) => send(id, 'start'),
    retry: (id) => send(id, 'retry'),
    async startAll() {
      const ids = current.current.items
        .filter((item) => item.status === 'ready')
        .map((item) => item.id);
      await Promise.all(ids.map((id) => send(id, 'start')));
    },
  };
}
