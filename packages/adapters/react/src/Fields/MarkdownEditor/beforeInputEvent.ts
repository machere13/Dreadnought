import type { InputEvent as ReactInputEvent } from 'react';

export function beforeInputEvent(
  event: InputEvent,
  currentTarget: HTMLTextAreaElement,
): ReactInputEvent<HTMLTextAreaElement> {
  return {
    nativeEvent: event,
    data: event.data ?? '',
    currentTarget,
    target: event.target ?? currentTarget,
    bubbles: event.bubbles,
    cancelable: event.cancelable,
    defaultPrevented: event.defaultPrevented,
    eventPhase: event.eventPhase,
    isTrusted: event.isTrusted,
    timeStamp: event.timeStamp,
    type: event.type,
    preventDefault() {
      event.preventDefault();
      this.defaultPrevented = event.defaultPrevented;
    },
    stopPropagation() {
      event.stopPropagation();
    },
    isDefaultPrevented: () => event.defaultPrevented,
    isPropagationStopped: () => event.cancelBubble,
    persist() {},
  };
}
