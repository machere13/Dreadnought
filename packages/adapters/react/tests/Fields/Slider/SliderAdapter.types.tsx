import { createRef } from 'react';
import { SliderAdapter } from '@dreadnought/react/unstyled';
import { useSlider } from '@dreadnought/react/logic';

const valid = <SliderAdapter ref={createRef<HTMLDivElement>()} value={2} step={0.1} onValueChange={value => value.toFixed(1)}
  renderThumb={props => <div {...props} />} />;
const validRange = <SliderAdapter range value={[1, 2]} onValueChange={value => value[0].toFixed(1)}
  slotProps={{ thumb: [{ 'aria-label': 'From' }, { 'aria-label': 'To' }] }}
  renderThumb={(props, value, index) => <div {...props} data-index={index}>{value}</div>} />;
function Logic() { const slider = useSlider({ min: -2, max: 2 }); return <div {...slider.thumbProps} />; }
function RangeLogic() {
  const slider = useSlider({ range: true, value: [1, 2], onValueChange: value => value[1].toFixed(1) });
  const pair: [number, number] = slider.value;
  return <>{pair[0]}{slider.thumbs.map((thumb, index) => <div key={index} {...thumb.thumbProps} />)}</>;
}
// @ts-expect-error A single thumb takes one number.
const range = <SliderAdapter value={[1, 2]} />;
// @ts-expect-error Range mode requires a pair.
const scalarRange = <SliderAdapter range value={1} />;
// @ts-expect-error Range mode requires exactly two values.
const tripleRange = <SliderAdapter range value={[1, 2, 3]} />;
// @ts-expect-error Range callbacks receive a pair, not a single number.
const scalarCallback = <SliderAdapter range onValueChange={(value: number) => value.toFixed(1)} />;
// @ts-expect-error Only a finite numeric step is supported.
const anyStep = <SliderAdapter step="any" />;
// @ts-expect-error A div ref is incompatible with an SVG element ref.
const svgRef = <SliderAdapter ref={createRef<SVGSVGElement>()} />;
void [valid, validRange, Logic, RangeLogic, range, scalarRange, tripleRange, scalarCallback, anyStep, svgRef];
