import { Slider } from '@dreadnought/ui/react';
const valid = <Slider tooltip={{ formatter: value => `${value}%`, placement: 'bottomRight', openDelay: 0 }} />;
const noTooltip = <Slider tooltip={false} />;
// @ts-expect-error Range mode is not supported.
const range = <Slider value={[1, 2]} />;
// @ts-expect-error Only Tooltip placements are accepted.
const placement = <Slider tooltip={{ placement: 'middle' }} />;
void [valid, noTooltip, range, placement];
