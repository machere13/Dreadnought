import { Button, Drawer, Input } from '@dreadnought/ui/react';
import { DrawerAdapter } from '@dreadnought/react/unstyled';
import { useDrawer } from '@dreadnought/react/logic';
import { drawerPresentation } from '@dreadnought/ui';

export const Styled = (
  <Drawer
    placement="left"
    size={320}
    aria-label="Profile"
    className={drawerPresentation.root}
    content={({ close }) => (
      <>
        <Input aria-label="Name" />
        <Button onClick={close}>Done</Button>
      </>
    )}
  >
    {(trigger) => <Button {...trigger}>Edit</Button>}
  </Drawer>
);
export const Edges = (['right', 'left', 'top', 'bottom'] as const).map((placement) => (
  <Drawer key={placement} placement={placement} size="70vh" aria-label="Settings" content="Content">
    {(trigger) => <button {...trigger}>Open</button>}
  </Drawer>
));
export const Unstyled = (
  <DrawerAdapter aria-label="Settings" closeOnBackdrop={false} content="Text">
    {(trigger) => <button {...trigger}>Edit</button>}
  </DrawerAdapter>
);
export function Custom() {
  const drawer = useDrawer({ closeOnEscape: false });
  return (
    <>
      <button {...drawer.triggerProps}>Edit</button>
      <dialog {...drawer.contentProps} aria-label="Settings">
        <button type="button" onClick={drawer.close}>
          Done
        </button>
      </dialog>
    </>
  );
}
export const InvalidEdge = (
  // @ts-expect-error invalid edge
  <Drawer placement="middle" content="Text">
    {(trigger) => <button {...trigger}>Open</button>}
  </Drawer>
);
export const InvalidAdapter = (
  // @ts-expect-error presentation belongs to layer three
  <DrawerAdapter placement="left" content="Text">
    {(trigger) => <button {...trigger}>Open</button>}
  </DrawerAdapter>
);
export const InvalidSize = (
  // @ts-expect-error sizing belongs to layer three
  <DrawerAdapter size={320} content="Text">
    {(trigger) => <button {...trigger}>Open</button>}
  </DrawerAdapter>
);
function InvalidLogic() {
  // @ts-expect-error presentation belongs to layer three
  useDrawer({ placement: 'left' });
  // @ts-expect-error sizing belongs to layer three
  useDrawer({ size: 320 });
}
export { InvalidLogic };
