import { Button, Input, Modal } from '@dreadnought/ui/react';
import { ModalAdapter } from '@dreadnought/react/unstyled';
import { useModal } from '@dreadnought/react/logic';
import { modalPresentation } from '@dreadnought/ui';

export const Styled = (
  <Modal
    mountPolicy="unmount"
    open={false}
    onOpenChange={() => {}}
    aria-label="Profile"
    title={<span>Profile</span>}
    footer={({ close }) => <Button onClick={close}>Save</Button>}
    closable
    closeLabel="Dismiss profile"
    closeIcon={<span>×</span>}
    className={modalPresentation.root}
    content={({ close }) => (
      <>
        <Input aria-label="Name" />
        <Button onClick={close}>Done</Button>
      </>
    )}
  >
    {(trigger) => <Button {...trigger}>Edit</Button>}
  </Modal>
);
export const Unstyled = (
  <ModalAdapter
    mountPolicy="lazy"
    closeOnBackdrop={false}
    onCancel={(event) => event.preventDefault()}
    content="Text"
  >
    {(trigger) => <button {...trigger}>Edit</button>}
  </ModalAdapter>
);
export function Custom() {
  const modal = useModal({ closeOnEscape: false });
  return (
    <>
      <button {...modal.triggerProps}>Edit</button>
      <dialog {...modal.contentProps}>
        <button type="button" onClick={modal.close}>
          Done
        </button>
      </dialog>
    </>
  );
}

export const InvalidPolicy = (
  // @ts-expect-error Only supported content policies are accepted.
  <Modal mountPolicy="destroy" content="Text">
    {(trigger) => <Button {...trigger}>Open</Button>}
  </Modal>
);
