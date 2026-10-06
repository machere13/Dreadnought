import { createRef } from 'react';
import { MarkdownEditorAdapter } from '@dreadnought/react/unstyled';
import { useMarkdownEditor } from '@dreadnought/react/logic';
import type { MarkdownImageUploadState } from '@dreadnought/react/logic';
const ref = createRef<HTMLTextAreaElement>();
const example = <MarkdownEditorAdapter ref={ref} value="hello" onValueChange={value => value.toUpperCase()}
  renderToolbar={({ execute }) => <button onClick={() => execute({ type: 'heading', level: 3 })}>Heading</button>} />;
// @ts-expect-error String values only.
const wrongValue = <MarkdownEditorAdapter value={1} />;
function Example() {
  const editor = useMarkdownEditor({ uploadImage: async (file, { signal }) => {
    const body = new FormData(); body.append('image', file);
    const response = await fetch('/api/images', { method: 'POST', body, signal });
    if (!response.ok) throw new Error('Upload failed');
    return '/image.png';
  } });
  const status: MarkdownImageUploadState = editor.imageUploadState;
  const upload: Promise<void> = editor.insertImage();
  const pastedUpload: Promise<void> = editor.insertImage(new File([], 'image.png', { type: 'image/png' }));
  // @ts-expect-error Direct image uploads accept File, not a URL.
  editor.insertImage('/image.png');
  editor.cancelImageUpload();
  void status; void upload; void pastedUpload;
  editor.undo();
  editor.redo();
  editor.setPreview('live');
  // @ts-expect-error Heading levels come from core.
  editor.execute({ type: 'heading', level: 7 });
  return <textarea {...editor.textAreaProps} ref={editor.textAreaRef} />;
}
// @ts-expect-error Uploaded destinations are strings.
const wrongUpload = <MarkdownEditorAdapter uploadImage={async () => 1} />;
void wrongUpload;
void example; void wrongValue; void Example;
