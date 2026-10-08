import { StrictMode, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, Input } from '../../../../../ui/dist/react.js';
import { configureDreadnought } from '../../../../../ui/src/configureDreadnought.ts';
import { useAnchoredPopover } from '../../../src/shared/useAnchoredPopover.ts';

function Probe() {
  const anchor = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(true);
  const [version, setVersion] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const [check, setCheck] = useState('Not checked');
  const [styles, setStyles] = useState('Not checked');
  const [wide, setWide] = useState(true);
  useAnchoredPopover(open, anchor, popup);
  return (
    <>
      <h1>Native popover and CSS checks</h1>
      <button ref={anchor} key={version} onClick={() => setOpen(true)}>
        Anchor {version}
      </button>
      <output aria-label="React open">{String(open)}</output>
      <div
        ref={popup}
        popover="auto"
        hidden={!open}
        onToggle={(event) => {
          setEvents((previous) => [...previous, `${event.oldState}→${event.newState}`]);
          if (event.newState === 'closed') {
            setOpen(false);
          }
        }}
      >
        <p>Popover stays open when its anchor changes.</p>
        <button onClick={() => setVersion((previous) => previous + 1)}>Replace anchor</button>
        <button onClick={() => setCheck(String(open && popup.current?.matches(':popover-open')))}>
          Check popover
        </button>
      </div>
      <output aria-label="Popover invariant">{check}</output>
      <pre aria-label="Toggle events">{events.join('\n')}</pre>
      <h4 id="heading">Heading</h4>
      <p id="body">Body text</p>
      <Button id="base">Base button</Button>
      <div style={{ '--dreadnought-button-primary-bg': 'rgb(1 2 3 / 100%)' } as CSSProperties}>
        <div>
          <Button id="scoped">Scoped token button</Button>
        </div>
      </div>
      <style>{'.consumer-button { background: rgb(4 5 6 / 100%); }'}</style>
      <Button id="consumer" className="consumer-button">
        Consumer CSS button
      </Button>
      <Input id="input" aria-label="Field" />
      <button
        onClick={() => {
          configureDreadnought({ wideTypography: !wide });
          setWide(!wide);
        }}
      >
        Toggle wide typography
      </button>
      <button
        onClick={() => {
          const css = (id: string) => getComputedStyle(document.getElementById(id)!);
          const values = {
            fontFamily: css('base').fontFamily,
            fontSize: css('base').fontSize,
            fontWeight: css('base').fontWeight,
            lineHeight: css('base').lineHeight,
            headingVariation: css('heading').fontVariationSettings,
            buttonVariation: css('base').fontVariationSettings,
            bodyVariation: css('body').fontVariationSettings,
            inputVariation: css('input').fontVariationSettings,
            scopedBackground: css('scoped').backgroundColor,
            consumerBackground: css('consumer').backgroundColor,
          };
          const expectedVariation = wide ? '"wdth" 150' : 'normal';
          const failures = [
            !values.fontFamily.includes('Roboto Flex Variable') && 'font family',
            values.fontSize !== '16px' && 'button font size',
            values.fontWeight !== '600' && 'button font weight',
            values.lineHeight !== '20px' && 'button line height',
            values.headingVariation !== expectedVariation && 'heading variation',
            values.buttonVariation !== expectedVariation && 'button variation',
            values.bodyVariation !== 'normal' && 'body variation',
            values.inputVariation !== 'normal' && 'input variation',
            values.scopedBackground !== 'rgb(1, 2, 3)' && 'nested token override',
            values.consumerBackground !== 'rgb(4, 5, 6)' && 'consumer CSS layer',
          ].filter(Boolean);
          setStyles(
            JSON.stringify({ passed: failures.length === 0, failures, ...values }, null, 2),
          );
        }}
      >
        Check computed styles
      </button>
      <pre aria-label="Computed styles">{styles}</pre>
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Probe />
  </StrictMode>,
);
