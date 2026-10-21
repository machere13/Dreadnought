import { syncLibrary, exportPreviews } from './sync.js';

figma.showUI(__html__, { width: 440, height: 520, themeColors: true });
let busy = false;
let report;
const send = (message) => figma.ui.postMessage(message);
figma.ui.onmessage = async (message) => {
  if (!message || !['sync', 'previews', 'report'].includes(message.type)) return;
  if (message.type === 'report') {
    if (report) send({ type: 'report', report });
    return;
  }
  if (busy) return;
  busy = true;
  send({ type: 'busy', value: true });
  try {
    if (message.type === 'sync') {
      report = undefined;
      send({ type: 'reset' });
      report = await syncLibrary(figma, __TOKENS__, (status) => send({ type: 'status', status }));
      send({ type: 'done', report });
    } else {
      await exportPreviews(figma, (image) => send({ type: 'image', ...image }));
      send({ type: 'status', status: 'PNG переданы для сохранения.' });
    }
  } catch (error) {
    send({ type: 'error', error: error instanceof Error ? error.message : String(error) });
  } finally {
    busy = false;
    send({ type: 'busy', value: false });
  }
};
