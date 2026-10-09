import { Button, Input, Modal } from '../src/adapters/react/index.ts';
import { ModalAdapter } from '@dreadnought/react/unstyled';
import { useModal } from '@dreadnought/react/logic';
import { getModalState } from '@dreadnought/core';
import { modalPresentation } from '../src/presentation/index.ts';

getModalState({ triggerId: 'trigger', panelId: 'modal', open: true });
export const Styled = (
  <Modal
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
  <ModalAdapter closeOnBackdrop={false} onCancel={(event) => event.preventDefault()} content="Text">
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
