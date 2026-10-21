import { syncLibrary, exportPreviews } from './sync.js';

if (!Object.hasOwn)
  Object.defineProperty(Object, 'hasOwn', {
    value: (object, key) => Object.prototype.hasOwnProperty.call(object, key),
  });

figma.showUI(__html__, { width: 440, height: 520, themeColors: true });
let busy = false;
let report;
const send = (message) => figma.ui.postMessage(message);
figma.ui.onmessage = async (message) => {
  if (
    !message ||
    !['sync', 'components', 'previews', 'selectedPreviews', 'report'].includes(message.type)
  )
    return;
  if (message.type === 'report') {
    if (report) send({ type: 'report', report });
    return;
  }
  if (busy) return;
  busy = true;
  send({ type: 'busy', value: true });
  try {
    if (message.type === 'sync' || message.type === 'components') {
      report = undefined;
      send({ type: 'reset' });
      report = await syncLibrary(
        figma,
        __TOKENS__,
        (status) => send({ type: 'status', status }),
        message.type === 'components' ? __ICONS__ : null,
      );
      send({ type: 'done', report });
    } else {
      await exportPreviews(
        figma,
        (image) => send({ type: 'image', ...image }),
        message.type === 'selectedPreviews',
      );
      send({ type: 'status', status: 'PNG переданы для сохранения.' });
    }
  } catch (error) {
    send({ type: 'error', error: error instanceof Error ? error.message : String(error) });
  } finally {
    busy = false;
    send({ type: 'busy', value: false });
  }
};
