import { Slider } from '@dreadnought/ui/react';
const valid = <Slider tooltip={{ formatter: value => `${value}%`, placement: 'bottomRight', openDelay: 0 }} />;
const noTooltip = <Slider tooltip={false} />;
const validRange = <Slider range value={[20, 80]} onValueChange={value => value[1].toFixed()}
  tooltip={{ formatter: value => value.toFixed() }} />;
// @ts-expect-error Range values require range=true.
const range = <Slider value={[1, 2]} />;
// @ts-expect-error Range mode requires a pair.
const scalar = <Slider range value={1} />;
// @ts-expect-error Only Tooltip placements are accepted.
const placement = <Slider tooltip={{ placement: 'middle' }} />;
void [valid, noTooltip, validRange, range, scalar, placement];
