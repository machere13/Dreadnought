import type { FormEvent } from 'react';

export function beforeInputEvent(event: InputEvent, currentTarget: HTMLTextAreaElement): FormEvent<HTMLTextAreaElement> {
  return {
    nativeEvent: event, currentTarget, target: event.target ?? currentTarget,
    bubbles: event.bubbles, cancelable: event.cancelable, defaultPrevented: event.defaultPrevented,
    eventPhase: event.eventPhase, isTrusted: event.isTrusted, timeStamp: event.timeStamp, type: event.type,
    preventDefault() { event.preventDefault(); this.defaultPrevented = event.defaultPrevented; },
    stopPropagation() { event.stopPropagation(); },
    isDefaultPrevented: () => event.defaultPrevented,
    isPropagationStopped: () => event.cancelBubble,
    persist() {},
  };
}
