import { getCheckableState } from '#behaviors/getCheckableState';
import type { RadioCore, RadioCoreOptions } from './RadioCore.ts';
export function getRadioState(options: RadioCoreOptions = {}): RadioCore { return getCheckableState(options); }
