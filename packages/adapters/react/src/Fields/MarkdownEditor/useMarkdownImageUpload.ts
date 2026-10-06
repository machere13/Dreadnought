import { applyMarkdownCommand, pickFiles } from '@dreadnought/core';
import type { MarkdownDocument } from '@dreadnought/core';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { safeMarkdownUrl } from '../../DataDisplay/MarkdownPreview/safeMarkdownUrl.ts';
import type { MarkdownImageUploadState, UseMarkdownEditorOptions } from './markdownEditor.types.ts';

export function useMarkdownImageUpload(options: {
  uploadImage: UseMarkdownEditorOptions['uploadImage'];
  readDocument: () => MarkdownDocument | null;
  insert: (document: MarkdownDocument, result: MarkdownDocument) => void;
}) {
  const latest = useRef(options);
  const active = useRef<AbortController | null>(null);
  const [state, setState] = useState<{ status: MarkdownImageUploadState; error?: unknown }>({ status: 'idle' });
  useLayoutEffect(() => { latest.current = options; });
  useLayoutEffect(() => () => { const request = active.current; active.current = null; request?.abort(); }, []);

  const cancelImageUpload = useCallback(() => {
    const request = active.current;
    if (!request) return;
    active.current = null;
    setState({ status: 'idle' });
    request.abort();
  }, []);

  async function insertImage(file?: File) {
    const { uploadImage, readDocument, insert } = latest.current;
    const document = readDocument();
    if (!document || active.current) return;
    if (file && (!uploadImage || !file.type.startsWith('image/'))) return;
    if (!uploadImage) { insert(document, applyMarkdownCommand(document, { type: 'image' })); return; }
    const request = new AbortController();
    active.current = request;
    const valid = () => active.current === request && !request.signal.aborted
      && latest.current.readDocument()?.text === document.text;
    setState({ status: file ? 'uploading' : 'selecting' });
    try {
      const selected = file ?? (await pickFiles({ accept: 'image/*', signal: request.signal }))[0];
      if (!valid()) return;
      if (!selected) { setState({ status: 'idle' }); return; }
      setState({ status: 'uploading' });
      const result = await uploadImage(selected, { signal: request.signal });
      if (!valid()) return;
      const url = typeof result === 'string' ? safeMarkdownUrl(result, 'src') : undefined;
      if (!url) throw new TypeError('Image upload must return a safe, non-empty URL');
      const next = applyMarkdownCommand(document, { type: 'image', destination: url });
      active.current = null;
      setState({ status: 'idle' });
      latest.current.insert(document, next);
    } catch (error) {
      if (valid()) setState({ status: 'error', error });
    } finally {
      if (active.current === request) {
        if (!valid()) setState({ status: 'idle' });
        active.current = null;
      }
    }
  }
  return { insertImage, cancelImageUpload, imageUploadState: state.status, imageUploadError: state.error };
}
