import { createRef } from 'react';
import { SliderAdapter } from '@dreadnought/react/unstyled';
import { useSlider } from '@dreadnought/react/logic';

const valid = <SliderAdapter ref={createRef<HTMLDivElement>()} value={2} step={0.1} onValueChange={value => value.toFixed(1)}
  renderThumb={props => <div {...props} />} />;
function Logic() { const slider = useSlider({ min: -2, max: 2 }); return <div {...slider.thumbProps} />; }
// @ts-expect-error A single thumb takes one number.
const range = <SliderAdapter value={[1, 2]} />;
// @ts-expect-error Only a finite numeric step is supported.
const anyStep = <SliderAdapter step="any" />;
// @ts-expect-error A div ref is incompatible with an SVG element ref.
const svgRef = <SliderAdapter ref={createRef<SVGSVGElement>()} />;
void [valid, Logic, range, anyStep, svgRef];
