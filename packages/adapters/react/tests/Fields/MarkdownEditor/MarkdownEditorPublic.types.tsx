import { createRef } from 'react';
import { MarkdownEditorAdapter } from '@dreadnought/react/unstyled';
import { useMarkdownEditor } from '@dreadnought/react/logic';
const ref = createRef<HTMLTextAreaElement>();
const example = <MarkdownEditorAdapter ref={ref} value="hello" onValueChange={value => value.toUpperCase()}
  renderToolbar={({ execute }) => <button onClick={() => execute({ type: 'heading', level: 3 })}>Heading</button>} />;
// @ts-expect-error String values only.
const wrongValue = <MarkdownEditorAdapter value={1} />;
function Example() {
  const editor = useMarkdownEditor();
  editor.undo();
  editor.redo();
  editor.setPreview('live');
  // @ts-expect-error Heading levels come from core.
  editor.execute({ type: 'heading', level: 7 });
  return <textarea {...editor.textAreaProps} ref={editor.textAreaRef} />;
}
void example; void wrongValue; void Example;
