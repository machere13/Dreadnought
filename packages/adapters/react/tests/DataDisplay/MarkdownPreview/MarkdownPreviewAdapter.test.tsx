import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { MarkdownPreviewAdapter } from '../../../src/DataDisplay/MarkdownPreview/index.ts';

afterEach(cleanup);

it('renders headings, GFM tables, lists and escaped code', () => {
  const { container } = render(
    <MarkdownPreviewAdapter
      value={'# Hello\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n~~gone~~\n\n- [x] Done\n\n`<script>`'}
      aria-label="Preview"
    />,
  );
  expect(screen.getByRole('heading', { name: 'Hello' })).toBeTruthy();
  expect(screen.getByRole('table')).toBeTruthy();
  expect(container.querySelector('del')?.textContent).toBe('gone');
  expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true);
  expect(container.querySelector('code')?.textContent).toBe('<script>');
});

it('skips raw HTML instead of executing it', () => {
  const { container } = render(
    <MarkdownPreviewAdapter
      value={'<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\nText'}
    />,
  );
  expect(container.querySelector('script,img')).toBeNull();
  expect(container.textContent).toContain('Text');
});

it.each([
  'javascript:alert%281%29',
  'JaVaScRiPt:alert%281%29',
  'vbscript:msgbox%281%29',
  'data:text/html,test',
  'javascript&#58;alert%281%29',
  'java&#9;script:alert%281%29',
])('removes unsafe URL %s', (url) => {
  const { container } = render(
    <MarkdownPreviewAdapter value={`[link](${url})\n\n![image](${url})`} />,
  );
  expect(container.querySelector('a')?.getAttribute('href')).toBeNull();
  expect(container.querySelector('img')?.getAttribute('src')).toBeNull();
});

it('allows normal links but not mailto images, and handles empty input', () => {
  const view = render(
    <MarkdownPreviewAdapter
      value={
        '[site](https://example.com) [mail](mailto:a@example.com) [local](./page) [anchor](#hello)\n\n![image](mailto:a@example.com)'
      }
    />,
  );
  expect(screen.getByRole('link', { name: 'site' }).getAttribute('href')).toBe(
    'https://example.com',
  );
  expect(screen.getByRole('link', { name: 'mail' }).getAttribute('href')).toBe(
    'mailto:a@example.com',
  );
  expect(screen.getByRole('link', { name: 'local' }).getAttribute('href')).toBe('./page');
  expect(screen.getByRole('link', { name: 'anchor' }).getAttribute('href')).toBe('#hello');
  expect(view.container.querySelector('img')?.getAttribute('src')).toBeNull();
  view.rerender(<MarkdownPreviewAdapter value="" />);
  expect(view.container.textContent).toBe('');
});
