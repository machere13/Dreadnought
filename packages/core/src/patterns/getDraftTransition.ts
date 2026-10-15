export type DraftAction<Value, Draft> =
  { type: 'edit'; draft: Draft } | { type: 'confirm'; value: Value } | { type: 'cancel' };

export interface DraftTransitionOptions<Value, Draft> {
  format: (value: Value) => Draft;
  controlled?: boolean;
  isEqual?: (left: Value, right: Value) => boolean;
}

export interface DraftTransition<Value, Draft> {
  value: Value;
  draft: Draft;
  changed: boolean;
}

export function getDraftTransition<Value, Draft>(
  value: Value,
  action: DraftAction<Value, Draft>,
  options: DraftTransitionOptions<Value, Draft>,
): DraftTransition<Value, Draft> {
  if (action.type === 'edit') {
    return { value, draft: action.draft, changed: false };
  }
  if (action.type === 'cancel') {
    return { value, draft: options.format(value), changed: false };
  }
  const accepted = options.controlled ? value : action.value;
  const isEqual = options.isEqual ?? Object.is;
  return {
    value: accepted,
    draft: options.format(accepted),
    changed: !isEqual(value, action.value),
  };
}
