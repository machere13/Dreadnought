import { Progress } from '@dreadnought/ui/react';

export const States = <><Progress status="normal" /><Progress status="success" /><Progress status="error" /></>;
// @ts-expect-error unsupported visual status
export const InvalidStatus = <Progress status="warning" />;
// @ts-expect-error no arbitrary children
export const InvalidChildren = <Progress><button>Action</button></Progress>;
// @ts-expect-error core owns semantics
export const InvalidRole = <Progress role="button" />;
